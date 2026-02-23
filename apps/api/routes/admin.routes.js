import { Router } from 'express';
import { adminMiddleware } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// All admin routes require ADMIN role
router.use(adminMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({
      where: { isEmailVerified: true },
    });
    const totalProfiles = await prisma.profile.count();
    const creatorCount = await prisma.profile.count({
      where: { role: 'CREATOR' },
    });

    res.status(200).json({
      status: 'success',
      message: 'Admin dashboard data',
      data: {
        stats: {
          totalUsers,
          verifiedUsers,
          totalProfiles,
          creatorCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:userId/role
router.put('/users/:userId/role', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'CREATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be USER, CREATOR, or ADMIN',
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found',
      });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: { role },
    });

    res.status(200).json({
      status: 'success',
      message: `Role updated to ${role}`,
      data: { profile: updatedProfile },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
