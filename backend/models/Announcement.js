const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'maintenance'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  bannerImage: String,
  bannerLink: String,
  bannerActive: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showUntil: Date,
  targetAudience: {
    type: String,
    enum: ['all', 'users', 'admins'],
    default: 'all'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1, showUntil: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);