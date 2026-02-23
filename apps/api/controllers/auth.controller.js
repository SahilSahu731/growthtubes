import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateTokenPair, verifyRefreshToken } from '../lib/jwt.js';
import { generateOTP, hashOTP, verifyOTP, OTP_EXPIRY_MS, OTP_COOLDOWN_MS, MAX_OTP_ATTEMPTS } from '../lib/otp.js';
import { sendOTPEmail } from '../lib/email.js';
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

    // Validate inputs
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
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

      await sendOTPEmail(email, otp);

      return res.status(200).json({
        status: 'success',
        message: 'Verification code sent to your email',
        data: { email, requiresVerification: true },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        otp: otpHash,
        otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        otpAttempts: 0,
        otpLastSentAt: new Date(),
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
 * Verify email with OTP code
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

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        otp: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
      include: { profile: true },
    });

    const { accessToken, refreshToken } = generateTokenPair(updatedUser, updatedUser.profile?.role || 'USER');

    await prisma.user.update({
      where: { id: updatedUser.id },
      data: { refreshToken: hashOTP(refreshToken) },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

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

    // Don't reveal if user exists
    if (!user || user.isEmailVerified) {
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, a new code has been sent',
      });
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

    // Generate new OTP
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

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Send a new OTP automatically
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
      // Try to decode and invalidate the token in DB
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
