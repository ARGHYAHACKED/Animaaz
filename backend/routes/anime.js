
const express = require('express');
const { body, validationResult } = require('express-validator');
const Anime = require('../models/Anime');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  }
});

// Get all anime with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { search, genre, status, year, sort } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      // Try $text search first, fallback to case-insensitive regex for partials
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { genres: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (genre) {
      query.genres = { $in: [genre] };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (year) {
      query.year = parseInt(year);
    }
    
    let sortQuery = { createdAt: -1 };
    if (sort === 'rating') sortQuery = { rating: -1 };
    if (sort === 'views') sortQuery = { views: -1 };
    if (sort === 'title') sortQuery = { title: 1 };
    
    const anime = await Anime.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .select('title description coverImage genres status year rating views dummyViews likes');
    
    const total = await Anime.countDocuments(query);
    
    res.json({
      anime,
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

// Get current curation state (admin only)
router.get('/admin/curation-state', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [trending, featured, banner, topAiring, topWeek, forYou] = await Promise.all([
      Anime.find({ isActive: true, trending: true }).select('_id'),
      Anime.find({ isActive: true, featured: true }).select('_id'),
      Anime.find({ isActive: true, banner: true }).select('_id'),
      Anime.find({ isActive: true, topAiring: true }).select('_id'),
      Anime.find({ isActive: true, topWeek: true }).select('_id'),
      Anime.find({ isActive: true, forYou: true }).select('_id')
    ]);
    res.json({
      trending: trending.map(a => a._id),
      featured: featured.map(a => a._id),
      banner: banner.map(a => a._id),
      topAiring: topAiring.map(a => a._id),
      topWeek: topWeek.map(a => a._id),
      forYou: forYou.map(a => a._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Get featured anime
// Get featured anime (FIXED: Uses aggregation to sort by total popularity score)
router.get('/featured', async (req, res) => {
    try {
      const featuredAnime = await Anime.aggregate([
        { $match: { featured: true, isActive: true } }, // Filter for featured status
        { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } }, // Calculate real likes
        { 
          $addFields: { 
            // Calculate total popularity (real + dummy likes + real + dummy views)
            totalPopularity: { $add: [
              '$views', { $ifNull: ['$dummyViews', 0] }, 
              '$likesCount', { $ifNull: ['$dummyLikes', 0] }
            ] } 
          } 
        },
        { $sort: { totalPopularity: -1 } }, // Sort by the calculated score
        { $limit: 10 },
        { $project: { title: 1, description: 1, coverImage: 1, bannerImage: 1, genres: 1, rating: 1, views: 1, dummyViews: 1, likes: 1, dummyLikes: 1 } }
      ]);
      
      res.json(featuredAnime);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Get trending anime
// Banner anime for homepage
router.get('/banners', async (req, res) => {
  try {
    const banners = await Anime.find({ isActive: true, banner: true })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title description coverImage bannerImage images year status genres');
    ('[PUBLIC] /anime/banners ->', banners.length, 'items');
    res.json(banners);
  } catch (error) {
    console.error('[PUBLIC] /anime/banners error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Get trending anime (FIXED: Uses aggregation to sort by total popularity score)
router.get('/trending', async (req, res) => {
    try {
      const trendingAnime = await Anime.aggregate([
        { $match: { isActive: true, trending: true } }, // Filter for admin-set trending status
        { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
        { 
          $addFields: { 
            // Calculate total popularity
            totalPopularity: { $add: [
              '$views', { $ifNull: ['$dummyViews', 0] }, 
              '$likesCount', { $ifNull: ['$dummyLikes', 0] }
            ] } 
          } 
        },
        { $sort: { totalPopularity: -1, updatedAt: -1 } }, // Sort by score, then fall back to most recent update
        { $limit: 15 },
        { $project: { title: 1, description: 1, coverImage: 1, genres: 1, rating: 1, views: 1, likes: 1, dummyViews: 1, dummyLikes: 1 } }
      ]);
      
      res.json(trendingAnime);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Get popular anime (by views + likes), for home page
router.get('/popular', async (req, res) => {
  try {
    const popular = await Anime.aggregate([
      { $match: { isActive: true } },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $addFields: { popularity: { $add: ['$views', '$dummyViews', '$dummyLikes', '$likesCount'] } } },
      { $sort: { popularity: -1 } },
      { $limit: 15 },
      { $project: { title: 1, description: 1, coverImage: 1, genres: 1, rating: 1, views: 1, likes: 1, dummyViews: 1, dummyLikes: 1 } }
    ]);
    res.json(popular);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Top Airing (curated booleans)
router.get('/top-airing', async (req, res) => {
  try {
    const list = await Anime.find({ isActive: true, topAiring: true })
      .sort({ updatedAt: -1 })
      .limit(15)
      .select('title description coverImage genres rating views likes dummyViews dummyLikes status year');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// For You (curated booleans)
router.get('/for-you', async (req, res) => {
  try {
    const list = await Anime.find({ isActive: true, forYou: true })
      .sort({ updatedAt: -1 })
      .limit(15)
      .select('title description coverImage genres rating views likes dummyViews dummyLikes status year');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unique genres list for sidebar
router.get('/genres', async (req, res) => {
  try {
    const genres = await Anime.distinct('genres', { isActive: true });
    res.json(genres.filter(Boolean).sort());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Top this week (based on created/updated and views/likes), simple heuristic
// Top this week (Curation-based, managed by admin flag)
router.get('/top-week', async (req, res) => {
    try {
      // FIX: Using the topWeek boolean flag set by the Admin Curation Manager
      const list = await Anime.find({ isActive: true, topWeek: true })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select('title description coverImage genres rating views likes dummyViews dummyLikes status year');
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });


  router.get('/search', async (req, res) => {
  try {
    const { q, genre, sort = 'createdAt', page = 1, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.json([]);
    }
    
    console.log('Search params:', { q, genre, sort, page }); // Debug log
    
    const searchRegex = new RegExp(q.trim(), 'i');
    const query = {
      isActive: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { genres: searchRegex }
      ]
    };
    
    // Add genre filter if provided
    if (genre && genre.trim()) {
      query.genres = genre;
    }
    
    // Map frontend sort values to database fields
    const sortMap = {
      'created': 'createdAt',
      'views': 'views',
      'rating': 'rating',
      'title': 'title'
    };
    
    const sortField = sortMap[sort] || 'createdAt';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const anime = await Anime.find(query)
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title coverImage genres status year rating');
    
    console.log('Found anime:', anime.length); // Debug log
    res.json(anime);
  } catch (error) {
    console.error('Search error:', error); // This will show the real error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Get single anime by ID
router.get('/:id', async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id)
      .populate('comments')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username avatar'
        }
      });
    
    if (!anime || !anime.isActive) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    
    // Increment view count
    // anime.views += 1;
    // await anime.save();
    
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Rate anime 1-5 (realtime avg)
router.post('/:id/rate', authMiddleware, [
  body('value').isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: 'Anime not found' });
    const existing = anime.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (existing) existing.value = req.body.value; else anime.ratings.push({ user: req.user._id, value: req.body.value });
    // recompute averageRating and ratingsCount out of 5
    const count = anime.ratings.length;
    const sum = anime.ratings.reduce((acc, r) => acc + r.value, 0);
    anime.ratingsCount = count;
    anime.averageRating = count > 0 ? sum / count : 0;
    await anime.save();
    res.json({ averageRating: anime.averageRating, ratingsCount: anime.ratingsCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike anime
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    
    const existingLike = anime.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );
    
    if (existingLike) {
      anime.likes = anime.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      anime.likes.push({ user: req.user._id });
    }
    
    await anime.save();
    
    res.json({ 
      liked: !existingLike,
      likesCount: anime.likes.length + anime.dummyLikes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to anime
router.post('/:id/comment', authMiddleware, [
  body('text').isLength({ min: 1, max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    const animeForComments = await Anime.findById(req.params.id).select('commentsEnabled');
    if (!animeForComments) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    if (animeForComments.commentsEnabled === false) {
      return res.status(403).json({ message: 'Comments are disabled for this anime' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, parentComment } = req.body;

    const comment = new Comment({
      text,
      user: req.user._id,
      anime: req.params.id,
      parentComment: parentComment || null
    });

    await comment.save();

    // If it's a reply, add to parent comment's replies array
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent) {
        parent.replies.push(comment._id);
        await parent.save();
      }
    } else {
      // Only push top-level comments to anime.comments
      const anime = await Anime.findById(req.params.id);
      anime.comments.push(comment._id);
      await anime.save();
    }

    await comment.populate('user', 'username avatar');

    // Debug: log the comment structure
    ('Anime comment created:', JSON.stringify(comment, null, 2));

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create anime (Admin only)
router.post('/', authMiddleware, adminMiddleware, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }, { name: 'images', maxCount: 6 }]), [
  body('title').isLength({ min: 1, max: 200 }).trim().escape(),
  body('description').isLength({ min: 1, max: 2000 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    let coverImageUrl = '';
    let bannerImageUrl = '';

    if (req.files && req.files['coverImage'] && req.files['coverImage'][0]) {
      // Validate Cloudinary configuration before attempting upload
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({ message: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.' });
      }

      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.cloudinary.uploader.upload_stream(
            {
              folder: 'anime/covers',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.files['coverImage'][0].buffer);
        });

        coverImageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(502).json({ message: 'Image upload failed', error: uploadErr.message || uploadErr.toString() });
      }
    }

    // Upload banner image if provided
    if (req.files && req.files['bannerImage'] && req.files['bannerImage'][0]) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.cloudinary.uploader.upload_stream(
            {
              folder: 'anime/banners',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.files['bannerImage'][0].buffer);
        });

        bannerImageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Banner image upload error:', uploadErr);
        return res.status(502).json({ message: 'Banner image upload failed', error: uploadErr.message || uploadErr.toString() });
      }
    }
    
    if (!coverImageUrl) {
      return res.status(400).json({ message: 'coverImage is required' });
    }
    
    const {
      title,
      description,
      genres,
      tags,
      status,
      year,
      studio,
      director,
      totalEpisodes
    } = req.body;
    
    // Upload screenshots if any
    const images = [];
    if (req.files && req.files['images']) {
      for (const file of req.files['images']) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.cloudinary.uploader.upload_stream(
            { folder: 'anime/screens', resource_type: 'image' },
            (error, result) => { if (error) reject(error); else resolve(result); }
          ).end(file.buffer);
        });
        images.push(result.secure_url);
      }
    }

    const anime = new Anime({
      title,
      description,
      genres: genres ? JSON.parse(genres) : [],
      tags: tags ? JSON.parse(tags) : [],
      coverImage: coverImageUrl,
      bannerImage: bannerImageUrl,
      images,
      status,
      year: year ? parseInt(year) : undefined,
      studio,
      director,
      totalEpisodes: totalEpisodes ? parseInt(totalEpisodes) : 0
    });
    
    await anime.save();
    
    res.status(201).json(anime);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update anime (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }, { name: 'images', maxCount: 6 }]), async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    let updateData = { ...req.body };

    // Parse JSON fields if they are strings
    const parseIfString = (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    updateData.producers = parseIfString(updateData.producers);
    updateData.studios = parseIfString(updateData.studios);
    updateData.licensors = parseIfString(updateData.licensors);
    updateData.aired = parseIfString(updateData.aired);
    updateData.watchLinks = parseIfString(updateData.watchLinks);
    
    // --- The duplicated and incorrect block starts here in your original code ---
    
    if (req.files && req.files['coverImage'] && req.files['coverImage'][0]) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.cloudinary.uploader.upload_stream(
          {
            folder: 'anime/covers',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.files['coverImage'][0].buffer);
      });
      updateData.coverImage = result.secure_url;
    } else {
      // Don't overwrite with empty or object
      delete updateData.coverImage;
    }

    // Banner image: prioritize file upload, else use URL from body if provided
    if (req.files && req.files['bannerImage'] && req.files['bannerImage'][0]) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.cloudinary.uploader.upload_stream(
          {
            folder: 'anime/banners',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.files['bannerImage'][0].buffer);
      });
      updateData.bannerImage = result.secure_url;
    } else if (typeof req.body.bannerImage === 'string' && req.body.bannerImage.trim() !== '') {
      updateData.bannerImage = req.body.bannerImage.trim();
    } else {
      // Don't overwrite with empty or object
      delete updateData.bannerImage;
    }

    // screenshots upload (append)
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      updateData.images = Array.isArray(anime.images) ? [...anime.images] : [];
      for (const file of req.files['images']) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.cloudinary.uploader.upload_stream(
            { folder: 'anime/screens', resource_type: 'image' },
            (error, result) => { if (error) reject(error); else resolve(result); }
          ).end(file.buffer);
        });
        updateData.images.push(result.secure_url);
      }
    } else {
      // Don't overwrite with empty or object
      delete updateData.images;
    }

    // Normalize incoming fields robustly
    // genres
    if (typeof updateData.genres === 'string') {
      try {
        // Try JSON.parse, fallback to comma split
        updateData.genres = JSON.parse(updateData.genres);
      } catch {
        updateData.genres = updateData.genres.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    // tags
    if (typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch {
        updateData.tags = updateData.tags.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (typeof updateData.year === 'string') {
      const n = parseInt(updateData.year);
      updateData.year = Number.isNaN(n) ? undefined : n;
    }
    if (typeof updateData.totalEpisodes === 'string') {
      const n = parseInt(updateData.totalEpisodes);
      updateData.totalEpisodes = Number.isNaN(n) ? undefined : n;
    }

    // Coerce booleans coming as strings from forms
    ['featured','trending','commentsEnabled'].forEach((key) => {
      if (typeof updateData[key] === 'string') {
        if (updateData[key].toLowerCase() === 'true') updateData[key] = true;
        else if (updateData[key].toLowerCase() === 'false') updateData[key] = false;
      }
    });

    // Handle likes field - don't overwrite if it's a string representation of empty array
    if (typeof updateData.likes === 'string') {
      try {
        updateData.likes = JSON.parse(updateData.likes);
      } catch {
        // If it's not valid JSON, remove it to avoid overwriting
        delete updateData.likes;
      }
    }

    // Handle trailer field - don't overwrite if it's a string representation of object
    if (typeof updateData.trailer === 'string') {
      try {
        updateData.trailer = JSON.parse(updateData.trailer);
      } catch {
        // If it's not valid JSON, remove it to avoid overwriting
        delete updateData.trailer;
      }
    }

    // Allow admin to set dummy counters
    if (typeof updateData.dummyLikes === 'string') {
      const n = parseInt(updateData.dummyLikes);
      updateData.dummyLikes = Number.isNaN(n) ? undefined : n;
    }
    if (typeof updateData.dummyViews === 'string') {
      const n = parseInt(updateData.dummyViews);
      updateData.dummyViews = Number.isNaN(n) ? undefined : n;
    }

    // --- The outer try block correctly handles the save operation and catches errors ---
    
    Object.assign(anime, updateData);
    await anime.save();
    res.json(anime);
    
  } catch (error) { // The correct catch block for the outer try
    console.error('Anime update route error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete anime (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    
    anime.isActive = false;
    await anime.save();
    
    res.json({ message: 'Anime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Dedicated search route for live search suggestions

module.exports = router;