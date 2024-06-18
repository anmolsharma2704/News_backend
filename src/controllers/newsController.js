const News = require('../models/News');

// Create a news article
exports.createNews = async (req, res) => {
    const { title, content, city, state, images, youtubeLink } = req.body;
    const author = req.user.id;

    try {
        const news = new News({
            title,
            content,
            city,
            state,
            images,
            youtubeLink,
            author
        });

        await news.save();
        res.status(201).json({ message: 'News article created successfully', news });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Update a news article
exports.updateNews = async (req, res) => {
    const { title, content, city, state, images, youtubeLink } = req.body;
    const newsId = req.params.id;
    const author = req.user.id;

    try {
        let news = await News.findById(newsId);

        if (!news) {
            return res.status(404).json({ message: 'News article not found' });
        }

        // Ensure the reporter is updating their own news article
        if (news.author.toString() !== author) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        news = await News.findByIdAndUpdate(
            newsId,
            { $set: { title, content, city, state, images, youtubeLink } },
            { new: true }
        );

        res.json({ message: 'News article updated successfully', news });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Approve a news article
exports.approveNews = async (req, res) => {
    const newsId = req.params.id;

    try {
        let news = await News.findById(newsId);

        if (!news) {
            return res.status(404).json({ message: 'News article not found' });
        }

        news.status = 'approved';
        await news.save();

        res.json({ message: 'News article approved successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Retrieve all news articles
exports.getAllNews = async (req, res) => {
    try {
        const news = await News.find({ status: 'approved' }).populate('author', ['username', 'email']);
        res.json(news);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};



exports.deleteNews = async (req, res) => {
    try {
        const newsId = req.params.id;
        const userId = req.user.id;

        // Find the news article by ID
        const news = await News.findById(newsId);

        // Check if the news article exists
        if (!news) {
            return res.status(404).json({ message: 'News article not found' });
        }

        // Check if the user is the author of the news or an admin
        if (news.author.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete the news article
        await News.findByIdAndRemove(newsId);

        res.json({ message: 'News article deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};
