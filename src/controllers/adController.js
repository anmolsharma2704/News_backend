// controllers/adController.js
const Ad = require('../models/Ad');

// Create a new ad
exports.createAd = async (req, res) => {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all ads, with optional filtering by expiration date and marketedBy
exports.getAds = async (req, res) => {
  try {
    const { expired, marketedBy } = req.query;
    let query = {};
    if (expired === 'true') {
      query.expiresAt = { $lt: new Date() };
    } else if (expired === 'false') {
      query.expiresAt = { $gte: new Date() };
    }
    if (marketedBy) {
      query.marketedBy = marketedBy;
    }
    const ads = await Ad.find(query);
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an ad by ID
exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an ad
exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.status(200).json(ad);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an ad
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.status(200).json({ message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
