import mongoose from 'mongoose';
import axios from 'axios';
import Post from '../models/Post.js';

// POST /ai/improve/:postId — improve post content using an external AI API
export const improvePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID.' });
    }

    // Find the original post
    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Only the owner can request AI improvement
    if (originalPost.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only improve your own posts.' });
    }

    // Ensure AI environment variables are configured
    const { AI_API_KEY, AI_API_URL, AI_MODEL } = process.env;
    if (!AI_API_KEY || !AI_API_URL || !AI_MODEL) {
      return res.status(500).json({
        message:
          'AI integration is not configured. Please set AI_API_KEY, AI_API_URL, and AI_MODEL in your .env file.',
      });
    }

    // Call the AI provider (OpenAI-compatible chat completions endpoint)
    let improvedContent;
    try {
      const aiResponse = await axios.post(
        AI_API_URL,
        {
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are a professional editor. Improve the grammar, clarity, readability and structure of the provided text while preserving its original meaning. Return only the improved text, without any explanation or preamble.',
            },
            {
              role: 'user',
              content: originalPost.content,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      improvedContent = aiResponse.data?.choices?.[0]?.message?.content;

      if (!improvedContent) {
        return res.status(502).json({
          message: 'AI provider returned an unexpected response. Please try again.',
        });
      }
    } catch (aiError) {
      // Return a meaningful error without creating an invalid post
      const statusCode = aiError.response?.status || 502;
      return res.status(502).json({
        message: 'AI provider request failed. Please check your AI configuration and try again.',
        detail: aiError.response?.data?.error?.message || aiError.message,
      });
    }

    // Create a new draft post with the improved content (original post stays unchanged)
    const improvedDraft = await Post.create({
      title: originalPost.title,
      description: originalPost.description,
      content: improvedContent,
      image: originalPost.image,
      category: originalPost.category,
      createdBy: req.user._id,
      status: 'draft', // always starts as draft
    });

    res.status(201).json({
      message: 'AI improvement complete. A new draft has been created with the improved content.',
      originalPostId: originalPost._id,
      improvedDraft,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during AI improvement.', error: error.message });
  }
};
