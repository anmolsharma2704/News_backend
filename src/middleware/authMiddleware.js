// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        // console.log('No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    // console.log('Token:', token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Decoded:', decoded);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware to check if the user is an admin
exports.adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            console.error('No user ID in request');
            return res.status(401).json({ message: 'Authorization required' });
        }
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (err) {
        console.error('Admin middleware error:', err.message);
        res.status(500).send('Server error');
    }
};

// Middleware to check if the user is a reporter
exports.reporterMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            console.error('No user ID in request');
            return res.status(401).json({ message: 'Authorization required' });
        }
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'reporter') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (err) {
        console.error('Reporter middleware error:', err.message);
        res.status(500).send('Server error');
    }
};
