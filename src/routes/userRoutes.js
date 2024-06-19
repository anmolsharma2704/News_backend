const express = require('express');
const router = express.Router();
const { suspendUser, activateUser,getAllUsers } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.patch('/suspend/:id', authMiddleware, adminMiddleware, suspendUser);
router.patch('/activate/:id', authMiddleware, adminMiddleware, activateUser);
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
