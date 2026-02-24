import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { generateTokenPair, verifyRefreshToken } from '../lib/jwt.js';
import { generateOTP, hashOTP, verifyOTP, OTP_EXPIRY_MS, OTP_COOLDOWN_MS, MAX_OTP_ATTEMPTS } from '../lib/otp.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../lib/email.js';
import { isValidEmail, validatePassword, sanitizeEmail } from '../lib/validators.js';

const BCRYPT_SALT_ROUNDS = 12;

// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

/**
 * POST /api/auth/signup
 * Register a new user and send OTP for email verification
 */
export const signup = async (req, res, next) => {
  try {
    const { email: rawEmail, password, fullName } = req.body;

    if (!rawEmail || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    const email = sanitizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address',
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(409).json({
          status: 'error',
          message: 'An account with this email already exists',
        });
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      const otp = generateOTP();
      const otpHash = hashOTP(otp);

      await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          otp: otpHash,
          otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
          otpAttempts: 0,
          otpLastSentAt: new Date(),
        },
      });

      // Ensure Profile exists for the unverified user
      if (!existingUser.profile) {
        await prisma.profile.create({
          data: {
            id: existingUser.id,
            username: existingUser.id,
            fullName: fullName || null,
          },
        });
      } else if (fullName && !existingUser.profile.fullName) {
        await prisma.profile.update({
          where: { id: existingUser.id },
          data: { fullName },
        });
      }

      await sendOTPEmail(email, otp);

      return res.status(200).json({
        status: 'success',
        message: 'Verification code sent to your email',
        data: { email, requiresVerification: true },
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    const userId = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        passwordHash,
        otp: otpHash,
        otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        otpAttempts: 0,
        otpLastSentAt: new Date(),
        profile: {
          create: {
            username: userId,
            fullName: fullName || null,
            role: 'CREATOR',
          }
        }
      },
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({
      status: 'success',
      message: 'Account created. Verification code sent to your email',
      data: { email: user.email, requiresVerification: true },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify email with OTP code — sends welcome email on success
 */
export const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email: rawEmail, otp } = req.body;

    if (!rawEmail || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and OTP are required',
      });
    }

    const email = sanitizeEmail(rawEmail);

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP must be a 6-digit number',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email or OTP',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified',
      });
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many failed attempts. Please request a new verification code',
      });
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code has expired. Please request a new one',
      });
    }

    const isValid = verifyOTP(otp, user.otp);

    if (!isValid) {
      await prisma.user.update({
        where: { email },
        data: { otpAttempts: { increment: 1 } },
      });

      const remaining = MAX_OTP_ATTEMPTS - (user.otpAttempts + 1);
      return res.status(400).json({
        status: 'error',
        message: `Invalid verification code. ${remaining} attempt(s) remaining`,
      });
    }

    let updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        otp: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
      include: { profile: true },
    });

    if (!updatedUser.profile) {
      const newProfile = await prisma.profile.create({
        data: {
          id: updatedUser.id,
          username: updatedUser.id,
          role: 'CREATOR',
        },
      });
      // Attach it for token generation
      updatedUser.profile = newProfile;
    }

    const { accessToken, refreshToken } = generateTokenPair(updatedUser, updatedUser.profile?.role || 'USER');

    await prisma.user.update({
      where: { id: updatedUser.id },
      data: { refreshToken: hashOTP(refreshToken) },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    // Send welcome email (non-blocking — failure won't affect the response)
    sendWelcomeEmail(email, updatedUser.profile?.fullName).catch(() => {});

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          isEmailVerified: true,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email: rawEmail } = req.body;

    if (!rawEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    const email = sanitizeEmail(rawEmail);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.isEmailVerified) {
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, a new code has been sent',
      });
    }

    if (user.otpLastSentAt) {
      const timeSinceLastSend = Date.now() - new Date(user.otpLastSentAt).getTime();
      if (timeSinceLastSend < OTP_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - timeSinceLastSend) / 1000);
        return res.status(429).json({
          status: 'error',
          message: `Please wait ${waitSeconds} seconds before requesting a new code`,
        });
      }
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    await prisma.user.update({
      where: { email },
      data: {
        otp: otpHash,
        otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        otpAttempts: 0,
        otpLastSentAt: new Date(),
      },
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({
      status: 'success',
      message: 'If an account exists with this email, a new code has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    const email = sanitizeEmail(rawEmail);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    if (!user.isEmailVerified) {
      const otp = generateOTP();
      const otpHash = hashOTP(otp);

      await prisma.user.update({
        where: { email },
        data: {
          otp: otpHash,
          otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
          otpAttempts: 0,
          otpLastSentAt: new Date(),
        },
      });

      await sendOTPEmail(email, otp);

      return res.status(403).json({
        status: 'error',
        message: 'Email not verified. A new verification code has been sent',
        data: { email, requiresVerification: true },
      });
    }

    // Ensure Profile exists for backwards compatibility
    if (!user.profile) {
      await prisma.profile.create({
        data: {
          id: user.id,
          username: user.id,
          role: 'CREATOR',
        },
      });
    }

    const { accessToken, refreshToken } = generateTokenPair(user, user.profile?.role || 'USER');

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashOTP(refreshToken) },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token provided',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true },
    });

    if (!user || !user.refreshToken) {
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
      });
    }

    const storedTokenValid = verifyOTP(refreshToken, user.refreshToken);
    if (!storedTokenValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token has been revoked. Please log in again',
      });
    }

    const newTokens = generateTokenPair(user, user.profile?.role || 'USER');

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashOTP(newTokens.refreshToken) },
    });

    res.cookie('refreshToken', newTokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: newTokens.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { refreshToken: null },
        });
      } catch {
        // Token invalid, just clear cookie
      }
    }

    res.clearCookie('refreshToken', { path: '/' });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        profile: {
          select: {
            username: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            plan: true,
            streakCount: true,
            longestStreak: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─── FORGOT PASSWORD FLOW ──────────────────────

/**
 * POST /api/auth/forgot-password
 * Send a password reset OTP to the user's email
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email: rawEmail } = req.body;

    if (!rawEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    const email = sanitizeEmail(rawEmail);

    // Always return the same message to prevent email enumeration
    const successResponse = {
      status: 'success',
      message: 'If an account exists with this email, a password reset code has been sent',
    };

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if the user doesn't exist or isn't verified
    if (!user || !user.isEmailVerified) {
      return res.status(200).json(successResponse);
    }

    // Check cooldown
    if (user.otpLastSentAt) {
      const timeSinceLastSend = Date.now() - new Date(user.otpLastSentAt).getTime();
      if (timeSinceLastSend < OTP_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - timeSinceLastSend) / 1000);
        return res.status(429).json({
          status: 'error',
          message: `Please wait ${waitSeconds} seconds before requesting a new code`,
        });
      }
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otpHash,
        resetOtpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        resetOtpAttempts: 0,
        otpLastSentAt: new Date(),
      },
    });

    await sendPasswordResetEmail(email, otp);

    res.status(200).json(successResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Verify the reset OTP and set a new password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email: rawEmail, otp, newPassword } = req.body;

    if (!rawEmail || !otp || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, OTP, and new password are required',
      });
    }

    const email = sanitizeEmail(rawEmail);

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP must be a 6-digit number',
      });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email or code',
      });
    }

    // Check attempts
    if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many failed attempts. Please request a new reset code',
      });
    }

    // Check expiry
    if (!user.resetOtp || !user.resetOtpExpiresAt || new Date() > user.resetOtpExpiresAt) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset code has expired. Please request a new one',
      });
    }

    const isValid = verifyOTP(otp, user.resetOtp);

    if (!isValid) {
      await prisma.user.update({
        where: { email },
        data: { resetOtpAttempts: { increment: 1 } },
      });

      const remaining = MAX_OTP_ATTEMPTS - (user.resetOtpAttempts + 1);
      return res.status(400).json({
        status: 'error',
        message: `Invalid reset code. ${remaining} attempt(s) remaining`,
      });
    }

    // OTP valid — hash new password and clear reset fields
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        resetOtp: null,
        resetOtpExpiresAt: null,
        resetOtpAttempts: 0,
        // Invalidate existing sessions for security
        refreshToken: null,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can now log in with your new password',
    });
  } catch (error) {
    next(error);
  }
};
