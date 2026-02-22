import express from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Sync user profile from Supabase Auth
 * Expected body: { username, fullName, avatarUrl, bio }
 */
router.post('/sync', authMiddleware, async (req, res) => {
  const { sub: userId, email } = req.user;
  const { username, fullName, avatarUrl, bio } = req.body;

  try {
    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { id: userId },
      update: {
        fullName: fullName || undefined,
        avatarUrl: avatarUrl || undefined,
        bio: bio || undefined,
        lastLoginAt: new Date(),
      },
      create: {
        id: userId,
        username: username || email.split('@')[0] + Math.floor(Math.random() * 1000), // Default username
        fullName: fullName || null,
        avatarUrl: avatarUrl || null,
        bio: bio || null,
        onboardingCompleted: false,
      },
    });

    res.status(200).json({
      message: 'Profile synced successfully',
      profile,
    });
  } catch (error) {
    console.error('Profile sync error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
