const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    images: [{ type: String }],
    youtubeLink: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
