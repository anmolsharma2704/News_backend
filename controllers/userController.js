const User = require('../models/User');

// Suspend a user account
exports.suspendUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = 'suspended';
        await user.save();
        res.json({ message: 'User suspended successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Activate a user account
exports.activateUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = 'active';
        await user.save();
        res.json({ message: 'User activated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};