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
        enum: ['pending', 'approved'],
        default: 'pending',
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update updatedAt field on modification
newsSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});


module.exports = mongoose.model('News', newsSchema);
