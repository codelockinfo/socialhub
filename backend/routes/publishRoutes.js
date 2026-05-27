import express from 'express';
import { createAndPublishPost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Upload and Publish Route
// Expects 'media' file and 'content', 'platforms' in body
router.post('/', protect, upload.single('media'), createAndPublishPost);

export default router;
