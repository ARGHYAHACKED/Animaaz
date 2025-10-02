
const express = require('express');
const { body, validationResult } = require('express-validator');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const stream = require('stream');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 }});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { search, category } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }
    
    const groups = await Group.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username')
      .populate('relatedAnime', 'title coverImage')
      .select('name description avatar members dummyMembers category tags createdAt');
    
    const total = await Group.countDocuments(query);
    
    res.json({
      groups,
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

// Get single group
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'username avatar')
      .populate('moderators', 'username avatar')
      .populate('relatedAnime', 'title coverImage')
      .populate('createdBy', 'username avatar')
      .populate('messages.user', 'username avatar');
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Post a simple message to group (no realtime)
router.post('/:id/messages', authMiddleware, [
  body('text').isLength({ min: 1, max: 1000 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Join the group to send messages' });
    }

    group.messages.push({ user: req.user._id, text: req.body.text });
    await group.save();
    // Populate the last message's user
    await group.populate('messages.user', 'username avatar');
    const last = group.messages[group.messages.length - 1];

    // Emit real-time event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`group-${group._id}`).emit('new-message', {
        groupId: group._id.toString(),
        message: {
          _id: last._id,
          user: last.user,
          text: last.text,
          createdAt: last.createdAt
        }
      });
    }

    res.status(201).json(last);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join group
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }
    group.members.push({
      user: req.user._id,
      joinedAt: new Date()
    });
    await group.save();
    // Add group to user's groups array
    const User = require('../models/User');
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { groups: group._id } }
    );
    res.json({ message: 'Joined group successfully', membersCount: group.members.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave group
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    group.members = group.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );
    await group.save();
    // Remove group from user's groups array
    const User = require('../models/User');
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { groups: group._id } }
    );
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create group (Admin only)
router.post('/', authMiddleware, upload.single('avatar'), [
  body('name').isLength({ min: 1, max: 100 }).trim().escape(),
  body('description').isLength({ min: 1, max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    let avatarUrl = '';
    if (req.file) {
      // Upload avatar to Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      avatarUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'group-avatars', resource_type: 'image' }, (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }).end(req.file.buffer);
      });
    }
    const {
      name,
      description,
      category,
      tags,
      relatedAnime,
      rules
    } = req.body;
    const group = new Group({
      name,
      description,
      category,
      tags: tags ? tags.split(',') : [],
      relatedAnime: relatedAnime || [],
      rules: rules || [],
      createdBy: req.user._id,
      avatar: avatarUrl,
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    console.error('Error in group creation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update group (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    Object.assign(group, req.body);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete group (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    group.isActive = false;
    await group.save();
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign moderators (Admin only)
router.post('/:id/moderators', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userIds } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    group.moderators = userIds || [];
    await group.save();
    res.json({ message: 'Moderators updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create event in group
router.post('/:id/events', authMiddleware, [
  body('title').isLength({ min: 1, max: 200 }).trim().escape(),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is member or moderator
    const member = group.members.find(
      m => m.user.toString() === req.user._id.toString()
    );
    
    if (!member || (member.role === 'member' && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized to create events' });
    }
    
    const { title, description, date, type } = req.body;
    
    group.events.push({
      title,
      description,
      date: new Date(date),
      type
    });
    
    await group.save();
    
    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create poll in group
router.post('/:id/polls', authMiddleware, [
  body('question').isLength({ min: 1, max: 500 }).trim().escape(),
  body('options').isArray({ min: 2, max: 10 })
], async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only group creator (admin) can create polls
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the group creator can create polls' });
    }

    const { question, options, expiresAt } = req.body;

    group.polls.push({
      question,
      options,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await group.save();

    res.status(201).json({ message: 'Poll created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on poll
router.post('/:groupId/polls/:pollId/vote', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const poll = group.polls.id(req.params.pollId);
    if (!poll || !poll.isActive) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    
    const { option } = req.body;
    
    // Remove existing vote
    poll.votes = poll.votes.filter(
      vote => vote.user.toString() !== req.user._id.toString()
    );
    
    // Add new vote
    poll.votes.push({
      option: parseInt(option),
      user: req.user._id
    });
    
    await group.save();
    
    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete poll in group (admin only)
router.delete('/:groupId/polls/:pollId', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    // Only group creator can delete polls
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the group creator can delete polls' });
    }
    const poll = group.polls.id(req.params.pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    group.polls.pull(poll._id);
    await group.save();
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;