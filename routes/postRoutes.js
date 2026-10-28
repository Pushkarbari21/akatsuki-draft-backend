import express from 'express';
import {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getApprovedPosts);

// IMPORTANT: /my-posts must be defined BEFORE /:id to avoid Express treating
// the literal string "my-posts" as a dynamic :id parameter
router.get('/my-posts', protect, getMyPosts);

router.get('/:id', getApprovedPostById);

// Authenticated routes
router.post('/', protect, createPost);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;
