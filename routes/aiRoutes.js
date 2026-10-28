import express from 'express';
import { improvePost } from '../controllers/aiController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /ai/improve/:postId — requires authentication
router.post('/improve/:postId', protect, improvePost);

export default router;
