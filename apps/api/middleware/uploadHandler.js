import multer from 'multer';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

/**
 * File Upload Middleware
 * 
 * - Limits file size to 10MB
 * - Validates file types (Images & PDFs)
 * - Uses memory storage for manual content validation
 */

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|pdf/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedExtensions.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpg, jpeg, png) and PDFs are allowed'));
    }
  },
});

/**
 * Middleware to validate file content using magic numbers (file-type)
 */
export const validateFileContent = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const type = await fileTypeFromBuffer(req.file.buffer);
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!type || !allowedTypes.includes(type.mime)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file content. The file type does not match its extension.',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const uploadMiddleware = upload.single('file');
