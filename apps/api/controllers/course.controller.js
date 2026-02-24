import prisma from '../lib/prisma.js';
import supabase from '../lib/supabase.js';

const THUMBNAIL_BUCKET = 'thumbnails';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── COURSES ────────────────────────────────────

/**
 * GET /api/creator/courses
 * List all courses by the authenticated creator
 */
export const getCreatorCourses = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { status } = req.query;

    const where = { creatorId };
    if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      where.status = status;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        _count: { select: { sections: true, enrollments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Count lessons per course
    const coursesWithLessons = await Promise.all(
      courses.map(async (course) => {
        const lessonCount = await prisma.lesson.count({
          where: { section: { courseId: course.id } },
        });
        return {
          ...course,
          _count: {
            ...course._count,
            lessons: lessonCount,
          },
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: { courses: coursesWithLessons, total: courses.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/creator/courses/:id
 * Get a single course with sections & lessons
 */
export const getCreatorCourse = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { id } = req.params;

    const course = await prisma.course.findFirst({
      where: { id, creatorId },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/creator/courses
 * Create a new course
 */
export const createCourse = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const {
      title,
      description,
      shortDescription,
      thumbnail,
      level,
      categoryId,
      price,
      isFree,
      language,
      tags,
    } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Course title is required',
      });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
      return res.status(400).json({
        status: 'error',
        message: 'Course title must be between 3 and 150 characters',
      });
    }

    // Generate unique slug
    let slug = slugify(trimmedTitle);
    const slugExists = await prisma.course.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    let thumbnailUrl = thumbnail?.trim() || null;

    // Handle thumbnail upload if file is provided
    if (req.file) {
      const { buffer, mimetype, size, originalname } = req.file;

      if (!ALLOWED_TYPES.includes(mimetype)) {
        return res.status(400).json({ status: 'error', message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' });
      }

      if (size > MAX_FILE_SIZE) {
        return res.status(400).json({ status: 'error', message: 'File too large. Maximum size is 5MB' });
      }

      const ext = originalname.split('.').pop() || mimetype.split('/')[1];
      const filePath = `courses/${creatorId}/${slug}-${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .upload(filePath, buffer, {
          contentType: mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(500).json({ status: 'error', message: 'Failed to upload thumbnail' });
      }

      const { data: urlData } = supabase.storage
        .from(THUMBNAIL_BUCKET)
        .getPublicUrl(filePath);

      thumbnailUrl = urlData.publicUrl;
    }


    // Validate category if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid category',
        });
      }
    }

    // Validate level
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'];
    const courseLevel = level && validLevels.includes(level) ? level : 'ALL_LEVELS';

    const course = await prisma.course.create({
      data: {
        title: trimmedTitle,
        slug,
        description: description?.trim() || null,
        shortDescription: shortDescription?.trim() || null,
        thumbnail: thumbnailUrl,
        level: courseLevel,
        creatorId,
        categoryId: categoryId || null,
        price: typeof price === 'number' && price >= 0 ? price : 0,
        isFree: isFree !== false,
        language: language?.trim() || 'English',
        tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/creator/courses/:id
 * Update a course
 */
export const updateCourse = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.course.findFirst({
      where: { id, creatorId },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
    }

    const {
      title,
      description,
      shortDescription,
      thumbnail,
      level,
      categoryId,
      price,
      isFree,
      language,
      tags,
    } = req.body;

    const updateData = {};

    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
        return res.status(400).json({
          status: 'error',
          message: 'Course title must be between 3 and 150 characters',
        });
      }
      updateData.title = trimmedTitle;

      // Update slug if title changed
      if (trimmedTitle !== existing.title) {
        let slug = slugify(trimmedTitle);
        const slugExists = await prisma.course.findFirst({
          where: { slug, id: { not: id } },
        });
        if (slugExists) {
          slug = `${slug}-${Date.now().toString(36)}`;
        }
        updateData.slug = slug;
      }
    }

    if (description !== undefined) updateData.description = description?.trim() || null;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription?.trim() || null;
    
    // Explicit string URL update (fallback)
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail?.trim() || null;
    
    // File upload logic
    if (req.file) {
      const { buffer, mimetype, size, originalname } = req.file;

      if (!ALLOWED_TYPES.includes(mimetype)) {
        return res.status(400).json({ status: 'error', message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' });
      }
      if (size > MAX_FILE_SIZE) {
        return res.status(400).json({ status: 'error', message: 'File too large. Maximum size is 5MB' });
      }

      const ext = originalname.split('.').pop() || mimetype.split('/')[1];
      // Use existing slug or newly generated slug for file name
      const fileSlug = updateData.slug || existing.slug;
      const filePath = `courses/${creatorId}/${fileSlug}-${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .upload(filePath, buffer, {
          contentType: mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(500).json({ status: 'error', message: 'Failed to upload thumbnail' });
      }

      const { data: urlData } = supabase.storage
        .from(THUMBNAIL_BUCKET)
        .getPublicUrl(filePath);

      updateData.thumbnail = urlData.publicUrl;
    }
    
    if (language !== undefined) updateData.language = language?.trim() || 'English';

    if (level !== undefined) {
      const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'];
      if (validLevels.includes(level)) {
        updateData.level = level;
      }
    }

    if (categoryId !== undefined) {
      if (categoryId === null) {
        updateData.categoryId = null;
      } else {
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) {
          return res.status(400).json({ status: 'error', message: 'Invalid category' });
        }
        updateData.categoryId = categoryId;
      }
    }

    if (typeof price === 'number') updateData.price = Math.max(0, price);
    if (typeof isFree === 'boolean') updateData.isFree = isFree;
    if (Array.isArray(tags)) updateData.tags = tags.map((t) => t.trim()).filter(Boolean);

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/creator/courses/:id
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.course.findFirst({
      where: { id, creatorId },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
    }

    await prisma.course.delete({ where: { id } });

    res.status(200).json({
      status: 'success',
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/creator/courses/:id/publish
 */
export const publishCourse = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { id } = req.params;

    const course = await prisma.course.findFirst({
      where: { id, creatorId },
      include: {
        sections: { include: { lessons: true } },
      },
    });

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
    }

    // Validate: must have at least one section with one lesson
    const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
    if (course.sections.length === 0 || totalLessons === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Course must have at least one section with one lesson before publishing',
      });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: course.publishedAt || new Date(),
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Course published',
      data: { course: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/creator/courses/:id/unpublish
 */
export const unpublishCourse = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.course.findFirst({
      where: { id, creatorId },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { status: 'DRAFT' },
    });

    res.status(200).json({
      status: 'success',
      message: 'Course unpublished',
      data: { course: updated },
    });
  } catch (error) {
    next(error);
  }
};

// ─── SECTIONS ───────────────────────────────────

/**
 * POST /api/creator/courses/:courseId/sections
 */
export const createSection = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { courseId } = req.params;
    const { title, description } = req.body;

    // Verify course ownership
    const course = await prisma.course.findFirst({
      where: { id: courseId, creatorId },
    });
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ status: 'error', message: 'Section title is required' });
    }

    // Auto-increment sortOrder
    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { sortOrder: 'desc' },
    });

    const section = await prisma.section.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        courseId,
        sortOrder: (lastSection?.sortOrder ?? -1) + 1,
      },
      include: { lessons: true },
    });

    res.status(201).json({
      status: 'success',
      message: 'Section created',
      data: { section },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/creator/sections/:sectionId
 */
export const updateSection = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { sectionId } = req.params;
    const { title, description, sortOrder } = req.body;

    const section = await prisma.section.findFirst({
      where: { id: sectionId, course: { creatorId } },
    });
    if (!section) {
      return res.status(404).json({ status: 'error', message: 'Section not found' });
    }

    const updateData = {};
    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ status: 'error', message: 'Section title is required' });
      updateData.title = title.trim();
    }
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (typeof sortOrder === 'number') updateData.sortOrder = sortOrder;

    const updated = await prisma.section.update({
      where: { id: sectionId },
      data: updateData,
      include: { lessons: { orderBy: { sortOrder: 'asc' } } },
    });

    res.status(200).json({
      status: 'success',
      message: 'Section updated',
      data: { section: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/creator/sections/:sectionId
 */
export const deleteSection = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { sectionId } = req.params;

    const section = await prisma.section.findFirst({
      where: { id: sectionId, course: { creatorId } },
    });
    if (!section) {
      return res.status(404).json({ status: 'error', message: 'Section not found' });
    }

    await prisma.section.delete({ where: { id: sectionId } });

    res.status(200).json({
      status: 'success',
      message: 'Section deleted',
    });
  } catch (error) {
    next(error);
  }
};

// ─── LESSONS ────────────────────────────────────

/**
 * POST /api/creator/sections/:sectionId/lessons
 */
export const createLesson = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { sectionId } = req.params;
    const { title, description, type, content, videoUrl, duration, isFree } = req.body;

    // Verify section belongs to creator's course
    const section = await prisma.section.findFirst({
      where: { id: sectionId, course: { creatorId } },
    });
    if (!section) {
      return res.status(404).json({ status: 'error', message: 'Section not found' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ status: 'error', message: 'Lesson title is required' });
    }

    const validTypes = ['VIDEO', 'TEXT', 'QUIZ'];
    const lessonType = type && validTypes.includes(type) ? type : 'VIDEO';

    // Auto-increment sortOrder
    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { sortOrder: 'desc' },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        type: lessonType,
        content: content?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        duration: typeof duration === 'number' ? Math.max(0, duration) : 0,
        isFree: isFree === true,
        sectionId,
        sortOrder: (lastLesson?.sortOrder ?? -1) + 1,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Lesson created',
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/creator/lessons/:lessonId
 */
export const updateLesson = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { lessonId } = req.params;
    const { title, description, type, content, videoUrl, duration, isFree, sortOrder } = req.body;

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, section: { course: { creatorId } } },
    });
    if (!lesson) {
      return res.status(404).json({ status: 'error', message: 'Lesson not found' });
    }

    const updateData = {};
    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ status: 'error', message: 'Lesson title is required' });
      updateData.title = title.trim();
    }
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (type !== undefined) {
      const validTypes = ['VIDEO', 'TEXT', 'QUIZ'];
      if (validTypes.includes(type)) updateData.type = type;
    }
    if (content !== undefined) updateData.content = content?.trim() || null;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl?.trim() || null;
    if (typeof duration === 'number') updateData.duration = Math.max(0, duration);
    if (typeof isFree === 'boolean') updateData.isFree = isFree;
    if (typeof sortOrder === 'number') updateData.sortOrder = sortOrder;

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    res.status(200).json({
      status: 'success',
      message: 'Lesson updated',
      data: { lesson: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/creator/lessons/:lessonId
 */
export const deleteLesson = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { lessonId } = req.params;

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, section: { course: { creatorId } } },
    });
    if (!lesson) {
      return res.status(404).json({ status: 'error', message: 'Lesson not found' });
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    res.status(200).json({
      status: 'success',
      message: 'Lesson deleted',
    });
  } catch (error) {
    next(error);
  }
};
