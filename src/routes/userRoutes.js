const express = require('express');
const router = express.Router();
const { suspendUser, activateUser,getAllUsers,updateUserRole } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.patch('/suspended/:id', authMiddleware, adminMiddleware, suspendUser);
router.patch('/active/:id', authMiddleware, adminMiddleware, activateUser);
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);
router.patch('/:role/:id', authMiddleware, adminMiddleware, updateUserRole);

module.exports = router;
