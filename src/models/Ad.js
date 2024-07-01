// models/Ad.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  image: { type: String },
  marketedBy: { type: String, required: true }, // Marketed by
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }, // Expiration date
});

module.exports = mongoose.model('Ad', adSchema);
