const express = require('express');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Create report
router.post('/', authMiddleware, [
  body('targetId').isMongoId(),
  body('targetType').isIn(['user', 'post', 'comment', 'anime', 'group']),
  body('reason').isIn(['spam', 'harassment', 'inappropriate-content', 'copyright', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { targetId, targetType, reason, description } = req.body;
    
    // Check if user already reported this target
    const existingReport = await Report.findOne({
      targetId,
      targetType,
      createdBy: req.user._id
    });
    
    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this content' });
    }
    
    const report = new Report({
      targetId,
      targetType,
      reason,
      description,
      createdBy: req.user._id
    });
    
    await report.save();
    
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all reports (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { status, targetType } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (targetType) {
      query.targetType = targetType;
    }
    
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username email')
      .populate('reviewedBy', 'username');
    
    const total = await Report.countDocuments(query);
    
    res.json({
      reports,
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

// Update report status
router.put('/:id', authMiddleware, adminMiddleware, [
  body('status').isIn(['pending', 'reviewing', 'resolved', 'dismissed']),
  body('adminNote').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    report.status = status;
    report.adminNote = adminNote;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    
    await report.save();
    
    res.json({ message: 'Report updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;