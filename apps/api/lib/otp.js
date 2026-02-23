import crypto from 'crypto';

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export const generateOTP = () => {
  // crypto.randomInt is cryptographically secure
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
};

/**
 * Hash an OTP using SHA-256 (never store OTP in plaintext)
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP against stored hash
 */
export const verifyOTP = (inputOtp, storedHash) => {
  const inputHash = hashOTP(inputOtp);
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(inputHash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch {
    return false;
  }
};

/**
 * OTP expiry duration in milliseconds (10 minutes)
 */
export const OTP_EXPIRY_MS = 30 * 60 * 1000;

/**
 * Cooldown between OTP sends in milliseconds (60 seconds)
 */
export const OTP_COOLDOWN_MS = 60 * 1000;

/**
 * Maximum OTP verification attempts before lockout
 */
export const MAX_OTP_ATTEMPTS = 5;
