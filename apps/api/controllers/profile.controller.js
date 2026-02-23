import prisma from '../lib/prisma.js';
import supabase from '../lib/supabase.js';

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * GET /api/profile
 * Get the authenticated user's profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        profile: true,
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

/**
 * PUT /api/profile
 * Update the authenticated user's profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { fullName, username, bio } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Validate username if provided
    if (username !== undefined) {
      if (!username || username.trim().length < 3) {
        return res.status(400).json({
          status: 'error',
          message: 'Username must be at least 3 characters',
        });
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({
          status: 'error',
          message: 'Username can only contain letters, numbers, underscores, and hyphens',
        });
      }

      // Check if username is taken (by another user)
      const existingProfile = await prisma.profile.findUnique({
        where: { username: username.toLowerCase() },
      });

      if (existingProfile && existingProfile.id !== userId) {
        return res.status(409).json({
          status: 'error',
          message: 'Username is already taken',
        });
      }
    }

    // Validate bio length
    if (bio !== undefined && bio.length > 300) {
      return res.status(400).json({
        status: 'error',
        message: 'Bio must be 300 characters or less',
      });
    }

    // Build update data
    const profileData = {};
    if (fullName !== undefined) profileData.fullName = fullName.trim() || null;
    if (username !== undefined) profileData.username = username.toLowerCase().trim();
    if (bio !== undefined) profileData.bio = bio.trim() || null;

    let profile;

    if (user.profile) {
      profile = await prisma.profile.update({
        where: { id: userId },
        data: profileData,
      });
    } else {
      // Create profile if it doesn't exist — generate a default username
      if (!profileData.username) {
        const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
        let candidateUsername = baseUsername;
        let counter = 1;

        while (await prisma.profile.findUnique({ where: { username: candidateUsername } })) {
          candidateUsername = `${baseUsername}${counter}`;
          counter++;
        }

        profileData.username = candidateUsername;
      }

      profile = await prisma.profile.create({
        data: {
          id: userId,
          ...profileData,
        },
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/profile/avatar
 * Upload avatar image to Supabase Storage
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided',
      });
    }

    const { buffer, mimetype, size, originalname } = req.file;

    // Validate file type
    if (!ALLOWED_TYPES.includes(mimetype)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
      });
    }

    // Validate file size
    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 5MB',
      });
    }

    // Get the file extension
    const ext = originalname.split('.').pop() || mimetype.split('/')[1];
    const filePath = `${userId}/avatar.${ext}`;

    // Delete old avatar if it exists (Supabase will overwrite, but clean up others)
    try {
      const { data: existingFiles } = await supabase.storage
        .from(AVATAR_BUCKET)
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from(AVATAR_BUCKET).remove(filesToDelete);
      }
    } catch {
      // Continue even if cleanup fails
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to upload avatar',
      });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Ensure profile exists then update avatarUrl
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (user.profile) {
      await prisma.profile.update({
        where: { id: userId },
        data: { avatarUrl },
      });
    } else {
      // Create profile with avatar
      const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
      let candidateUsername = baseUsername;
      let counter = 1;

      while (await prisma.profile.findUnique({ where: { username: candidateUsername } })) {
        candidateUsername = `${baseUsername}${counter}`;
        counter++;
      }

      await prisma.profile.create({
        data: {
          id: userId,
          username: candidateUsername,
          avatarUrl,
        },
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      data: { avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/profile/avatar
 * Remove avatar image
 */
export const deleteAvatar = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Delete from Supabase Storage
    try {
      const { data: existingFiles } = await supabase.storage
        .from(AVATAR_BUCKET)
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from(AVATAR_BUCKET).remove(filesToDelete);
      }
    } catch {
      // Continue even if storage cleanup fails
    }

    // Update profile
    await prisma.profile.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    res.status(200).json({
      status: 'success',
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/profile
 * Delete the authenticated user's account
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Clean up avatar from storage
    try {
      const { data: existingFiles } = await supabase.storage
        .from(AVATAR_BUCKET)
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from(AVATAR_BUCKET).remove(filesToDelete);
      }
    } catch {
      // Continue even if storage cleanup fails
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.clearCookie('refreshToken', { path: '/' });

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
