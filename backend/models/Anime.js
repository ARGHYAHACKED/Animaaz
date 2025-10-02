const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  number: { type: Number},
  title: { type: String},
  description: String,
  duration: Number, // in minutes
  watchLink: String,
  thumbnail: String,
  airDate: Date
});

const animeSchema = new mongoose.Schema({
  Indexcountfordatabase: { type: Number, index: true },
  title: { type: String,trim: true },
  title_english: String,
  title_japanese: String,
  title_synonyms: [String],
  alternativeTitles: [String],
  description: { type: String,maxlength: 10000 },
  background: String,
  tags: [String],
  genres: [String],
  coverImage: { type: String },
  bannerImage: String,
  images: [String],
  trailer: {
    youtube_id: String,
    url: String,
    embed_url: String,
    images: {
      image_url: String,
      small_image_url: String,
      medium_image_url: String,
      large_image_url: String,
      maximum_image_url: String
    }
  },
  producers: [{ mal_id: Number, name: String, url: String }],
  studios: [{ mal_id: Number, name: String, url: String }],
  licensors: [{ mal_id: Number, name: String, url: String }],
  aired: {
    from: Date,
    to: Date,
    string: String
  },
  duration: String,
  episodes: [episodeSchema],
  totalEpisodes: { type: Number, default: 0 },
  status: { type: String, enum: ['ongoing', 'completed', 'upcoming'], default: 'upcoming' },
  season: { type: String, enum: ['spring', 'summer', 'fall', 'winter'] },
  year: Number,
  studio: String,
  director: String,
  rating: { type: String }, // e.g. "PG-13"
  score: { type: Number, min: 0, max: 10, default: 0 },
  scored_by: Number,
  rank: Number,
  popularity: Number,
  members: Number,
  favorites: Number,
  watchLinks: [{ platform: String, url: String, quality: String }],
  likes: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
  views: { type: Number, default: 0 },
  dummyLikes: { type: Number, default: 0 },
  dummyViews: { type: Number, default: 0 },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, min: 1, max: 5 }
  }],
  commentsEnabled: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  banner: {
    type: Boolean,
    default: false
  },
  topAiring: {
    type: Boolean,
    default: false
  },
  topWeek: {
    type: Boolean,
    default: false
  },
  forYou: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

animeSchema.index({ title: 'text', description: 'text', tags: 'text', genres: 'text' });
animeSchema.index({ genres: 1, status: 1 });
animeSchema.index({ year: -1, rating: -1 });

module.exports = mongoose.model('Anime', animeSchema);