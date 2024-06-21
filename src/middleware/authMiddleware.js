const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
};


// Helper function to fetch user and verify role
const fetchUserAndVerifyRole = async (req, roles) => {
    if (!req.user || !req.user.id) {
        throw new Error('Authorization required');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        throw new Error('User not found');
    }

    if (roles && !roles.includes(user.role)) {
        throw new Error('Access denied');
    }

    return user;
};

// Middleware to check if the user is an admin
exports.adminMiddleware = async (req, res, next) => {
    try {
        await fetchUserAndVerifyRole(req, ['admin']);
        next();
    } catch (err) {
        console.error('Admin middleware error:', err.message);
        res.status(err.message === 'User not found' ? 404 : 403).json({ message: err.message });
    }
};

// Middleware to check if the user is a reporter or trusted-reporter
exports.reporterMiddleware = async (req, res, next) => {
    try {
        await fetchUserAndVerifyRole(req, ['reporter', 'trusted-reporter']);
        next();
    } catch (err) {
        console.error('Reporter middleware error:', err.message);
        res.status(err.message === 'User not found' ? 404 : 403).json({ message: err.message });
    }
};
