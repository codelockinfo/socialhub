import express from 'express';
import multer from 'multer';
import { getAuthUrl, handleAuthCallback, uploadVideo, getVideos } from '../controllers/youtubeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer config for file uploads
// Save temporarily in 'uploads/' directory before pushing to YouTube
const upload = multer({ dest: 'uploads/' });

// OAuth Routes
router.get('/auth', protect, getAuthUrl);
router.get('/auth/callback', handleAuthCallback);

// Video Upload Route
router.post(
  '/upload',
  protect,
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  uploadVideo
);

// Get Videos Route
router.get('/videos', protect, getVideos);

export default router;
