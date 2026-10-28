import mongoose from 'mongoose';
import Post from '../models/Post.js';

// GET /admin/posts/pending — list all posts awaiting review
export const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pending posts.', error: error.message });
  }
};

// PATCH /admin/posts/approve/:id — approve a pending post
export const approvePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID.' });
    }

    const post = await Post.findByIdAndUpdate(id, { status: 'approved' }, { new: true });

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.json({ message: 'Post approved and published.', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error approving post.', error: error.message });
  }
};

// PATCH /admin/posts/reject/:id — reject a pending post
export const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID.' });
    }

    const post = await Post.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.json({ message: 'Post rejected.', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error rejecting post.', error: error.message });
  }
};
