const News = require('../models/News');

// Create a news article
exports.createNews = async (req, res) => {
    const author = req.user.id;
    const { title, content, city, state, images, youtubeLink } = req.body;

    try {
        const news = new News({
            title,
            content,
            city,
            state,
            images,
            youtubeLink,
            reporter: author,
            status: 'pending', // or 'draft' based on your application logic
        });

        await news.save();
        res.json({ message: 'News article created successfully', news });
    } catch (error) {
        console.error('Create news error:', error.message);
        res.status(500).send('Server error');
    }
};

// Update a news article
exports.updateNews = async (req, res) => {
    const { title, content, city, state, images, youtubeLink } = req.body;
    const newsId = req.params.id;
    const author = req.user.id;

    try {
        let news = await News.findByIdAndUpdate(newsId, {
            title,
            content,
            city,
            state,
            images,
            youtubeLink,
            status: 'pending', // or update status based on your application logic
        }, { new: true });

        if (!news) {
            return res.status(404).json({ message: 'News article not found' });
        }

        // Ensure the reporter is updating their own news article
        if (news.reporter.toString() !== author) {
            return res.status(401).json({ message: 'Unauthorized, you can only update your articles' });
        }

        res.json({ message: 'News article updated successfully', news });
    } catch (error) {
        console.error('Update news error:', error.message);
        res.status(500).send('Server error');
    }
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
