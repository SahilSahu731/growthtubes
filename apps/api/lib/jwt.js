import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  console.error('⚠️  JWT secrets not found in environment variables!');
}

/**
 * Generate a short-lived access token (15 minutes)
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
    issuer: 'growthtubes-api',
    audience: 'growthtubes-web',
  });
};

/**
 * Generate a long-lived refresh token (7 days)
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
    issuer: 'growthtubes-api',
    audience: 'growthtubes-web',
  });
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET, {
    issuer: 'growthtubes-api',
    audience: 'growthtubes-web',
  });
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET, {
    issuer: 'growthtubes-api',
    audience: 'growthtubes-web',
  });
};

/**
 * Generate both tokens for a user
 */
export const generateTokenPair = (user, role = 'USER') => {
  const payload = {
    userId: user.id,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ userId: user.id }),
  };
};
