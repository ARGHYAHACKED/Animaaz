const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// List current user's notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: req.user._id });

    res.json({
      notifications,
      pagination: { current: page, pages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notifications as read
router.post('/mark-read', authMiddleware, [
  body('ids').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ids } = req.body;
    const match = { user: req.user._id };
    if (Array.isArray(ids) && ids.length > 0) {
      match._id = { $in: ids };
    }
    await Notification.updateMany(match, { $set: { isRead: true } });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create system notification (internal helper)
router.post('/', authMiddleware, [
  body('user').isMongoId(),
  body('type').optional().isString(),
  body('title').optional().isString(),
  body('message').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const notif = new Notification(req.body);
    await notif.save();
    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


