const express = require('express');
const router = express.Router();
const { suspendUser, activateUser } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.patch('/suspend/:id', authMiddleware, adminMiddleware, suspendUser);
router.patch('/activate/:id', authMiddleware, adminMiddleware, activateUser);

module.exports = router;
