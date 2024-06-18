const express = require('express');
const router = express.Router();
const { createNews, updateNews, approveNews, getAllNews, deleteNews, getPendingNews, getOwnNews } = require('../controllers/newsController');
const { authMiddleware, adminMiddleware, reporterMiddleware } = require('../middleware/authMiddleware');

// Route to create news (reporter only)
router.post('/create', authMiddleware, reporterMiddleware, createNews);

// Route to update news (reporter only)
router.put('/update/:id', authMiddleware, reporterMiddleware, updateNews);

// Route to approve news (admin only)
router.patch('/approve/:id', authMiddleware, adminMiddleware, approveNews);

// Route to delete news (reporter or admin)
router.delete('/delete/:id', authMiddleware, deleteNews);

// Route to get all approved news (public)
router.get('/all', getAllNews);

// Route to get all pending news (admin only)
router.get('/pending', authMiddleware,adminMiddleware, getPendingNews);

// Route to get news authored by the logged-in reporter
router.get('/own', authMiddleware,reporterMiddleware, getOwnNews);

module.exports = router;
