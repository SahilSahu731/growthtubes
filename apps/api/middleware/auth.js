import { verifyAccessToken } from '../lib/jwt.js';

/**
 * Basic authentication — verifies JWT and attaches user to request
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid token',
    });
  }
};

/**
 * Role-based authorization — must be used AFTER authMiddleware
 * Checks if the authenticated user has one of the allowed roles.
 *
 * Usage:
 *   router.get('/admin-only', authMiddleware, requireRole('ADMIN'), handler);
 *   router.get('/creator-or-admin', authMiddleware, requireRole('CREATOR', 'ADMIN'), handler);
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'USER';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Shorthand: Creator or Admin only
 */
export const creatorMiddleware = [authMiddleware, requireRole('CREATOR', 'ADMIN')];

/**
 * Shorthand: Admin only
 */
export const adminMiddleware = [authMiddleware, requireRole('ADMIN')];
