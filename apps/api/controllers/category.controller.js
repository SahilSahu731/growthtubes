import prisma from '../lib/prisma.js';

/**
 * Helper: generate a URL-safe slug from a name
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * GET /api/admin/categories
 * List all categories (with optional active filter)
 */
export const getCategories = async (req, res, next) => {
  try {
    const { active } = req.query;

    const where = {};
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    res.status(200).json({
      status: 'success',
      data: { categories, total: categories.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/categories/:id
 * Get a single category by ID
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/categories
 * Create a new category
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Category name is required',
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({
        status: 'error',
        message: 'Category name must be between 2 and 50 characters',
      });
    }

    // Check for duplicate name
    const existing = await prisma.category.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'A category with this name already exists',
      });
    }

    // Generate unique slug
    let slug = slugify(trimmedName);
    const slugExists = await prisma.category.findUnique({
      where: { slug },
    });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Validate color if provided
    if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid color format. Use hex format like #10b981',
      });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        color: color || '#10b981',
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/categories/:id
 * Update a category
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, sortOrder, isActive } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    const updateData = {};

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({
          status: 'error',
          message: 'Category name must be between 2 and 50 characters',
        });
      }

      // Check duplicate
      if (trimmedName !== existing.name) {
        const duplicate = await prisma.category.findUnique({
          where: { name: trimmedName },
        });
        if (duplicate) {
          return res.status(409).json({
            status: 'error',
            message: 'A category with this name already exists',
          });
        }
        updateData.name = trimmedName;
        updateData.slug = slugify(trimmedName);

        // Ensure slug uniqueness
        const slugExists = await prisma.category.findFirst({
          where: { slug: updateData.slug, id: { not: id } },
        });
        if (slugExists) {
          updateData.slug = `${updateData.slug}-${Date.now().toString(36)}`;
        }
      }
    }

    if (description !== undefined) updateData.description = description?.trim() || null;
    if (icon !== undefined) updateData.icon = icon?.trim() || null;

    if (color !== undefined) {
      if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid color format. Use hex format like #10b981',
        });
      }
      updateData.color = color;
    }

    if (typeof sortOrder === 'number') updateData.sortOrder = sortOrder;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/categories/:id
 * Delete a category
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
