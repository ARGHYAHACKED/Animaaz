const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  anime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime'
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ anime: 1, createdAt: 1 });
commentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);