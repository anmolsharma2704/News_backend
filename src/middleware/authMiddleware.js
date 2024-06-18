const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware to check if the user is an admin
exports.adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Middleware to check if the user is a reporter
exports.reporterMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'reporter') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
