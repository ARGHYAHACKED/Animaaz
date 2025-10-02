const express = require('express');
const router = express.Router();
// Assuming Anime model is correctly imported
const Anime = require('../models/Anime'); 

// Updated mood-to-genres mapping
const moodGenresMap = {
  // 🎭 Emotional Moods
  'feel-good-vibes': ['Slice of Life', 'Comedy', 'Family'],
  'tearjerker-nights': ['Drama', 'Romance', 'Tragedy'],
  'chill-cozy': ['Slice of Life', 'Iyashikei', 'Comedy'],
  'adrenaline-rush': ['Action', 'Sports', 'Shounen'],
  'mind-bender': ['Psychological', 'Mystery', 'Thriller'],
  'romantic-feels': ['Romance',],
  // 🌌 Atmosphere Moods
  'dreamscape': ['Fantasy', 'Isekai', 'Adventure'],
  'dark-gritty': ['Horror', 'Seinen', 'Thriller'],
  'nostalgia-lane': ['Kids', 'Family', 'Adventure'],
  'epic-journeys': ['Adventure', 'Fantasy', 'Action'],
  'laugh-out-loud': ['Comedy', 'Parody', 'Slice of Life'],
  'calm-before-sleep': ['Slice of Life', 'Iyashikei', 'Drama'],
  // 🎶 Energy-Based Moods
  'high-energy': ['Shounen', 'Action', 'Sports'],
  'slow-burn': ['Drama', 'Slice of Life', 'Romance'],
  'aesthetic-mood': ['Award Winning', 'Slice of Life', 'Drama'],
  'cozy-rainy-day': ['Slice of Life', 'Iyashikei', 'Drama']
};

// Define the size of the results segment and the total pool size
const SEGMENT_SIZE = 500;
const TOTAL_POOL_SIZE = 5000; // Total count of anime we want to query from
const RESULTS_PER_PAGE = 20; // Number of final results to show per page/request

router.get('/:mood', async (req, res) => {
  // Normalize mood string to match keys
  const normalizedMood = req.params.mood.toLowerCase().replace(/\s|_/g, '-');
  const genres = moodGenresMap[normalizedMood] || ['Slice of Life'];
    
  // Get the current segment number (page 1 is segment 1)
  const page = parseInt(req.query.page, 10) || 1; 
    
// ----------------------------------------------------------------------
// 1. CALCULATE INDEX COUNT RANGE
// ----------------------------------------------------------------------
  // The index starts from 1 (based on the import script), so page 1 starts at 1.
  const startIndex = (page - 1) * SEGMENT_SIZE + 1; // e.g., page 1: 1, page 2: 501
  const endIndex = page * SEGMENT_SIZE;             // e.g., page 1: 500, page 2: 1000

  // Prevent fetching beyond the total desired pool size
  if (startIndex > TOTAL_POOL_SIZE) {
    return res.json({ 
      mood: normalizedMood, 
      page,
      anime: [] // Return empty array if we've exhausted the pool
    });
  }

  try {
    // Define the MongoDB Aggregation Pipeline
    const pipeline = [
      // 1. Match: Filter by genres, active status, and the Index count segment
      {
        $match: {
          genres: { $in: genres },
          isActive: true,
          // Use your custom count field for segmentation
          Indexcountfordatabase: { 
            $gte: startIndex, 
            $lte: endIndex 
          } 
        }
      },
      // 2. Sample: Select a truly random subset of 20 documents from the matched segment
      {
        $sample: { size: RESULTS_PER_PAGE }
      },
      // 3. Project: Select (include) only the necessary fields
      {
        $project: {
          title: 1, 
          description: 1, 
          coverImage: 1, 
          bannerImage: 1, 
          images: 1, 
          year: 1, 
          status: 1, 
          genres: 1, 
          score: 1, 
          popularity: 1, 
          views: 1, 
          likes: 1, 
          dummyViews: 1, 
          dummyLikes: 1, 
          _id: 1 // Important for Mongoose and client routing
        }
      }
    ];

    // Execute the aggregation pipeline
    const animeList = await Anime.aggregate(pipeline);

    return res.json({ 
        mood: normalizedMood, 
        genres, 
        page,
        startIndex, 
        endIndex,
        anime: animeList 
    });
    
  } catch (error) {
    console.error('Error fetching anime for mood:', error);
    return res.status(500).json({ error: 'Failed to fetch anime for mood.' });
  }
});

module.exports = router;