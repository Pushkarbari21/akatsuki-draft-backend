import express from 'express';
import { getPendingPosts, approvePost, rejectPost } from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminMiddleware.js';

const router = express.Router();

// All admin routes require both authentication AND admin role
router.get('/posts/pending', protect, adminOnly, getPendingPosts);
router.patch('/posts/approve/:id', protect, adminOnly, approvePost);
router.patch('/posts/reject/:id', protect, adminOnly, rejectPost);

export default router;
