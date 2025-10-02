const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Get conversation list (last message per user)
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const pipeline = [
      { $match: { $or: [ { from: req.user._id }, { to: req.user._id } ] } },
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: { $cond: [ { $eq: ['$from', req.user._id] }, '$to', '$from' ] },
        lastMessage: { $first: '$$ROOT' }
      }},
      { $limit: 50 }
    ];
    const results = await Message.aggregate(pipeline);
    const userIds = results.map(r => r._id);
    const users = await User.find({ _id: { $in: userIds } }).select('username avatar');
    const map = new Map(users.map(u => [u._id.toString(), u]));
    const enriched = results.map(r => ({
      _id: r._id,
      lastMessage: r.lastMessage,
      user: map.get(r._id.toString()) || null,
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages with a user
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const other = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: req.user._id, to: other },
        { from: other, to: req.user._id },
      ],
      deletedBy: { $ne: req.user._id },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send message
router.post('/:userId', authMiddleware, [
  body('content').isLength({ min: 1, max: 5000 }).trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const msg = new Message({
      from: req.user._id,
      to: req.params.userId,
      content: req.body.content,
    });
    await msg.save();
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark conversation read
router.post('/:userId/read', authMiddleware, async (req, res) => {
  try {
    await Message.updateMany({
      from: req.params.userId,
      to: req.user._id,
      readAt: { $exists: false },
    }, { $set: { readAt: new Date() } });
    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


