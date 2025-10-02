

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Anime = require('../models/Anime');
const Group = require('../models/Group');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Set milestone anime for a user (admin only)
router.post('/users/:id/milestones', authMiddleware, adminMiddleware, async (req, res) => {
  // Body: { animeIds: [array of 5 anime ObjectIds] }
  try {
    const { animeIds } = req.body;
    if (!Array.isArray(animeIds) || animeIds.length !== 5) {
      return res.status(400).json({ message: 'Must provide exactly 5 anime IDs.' });
    }
    // Validate anime exist
    const foundAnime = await Anime.find({ _id: { $in: animeIds } });
    if (foundAnime.length !== 5) {
      return res.status(400).json({ message: 'One or more anime IDs are invalid.' });
    }
    // Set milestoneAnime for user (reset completed flags)
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.milestoneAnime = animeIds.map(id => ({ anime: id, completed: false }));
    await user.save();
    res.json({ message: 'Milestone anime set successfully', milestoneAnime: user.milestoneAnime });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get milestone anime for a user (admin only)
router.get('/users/:id/milestones', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('milestoneAnime.anime', 'title coverImage');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ milestoneAnime: user.milestoneAnime });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Real-time user stats endpoint
router.get('/user-stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    res.json({ totalUsers, onlineUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Admin Content Management Dashboard
router.get('/content_management', authMiddleware, adminMiddleware, async (req, res) => {
  // This endpoint can be expanded to return summary data for content management
  res.json({
    message: 'Admin Content Management Dashboard',
    endpoints: [
      '/admin/anime',
      '/admin/groups',
      '/admin/posts',
      '/admin/announcements',
      '/admin/reports',
      '/admin/users'
    ]
  });
});
// Get dashboard analytics
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalAnime: await Anime.countDocuments({ isActive: true }),
      totalGroups: await Group.countDocuments({ isActive: true }),
      totalPosts: await Post.countDocuments({ isActive: true }),
      pendingReports: await Report.countDocuments({ status: 'pending' })
    };
    
    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt');
    
    const recentAnime = await Anime.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title coverImage createdAt');
    
    // Popular content
    const popularAnime = await Anime.find({ isActive: true })
      .sort({ views: -1 })
      .limit(10)
      .select('title views likes rating');
    
    const popularGroups = await Group.find({ isActive: true })
      .sort({ 'members.length': -1 })
      .limit(10)
      .select('name members dummyMembers');
    
    // Monthly stats (simplified)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyStats = {
      newUsers: await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      newAnime: await Anime.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      newPosts: await Post.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    };
    
    res.json({
      stats,
      recentUsers,
      recentAnime,
      popularAnime,
      popularGroups,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add dummy likes to anime
router.post('/anime/:id/dummy-likes', authMiddleware, adminMiddleware, [
  body('count').isInt({ min: 0, max: 10000 })
], async (req, res) => {
  try {
    const { count } = req.body;
    
    const anime = await Anime.findById(req.params.id);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    
    anime.dummyLikes = count;
    await anime.save();
    
    res.json({ message: 'Dummy likes updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add dummy views to anime
router.post('/anime/:id/dummy-views', authMiddleware, adminMiddleware, [
  body('count').isInt({ min: 0, max: 1000000 })
], async (req, res) => {
  try {
    const { count } = req.body;
    
    const anime = await Anime.findById(req.params.id);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    
    anime.dummyViews = count;
    await anime.save();
    
    res.json({ message: 'Dummy views updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add dummy members to group
router.post('/groups/:id/dummy-members', authMiddleware, adminMiddleware, [
  body('count').isInt({ min: 0, max: 100000 })
], async (req, res) => {
  try {
    const { count } = req.body;
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    group.dummyMembers = count;
    await group.save();
    
    res.json({ message: 'Dummy members updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create announcement
router.post('/announcements', authMiddleware, adminMiddleware, [
  body('title').isLength({ min: 1, max: 200 }).trim().escape(),
  body('message').isLength({ min: 1, max: 2000 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      message,
      type,
      priority,
      showUntil,
      targetAudience
    } = req.body;
    
    const announcement = new Announcement({
      title,
      message,
      type,
      priority,
      showUntil: showUntil ? new Date(showUntil) : null,
      targetAudience,
      createdBy: req.user._id
    });
    
    await announcement.save();
    
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all announcements (also supports banners query)
router.get('/announcements', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.onlyBanners === 'true') Object.assign(filter, { bannerActive: true, bannerImage: { $exists: true, $ne: '' } });
    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');
    
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update announcement
router.put('/announcements/:id', authMiddleware, adminMiddleware, [
  body('title').optional().isLength({ min: 1, max: 200 }).trim().escape(),
  body('message').optional().isLength({ min: 1, max: 2000 }).trim().escape()
], async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    Object.assign(announcement, req.body);
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete announcement
router.delete('/announcements/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manage users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get users with profile photo
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    // For each user, get group and post details
    const userIds = users.map(u => u._id);
    // Groups: user is a member (in members array)
    const groups = await Group.find({ 'members.user': { $in: userIds } })
      .select('_id name avatar members');
    // Posts: user is the author
    const posts = await Post.find({ user: { $in: userIds } })
      .select('_id title createdAt user');

    // Map userId to groups and posts
    const groupMap = {};
    groups.forEach(g => {
      g.members.forEach(m => {
        const uid = m.user.toString();
        if (userIds.map(x => x.toString()).includes(uid)) {
          if (!groupMap[uid]) groupMap[uid] = [];
          groupMap[uid].push({ _id: g._id, name: g.name, avatar: g.avatar });
        }
      });
    });
    const postMap = {};
    posts.forEach(p => {
      const uid = p.user.toString();
      if (!postMap[uid]) postMap[uid] = [];
      postMap[uid].push({ _id: p._id, title: p.title, createdAt: p.createdAt });
    });

    // Attach group/post details and profile photo/avatar to each user
    const usersWithDetails = users.map(u => ({
      _id: u._id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt,
      profilePhoto: u.profilePhoto || '',
      avatar: u.avatar || '',
      isBanned: u.isBanned,
      role: u.role,
      groups: groupMap[u._id.toString()] || [],
      posts: postMap[u._id.toString()] || [],
      groupCount: (groupMap[u._id.toString()] || []).length,
      postCount: (postMap[u._id.toString()] || []).length
    }));

    // Log what is being sent for avatar/profilePhoto/groups/posts
    ('[ADMIN] /users user sample:', usersWithDetails.map(u => ({ username: u.username, avatar: u.avatar, groups: u.groups, posts: u.posts })));

    const total = await User.countDocuments();

    res.json({
      users: usersWithDetails,
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

// Ban/Unban user
router.post('/users/:id/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban admin users' });
    }
    
    user.isBanned = !user.isBanned;
    await user.save();
    
    res.json({ 
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      isBanned: user.isBanned
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export data
router.get('/export/:type', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    
    switch (type) {
      case 'users':
        data = await User.find().select('-password');
        break;
      case 'anime':
        data = await Anime.find();
        break;
      case 'reports':
        data = await Report.find()
          .populate('createdBy', 'username')
          .populate('reviewedBy', 'username');
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Below additional admin utilities
// Admin: quick anime options for dropdowns
router.get('/anime/options', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const search = req.query.search ? String(req.query.search) : '';
    const query = search ? { title: { $regex: search, $options: 'i' }, isActive: true } : { isActive: true };
    const anime = await Anime.find(query).sort({ updatedAt: -1 }).limit(50).select('title _id coverImage featured trending banner');
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: list all posts with pagination and search
router.get('/posts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search) : '';
    const query = search ? { $text: { $search: search } } : {};
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar');
    const total = await Post.countDocuments(query);
    res.json({ posts, pagination: { current: page, pages: Math.ceil(total / limit), total } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: edit a post
router.put('/posts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const updatable = ['title', 'content', 'type', 'tags', 'isPinned', 'isActive'];
    for (const key of updatable) {
      if (key in req.body) {
        post[key] = req.body[key];
      }
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: delete a post
router.delete('/posts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: boost likes (dummy)
router.post('/posts/:id/boost', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { count } = req.body || {};
    if (typeof count !== 'number' || count < 0) {
      return res.status(400).json({ message: 'Invalid count' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.dummyLikes = count;
    await post.save();
    res.json({ message: 'Dummy likes updated', dummyLikes: post.dummyLikes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: bulk update labels (trending/featured)
router.post('/anime/bulk-labels', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { trendingIds = [], featuredIds = [], bannerIds = [], topAiringIds = [], topWeekIds = [], forYouIds = [] } = req.body || {};
    ('[ADMIN] bulk-labels payload', {
      trendingIdsCount: Array.isArray(trendingIds) ? trendingIds.length : 'n/a',
      featuredIdsCount: Array.isArray(featuredIds) ? featuredIds.length : 'n/a',
      bannerIdsCount: Array.isArray(bannerIds) ? bannerIds.length : 'n/a',
      sample: {
        trending: trendingIds[0],
        featured: featuredIds[0],
        banner: bannerIds[0]
      }
    });
    if (Array.isArray(trendingIds)) {
      await Anime.updateMany({}, { $set: { trending: false } });
      if (trendingIds.length) await Anime.updateMany({ _id: { $in: trendingIds } }, { $set: { trending: true } });
    }
    if (Array.isArray(featuredIds)) {
      await Anime.updateMany({}, { $set: { featured: false } });
      if (featuredIds.length) await Anime.updateMany({ _id: { $in: featuredIds } }, { $set: { featured: true } });
    }
    if (Array.isArray(bannerIds)) {
      await Anime.updateMany({}, { $set: { banner: false } });
      if (bannerIds.length) await Anime.updateMany({ _id: { $in: bannerIds } }, { $set: { banner: true } });
    }
    if (Array.isArray(topAiringIds)) {
      await Anime.updateMany({}, { $set: { topAiring: false } });
      if (topAiringIds.length) await Anime.updateMany({ _id: { $in: topAiringIds } }, { $set: { topAiring: true } });
    }
    if (Array.isArray(topWeekIds)) {
      await Anime.updateMany({}, { $set: { topWeek: false } });
      if (topWeekIds.length) await Anime.updateMany({ _id: { $in: topWeekIds } }, { $set: { topWeek: true } });
    }
    if (Array.isArray(forYouIds)) {
      await Anime.updateMany({}, { $set: { forYou: false } });
      if (forYouIds.length) await Anime.updateMany({ _id: { $in: forYouIds } }, { $set: { forYou: true } });
    }
    const counts = await Anime.aggregate([
      { $group: { _id: null, banner: { $sum: { $cond: ['$banner', 1, 0] } }, featured: { $sum: { $cond: ['$featured', 1, 0] } }, trending: { $sum: { $cond: ['$trending', 1, 0] } }, topAiring: { $sum: { $cond: ['$topAiring', 1, 0] } }, topWeek: { $sum: { $cond: ['$topWeek', 1, 0] } }, forYou: { $sum: { $cond: ['$forYou', 1, 0] } } } }
    ]);
    ('[ADMIN] bulk-labels updated counts', counts[0] || {});
    res.json({ message: 'Labels updated', counts: counts[0] || {} });
  } catch (error) {
    console.error('[ADMIN] bulk-labels error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: quick counters update (dummy likes/views)
router.post('/anime/:id/counters', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { dummyLikes, dummyViews } = req.body || {};
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: 'Anime not found' });
    if (typeof dummyLikes === 'number') anime.dummyLikes = dummyLikes;
    if (typeof dummyViews === 'number') anime.dummyViews = dummyViews;
    await anime.save();
    res.json({ dummyLikes: anime.dummyLikes, dummyViews: anime.dummyViews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;