import express from 'express';
import { authUser, registerUser, connectMetaAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Standard JWT Login/Register
router.post('/login', authUser);
router.post('/register', registerUser);

// OAuth Connections (Requires User to be logged in first)
router.post('/meta/callback', protect, connectMetaAccount);
// You can add more endpoints for Youtube/LinkedIn callbacks here

export default router;
