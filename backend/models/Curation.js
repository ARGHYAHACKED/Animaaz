const mongoose = require('mongoose');

const CurationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['featured', 'trending', 'banner', 'topAiring', 'topWeek', 'forYou'],
    unique: true
  },
  animeIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: true
  }],
  metadata: {
    type: Object,
    default: {}
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Curation', CurationSchema);
