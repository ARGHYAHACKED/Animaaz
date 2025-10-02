const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'post', 'comment', 'anime', 'group'],
    required: true
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate-content', 'copyright', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  adminNote: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ createdBy: 1, targetId: 1, targetType: 1 });

module.exports = mongoose.model('Report', reportSchema);