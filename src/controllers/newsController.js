// src/controllers/newsController.js

const News = require('../models/News');
const upload = require('../middleware/multerMiddleware');

exports.createNews = async (req, res) => {
    upload.array('images')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        const author = req.user.id;
        const { title, content, city, state, youtubeLink } = req.body;
        const images = req.files ? req.files.map(file => file.path) : [];

        try {
            const news = new News({
                title,
                content,
                city,
                state,
                images,
                youtubeLink,
                reporter: author,
                status: 'pending',
            });

            await news.save();
            res.json({ message: 'News article created successfully', news });
        } catch (error) {
            console.error('Create news error:', error.message);
            res.status(500).send('Server error');
        }
    });
};

exports.updateNews = async (req, res) => {
    upload.array('images')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        const { title, content, city, state, youtubeLink } = req.body;
        const newsId = req.params.id;
        const author = req.user.id;
        const images = req.files ? req.files.map(file => file.path) : [];

        try {
            let news = await News.findById(newsId);

            if (!news) {
                return res.status(404).json({ message: 'News article not found' });
            }

            if (news.reporter.toString() !== author) {
                return res.status(401).json({ message: 'Unauthorized, you can only update your articles' });
            }

            news.title = title || news.title;
            news.content = content || news.content;
            news.city = city || news.city;
            news.state = state || news.state;
            news.images = images.length > 0 ? images : news.images;
            news.youtubeLink = youtubeLink || news.youtubeLink;
            news.status = 'pending';

            await news.save();

            res.json({ message: 'News article updated successfully', news });
        } catch (error) {
            console.error('Update news error:', error.message);
            res.status(500).send('Server error');
        }
    });
};

// Approve a news article (only accessible to admins)
exports.approveNews = async (req, res) => {
    const newsId = req.params.id;

    try {
        let news = await News.findByIdAndUpdate(newsId, { status: 'approved' }, { new: true });

        if (!news) {
            return res.status(404).json({ message: 'News article not found' });
        }

        // Implement admin authorization check here if needed

        res.json({ message: 'News article approved successfully', news });
    } catch (error) {
        console.error('Approve news error:', error.message);
        res.status(500).send('Server error');
    }
};

// Retrieve all approved news articles
exports.getAllNews = async (req, res) => {
    try {
        const news = await News.find({ status: 'approved' }).populate('reporter', ['username', 'email']);
        res.json(news);
    } catch (error) {
        console.error('Get all news error:', error.message);
        res.status(500).send('Server error');
    }
};

// Delete a news article
exports.deleteNews = async (req, res) => {
    try {
        const newsId = req.params.id;
        const userId = req.user.id;

        // Find the news article by ID
        const news = await News.findById(newsId);

        if (!news) {
            return res.status(404).json({ message: 'News article not found' });
        }

        // Check if the user is authorized to delete
        if (news.reporter.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete the news article
        await News.findByIdAndDelete(newsId);

        res.json({ message: 'News article deleted successfully' });
    } catch (error) {
        console.error('Delete news error:', error.message);
        res.status(500).send('Server error');
    }
};

// Get all pending news articles (admin view)
exports.getPendingNews = async (req, res) => {
    try {
        const pendingNews = await News.find({ status: 'pending' }).populate('reporter', ['username', 'email']);
        res.json(pendingNews);
    } catch (error) {
        console.error('Get pending news error:', error.message);
        res.status(500).send('Server error');
    }
};

// Get news articles authored by the logged-in reporter
exports.getOwnNews = async (req, res) => {
    try {
        const author = req.user.id;
        const news = await News.find({ reporter: author });
        res.json(news);
    } catch (error) {
        console.error('Get own news error:', error.message);
        res.status(500).send('Server error');
    }
};
