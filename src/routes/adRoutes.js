// routes/adRoutes.js
const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');

// Create a new ad
router.post('/ads', adController.createAd);

// Get all ads, with optional filtering by expiration date and marketedBy
router.get('/ads', adController.getAds);

// Get an ad by ID
router.get('/ads/:id', adController.getAdById);

// Update an ad
router.put('/ads/:id', adController.updateAd);

// Delete an ad
router.delete('/ads/:id', adController.deleteAd);

module.exports = router;
