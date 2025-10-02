

const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { cloudinary: cloudinaryLib } = require('../config/cloudinary');
const stream = require('stream');

const router = express.Router();

// Multer in-memory storage for images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB per image, up to 5 images
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
      const { search, type, group, tag } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (type) {
      query.type = type;
    }
    
    if (group) {
      query.group = group;
    }
      // Filter by tag (single tag for now)
      if (tag) {
        query.tags = tag.toLowerCase();
      }
    
    const posts = await Post.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar')
      .populate('group', 'name')
      .populate('relatedAnime', 'title coverImage')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username avatar'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      });
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create post
router.post('/posts', authMiddleware, upload.array('images', 5), [
  body('content').isLength({ min: 1, max: 2000 }).trim(), // Don't escape here, handle in frontend for spoilers/hashtags
  body('title').optional().isLength({ max: 200 }).trim().escape()
], async (req, res) => {
  try {
    ('Received community post creation request');
    ('Request body:', req.body);
    ('Request files:', req.files);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      content,
      title,
      type,
      group,
      relatedAnime,
      tags,
      spoiler
    } = req.body;
    const uploadedImages = [];
    // Upload images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        const uploadResult = await new Promise((resolve, reject) => {
          const cloudStream = cloudinaryLib.uploader.upload_stream(
            { folder: 'community_posts', resource_type: 'image' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          bufferStream.pipe(cloudStream);
        });
        if (uploadResult && uploadResult.secure_url) {
          uploadedImages.push(uploadResult.secure_url);
        }
      }
    }

    // Extract hashtags from content (e.g. #Naruto, #OnePiece)
    let extractedTags = [];
    if (typeof content === 'string') {
      const tagMatches = content.match(/#([\w\d_\-]+)/g);
      if (tagMatches) {
        extractedTags = tagMatches.map(t => t.slice(1).toLowerCase());
      }
    }

    // Accept tags from request body (array or string)
    let bodyTags = [];
    if (Array.isArray(tags)) {
      bodyTags = tags.map(t => t.toLowerCase());
    } else if (typeof tags === 'string' && tags.trim()) {
      // If tags is a comma-separated string or single tag
      bodyTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    // Merge and deduplicate
    const allTags = Array.from(new Set([...extractedTags, ...bodyTags]));

    const post = new Post({
      content,
      title,
      type,
      user: req.user._id,
      group,
      relatedAnime,
      tags: allTags,
      images: uploadedImages,
      spoiler: spoiler === 'true' || spoiler === true
    });
    ('Extracted tags to store:', allTags);
    await post.save();
    // After save, log the actual tags in the DB
    const savedPost = await Post.findById(post._id);
    ('Tags in DB after save:', savedPost.tags);
    await post.populate('user', 'username avatar');
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('group', 'name')
      .populate('relatedAnime', 'title coverImage')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username avatar'
        },
        options: { sort: { createdAt: 1 } }
      });
    
    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//post delete
// Delete post
router.delete('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Only allow owner or admin to delete
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    post.isActive = false;
    await post.save();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get comments (threaded) for a post
router.get('/posts/:id/comments', async (req, res) => {
  try {
    // Get all comments for the post, populate user
    const all = await Comment.find({ post: req.params.id, isActive: true })
      .sort({ createdAt: 1 })
      .populate('user', 'username avatar');
    // Build map with full objects
    const byId = new Map();
    all.forEach(c => {
      c = c.toObject();
      c.replies = [];
      byId.set(c._id.toString(), c);
    });
    // Attach replies as full objects
    byId.forEach(c => {
      if (c.parentComment) {
        const parent = byId.get(c.parentComment.toString());
        if (parent) parent.replies.push(c);
      }
    });
  // Only root comments (no parentComment)
  const roots = Array.from(byId.values()).filter(c => !c.parentComment);
  ('Threaded comments roots:', JSON.stringify(roots, null, 2));
  res.json(roots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit/Delete comments
router.put('/comments/:id', authMiddleware, [
  body('text').isLength({ min: 1, max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    comment.text = req.body.text;
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();
    await comment.populate('user', 'username avatar');
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/comments/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    comment.isActive = false;
    await comment.save();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike post
router.post('/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );
    
    if (existingLike) {
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push({ user: req.user._id });
    }
    
    await post.save();
    
    res.json({ 
      liked: !existingLike,
      likesCount: post.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// React to post
router.post('/posts/:id/react', authMiddleware, [
  body('type').isIn(['love', 'laugh', 'angry', 'sad', 'wow'])
], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const { type } = req.body;
    
    // Remove existing reaction
    post.reactions = post.reactions.filter(
      reaction => reaction.user.toString() !== req.user._id.toString()
    );
    
    // Add new reaction
    post.reactions.push({
      type,
      user: req.user._id
    });
    
    await post.save();
    
    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bookmark/Unbookmark post
router.post('/posts/:id/bookmark', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const isBookmarked = post.bookmarks.includes(req.user._id);
    
    if (isBookmarked) {
      post.bookmarks = post.bookmarks.filter(
        bookmark => bookmark.toString() !== req.user._id.toString()
      );
    } else {
      post.bookmarks.push(req.user._id);
    }
    
    await post.save();
    
    res.json({ 
      bookmarked: !isBookmarked,
      message: isBookmarked ? 'Bookmark removed' : 'Post bookmarked'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to post
router.post('/posts/:id/comments', authMiddleware, [
  body('text').isLength({ min: 1, max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { text, parentComment } = req.body;
    
    const comment = new Comment({
      text,
      user: req.user._id,
      post: req.params.id,
      parentComment
    });
    
    await comment.save();
    
    const post = await Post.findById(req.params.id);
    post.comments.push(comment._id);
    await post.save();
    
    // If it's a reply, add to parent comment
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      parent.replies.push(comment._id);
      await parent.save();
    }
    
    await comment.populate('user', 'username avatar');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like comment
router.post('/comments/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const existingLike = comment.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );
    
    if (existingLike) {
      comment.likes = comment.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      comment.likes.push({ user: req.user._id });
    }
    
    await comment.save();
    
    res.json({ 
      liked: !existingLike,
      likesCount: comment.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ...existing code...

// Get all unique tags from community posts
router.get('/tags', async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    // Always return as { tag, count }
    res.json({ tags: tags.map(t => ({ tag: t._id, count: t.count })) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;