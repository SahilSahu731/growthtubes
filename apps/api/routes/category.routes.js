import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/categories — public, returns active categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
