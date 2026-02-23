import { Router } from 'express';
import { creatorMiddleware } from '../middleware/auth.js';

const router = Router();

// All creator routes require CREATOR or ADMIN role
router.use(creatorMiddleware);

// GET /api/creator/dashboard
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Creator dashboard data',
    data: {
      userId: req.user.userId,
      role: req.user.role,
      stats: {
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        publishedCourses: 0,
      },
    },
  });
});

// GET /api/creator/courses
router.get('/courses', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Creator courses list',
    data: {
      courses: [],
    },
  });
});

// GET /api/creator/analytics
router.get('/analytics', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Creator analytics data',
    data: {
      views: 0,
      enrollments: 0,
      completionRate: 0,
    },
  });
});

export default router;
