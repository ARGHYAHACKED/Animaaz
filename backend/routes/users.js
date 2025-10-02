
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const multer = require('multer');
const { cloudinary: cloudinaryLib } = require('../config/cloudinary');
const stream = require('stream');
const Anime = require('../models/Anime');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } });

// Get current user's milestone anime (with completion status)
router.get('/milestones', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('milestoneAnime.anime', 'title coverImage');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ milestoneAnime: user.milestoneAnime });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark a milestone anime as complete/incomplete
router.post('/milestones/:animeId', authMiddleware, async (req, res) => {
  // Body: { completed: true/false }
  try {
    const { completed } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const milestone = user.milestoneAnime.find(m => m.anime.toString() === req.params.animeId);
    if (!milestone) return res.status(404).json({ message: 'Milestone anime not found for user' });
    milestone.completed = !!completed;
    await user.save();
    res.json({ message: 'Milestone updated', milestoneAnime: user.milestoneAnime });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email')
      .populate('bookmarks', 'title coverImage')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar')
      .populate('groups', 'name avatar category');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's posts
    const posts = await Post.find({ user: user._id, isActive: true })
      .sort({ createdAt: -1 })
      .populate('relatedAnime', 'title coverImage')
      .select('title content type createdAt likes comments user');
    
    res.json({
      ...user.toObject(),
      posts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's liked anime (from Anime.likes array)
router.get('/:id/liked', async (req, res) => {
  try {
    const userId = req.params.id;
    const liked = await Anime.find({ 'likes.user': userId, isActive: true })
      .select('title description coverImage genres rating views dummyViews dummyLikes');
    res.json(liked);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile
router.put('/profile', authMiddleware, [
  body('username').optional().isLength({ min: 3, max: 20 }).trim().escape(),
  body('bio').optional().isLength({ max: 500 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const updates = req.body;
    delete updates.password;
    delete updates.email;
    delete updates.role;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update avatar/cover images
router.put('/profile/images', authMiddleware, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    ('Received profile image upload request');
    ('Request files:', req.files);
    const updates = {};
    if (req.body.bio) updates.bio = req.body.bio;
    if (req.body.username) updates.username = req.body.username;
    const uploadBuffer = async (file, folder) => new Promise((resolve, reject) => {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);
      const cloudStream = cloudinaryLib.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
        if (err) return reject(err);
        resolve(result?.secure_url);
      });
      bufferStream.pipe(cloudStream);
    });
    if (req.files?.avatar?.[0]) {
      ('Uploading avatar to Cloudinary...');
      updates.avatar = await uploadBuffer(req.files.avatar[0], 'avatars');
      ('Avatar uploaded:', updates.avatar);
    }
    if (req.files?.cover?.[0]) {
      ('Uploading cover to Cloudinary...');
      updates.cover = await uploadBuffer(req.files.cover[0], 'covers');
      ('Cover uploaded:', updates.cover);
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error uploading profile images:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow/Unfollow user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isFollowing = currentUser.following.includes(req.params.id);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
    }
    
    await currentUser.save();
    await targetUser.save();
    
    res.json({ 
      following: !isFollowing,
      message: isFollowing ? 'Unfollowed successfully' : 'Following successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile - This is where the lists are fetched.
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email')
      .populate('bookmarks', 'title coverImage')
      .populate('followers', 'username avatar') // <-- Fetches the list of followers
      .populate('following', 'username avatar') // <-- Fetches the list of users being followed
      .populate('groups', 'name avatar category');
    
    // ... rest of the code
  } catch (error) {
    // ...
  }
});

// Add to bookmarks
router.post('/bookmark/:animeId', authMiddleware, async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.animeId);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    
    const user = await User.findById(req.user._id);
    const isBookmarked = user.bookmarks.includes(req.params.animeId);
    
    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        id => id.toString() !== req.params.animeId
      );
    } else {
      user.bookmarks.push(req.params.animeId);
    }
    
    await user.save();
    
    res.json({ 
      bookmarked: !isBookmarked,
      message: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookmarks
router.get('/bookmarks/list', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('bookmarks', 'title description coverImage genres rating');
    
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to watchlist
router.post('/watchlist/:animeId', authMiddleware, async (req, res) => {
  try {
    const { status = 'plan-to-watch' } = req.body;
    
    const user = await User.findById(req.user._id);
    const existingEntry = user.watchlist.find(
      entry => entry.anime.toString() === req.params.animeId
    );
    
    if (existingEntry) {
      existingEntry.status = status;
    } else {
      user.watchlist.push({
        anime: req.params.animeId,
        status
      });
    }
    
    await user.save();
    
    res.json({ message: 'Watchlist updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: req.params.query, $options: 'i' } },
        { bio: { $regex: req.params.query, $options: 'i' } }
      ]
    })
    .select('username avatar bio followers')
    .limit(20);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;