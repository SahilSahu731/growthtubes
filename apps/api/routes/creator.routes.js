import { Router } from 'express';
import multer from 'multer';
import { creatorMiddleware } from '../middleware/auth.js';
import {
  getCreatorCourses,
  getCreatorCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  createSection,
  updateSection,
  deleteSection,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/course.controller.js';

const router = Router();

// Multer — in-memory storage for thumbnail uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// All creator routes require CREATOR or ADMIN role
router.use(creatorMiddleware);

// ── Dashboard ───────────────────────────────
router.get('/dashboard', async (req, res, next) => {
  try {
    const { default: prisma } = await import('../lib/prisma.js');
    const creatorId = req.user.userId;

    const [totalCourses, publishedCourses, totalStudents] = await Promise.all([
      prisma.course.count({ where: { creatorId } }),
      prisma.course.count({ where: { creatorId, status: 'PUBLISHED' } }),
      prisma.enrollment.count({
        where: { course: { creatorId } },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        userId: req.user.userId,
        role: req.user.role,
        stats: {
          totalCourses,
          publishedCourses,
          totalStudents,
          totalRevenue: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Courses ─────────────────────────────────
router.get('/courses', getCreatorCourses);
router.get('/courses/:id', getCreatorCourse);
router.post('/courses', upload.single('thumbnail'), createCourse);
router.patch('/courses/:id', upload.single('thumbnail'), updateCourse);
router.delete('/courses/:id', deleteCourse);
router.patch('/courses/:id/publish', publishCourse);
router.patch('/courses/:id/unpublish', unpublishCourse);

// ── Sections ────────────────────────────────
router.post('/courses/:courseId/sections', createSection);
router.patch('/sections/:sectionId', updateSection);
router.delete('/sections/:sectionId', deleteSection);

// ── Lessons ─────────────────────────────────
router.post('/sections/:sectionId/lessons', createLesson);
router.patch('/lessons/:lessonId', updateLesson);
router.delete('/lessons/:lessonId', deleteLesson);

// ── Analytics ───────────────────────────────
router.get('/analytics', async (req, res, next) => {
  try {
    const { default: prisma } = await import('../lib/prisma.js');
    const creatorId = req.user.userId;

    const [enrollments, courses] = await Promise.all([
      prisma.enrollment.count({ where: { course: { creatorId } } }),
      prisma.course.count({ where: { creatorId } }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        views: 0,
        enrollments,
        courses,
        completionRate: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
