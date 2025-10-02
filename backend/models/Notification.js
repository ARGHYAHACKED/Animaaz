const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    type: {
      type: String,
      enum: ['reply', 'mention', 'like', 'follow', 'group-update', 'anime-update', 'system'],
      default: 'system',
    },
    title: { type: String, trim: true },
    message: { type: String, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityType: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);


