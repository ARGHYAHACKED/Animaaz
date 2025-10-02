const express = require('express');
const Curation = require('../models/Curation');
const Anime = require('../models/Anime');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();


// Get banner anime (returns full anime docs for frontend banner)
router.get('/banner', async (req, res) => {
  try {
    (`[CURATION] GET /api/curation/banner`);
    const curation = await Curation.findOne({ type: 'banner' });
    if (!curation || !curation.animeIds || curation.animeIds.length === 0) {
      return res.json([]);
    }
    // Populate full anime docs
    const animeList = await Anime.find({ _id: { $in: curation.animeIds }, isActive: true })
      .select('title description coverImage bannerImage images year status genres');
    // Sort by order in curation.animeIds
    const animeMap = {};
    animeList.forEach(a => { animeMap[a._id.toString()] = a; });
    const ordered = curation.animeIds.map(id => animeMap[id.toString()]).filter(Boolean);
    res.json(ordered);
  } catch (error) {
    console.error('[CURATION] GET /banner error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get curation by type (e.g., featured, trending, etc.)
router.get('/:type', async (req, res) => {
  try {
    (`[CURATION] GET /api/curation/${req.params.type}`);
    const curation = await Curation.findOne({ type: req.params.type })
      .populate('animeIds', 'title coverImage');
    if (!curation) {
      (`[CURATION] Not found for type: ${req.params.type}`);
      return res.status(404).json({ message: 'Curation not found' });
    }
    (`[CURATION] Found:`, curation);
    res.json(curation);
  } catch (error) {
    console.error('[CURATION] GET error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update curation (admin only)
router.put('/:type', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    (`[CURATION] PUT /api/curation/${req.params.type}`);
    ('Body:', req.body);
    const { animeIds, metadata } = req.body;
    let curation = await Curation.findOne({ type: req.params.type });
    if (!curation) {
      (`[CURATION] Creating new curation for type: ${req.params.type}`);
      curation = new Curation({ type: req.params.type, animeIds: [], metadata: {} });
    }
    curation.animeIds = animeIds;
    if (metadata) curation.metadata = metadata;
    curation.updatedBy = req.user._id;
    curation.updatedAt = new Date();
    await curation.save();
    await curation.populate('animeIds', 'title coverImage');
    ('[CURATION] Updated:', curation);
    res.json(curation);
  } catch (error) {
    console.error('[CURATION] PUT error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
