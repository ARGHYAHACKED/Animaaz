const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  title: {
    type: String,
    maxlength: 200
  },
  images: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  relatedAnime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime'
  },
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
  reactions: [{
    type: {
      type: String,
      enum: ['love', 'laugh', 'angry', 'sad', 'wow'],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  spoiler: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['discussion', 'news', 'review', 'recommendation', 'meme', 'manga'],
    default: 'discussion'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  dummyLikes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);