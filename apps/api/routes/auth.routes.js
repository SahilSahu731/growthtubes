import { Router } from 'express';
import {
  signup,
  verifyEmailOTP,
  resendOTP,
  login,
  refreshAccessToken,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes (with rate limiting)
router.post('/signup',       authLimiter, signup);
router.post('/login',        authLimiter, login);
router.post('/verify-otp',   strictLimiter, verifyEmailOTP);
router.post('/resend-otp',   strictLimiter, resendOTP);
router.post('/refresh',      refreshAccessToken);
router.post('/logout',       logout);

// Protected routes
router.get('/me', authMiddleware, getMe);

export default router;
