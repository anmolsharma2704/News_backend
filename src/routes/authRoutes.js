const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { authMiddleware,adminMiddleware } = require('../middleware/authMiddleware');

// User Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset', resetPassword); // Corrected endpoint path for password reset

module.exports = router;
