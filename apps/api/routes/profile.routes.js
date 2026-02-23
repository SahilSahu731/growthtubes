import { Router } from 'express';
import multer from 'multer';
import { getProfile, updateProfile, uploadAvatar, deleteAvatar, deleteAccount } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Multer — in-memory storage (we stream directly to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// All profile routes require authentication
router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);
router.delete('/', deleteAccount);

export default router;
