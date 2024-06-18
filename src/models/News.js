// models/News.js

const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  city: String,
  state: String,
  images: [{
    type: String, // Store image URLs or paths
    
  }],
  youtubeLink: String,
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'draft'],
    default: 'pending',
  },
});

module.exports = mongoose.model('News', newsSchema);
