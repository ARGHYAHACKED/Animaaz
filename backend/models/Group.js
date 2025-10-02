const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  type: { type: String, enum: ['watch-party', 'discussion', 'contest'], default: 'discussion' },
  isActive: { type: Boolean, default: true }
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  votes: [{
    option: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  avatar: String,
  banner: String,
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  dummyMembers: {
    type: Number,
    default: 0
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  relatedAnime: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime'
  }],
  events: [eventSchema],
  polls: [pollSchema],
  messages: [messageSchema],
  tags: [String],
  isPrivate: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['general', 'anime-specific', 'genre', 'seasonal', 'discussion'],
    default: 'general'
  },
  rules: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

groupSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Group', groupSchema);