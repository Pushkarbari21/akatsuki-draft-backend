import mongoose from 'mongoose';
import Post from '../models/Post.js';

// POST /posts — create a new post or draft
export const createPost = async (req, res) => {
  try {
    const { title, description, content, image, category, saveAsDraft } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    // If saveAsDraft is true → draft; otherwise submit for approval → pending
    const status = saveAsDraft ? 'draft' : 'pending';

    const post = await Post.create({
      title,
      description,
      content,
      image,
      category,
      createdBy: req.user._id,
      status,
    });

    res.status(201).json({ message: 'Post created successfully.', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating post.', error: error.message });
  }
};

// GET /posts — public: return only approved posts
export const getApprovedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'approved' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching posts.', error: error.message });
  }
};

// GET /posts/:id — public: return one approved post
export const getApprovedPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID.' });
    }

    const post = await Post.findOne({ _id: id, status: 'approved' }).populate(
      'createdBy',
      'name email'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found or not yet published.' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching post.', error: error.message });
  }
};

// GET /posts/my-posts — authenticated: return logged-in user's posts (all statuses)
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your posts.', error: error.message });
  }
};

// PATCH /posts/:id — authenticated: update own post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID.' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Only the owner can update the post
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own posts.' });
    }

    // Extract only the allowed fields — prevent clients from changing createdBy or forcing approved status
    const { title, description, content, image, category, saveAsDraft } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (content !== undefined) updates.content = content;
    if (image !== undefined) updates.image = image;
    if (category !== undefined) updates.category = category;

    // If content changed and the post was already submitted, put it back to pending for re-review
    if (content !== undefined && content !== post.content && post.status !== 'draft') {
      updates.status = 'pending';
    }

    // Respect draft flag: only allow draft toggle if the post is currently a draft
    if (saveAsDraft !== undefined && post.status === 'draft') {
      updates.status = saveAsDraft ? 'draft' : 'pending';
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true });

    res.json({ message: 'Post updated successfully.', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating post.', error: error.message });
  }
};

// DELETE /posts/:id — authenticated: delete own post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID.' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting post.', error: error.message });
  }
};
