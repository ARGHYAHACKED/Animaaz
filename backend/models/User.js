const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  cover: {
    type: String,
    default: ''
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime'
  }],
  watchlist: [{
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime'
    },
    status: {
      type: String,
      enum: ['watching', 'completed', 'plan-to-watch', 'dropped'],
      default: 'plan-to-watch'
    }
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  favoriteGenres: [String],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      newAnime: { type: Boolean, default: true },
      groupUpdates: { type: Boolean, default: true }
    }
  },
  loginHistory: [{
    date: { type: Date, default: Date.now }
  }],
  // Milestone anime roadmap (admin sets, user marks complete)
  milestoneAnime: [{
    anime: { type: mongoose.Schema.Types.ObjectId, ref: 'Anime', required: true },
    completed: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

userSchema.index({ username: 'text', email: 'text' });

module.exports = mongoose.model('User', userSchema);