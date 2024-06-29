const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const ErrorHander = require("../utils/errorhander.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const sendToken = require("../utils/jwtToken.js");
const sendEmail = require("../utils/sendEmail.js");

// Register a new user
exports.registerUser = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Check if user with the same email or username already exists
        let user = await User.findOne({ email });
        
        if (user) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create new user
        user = new User({
            email,
            username,
            password
        });

        // Save user
        await user.save();

        // Generate and send token
        sendToken(user, 201, res);

    } catch (err) {
        console.error(err.message);

        // Check for duplicate key error (MongoError)
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Duplicate field value entered' });
        }

        res.status(500).send('Server error');
    }
};

// Login User

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the user account is active
        if (user.status !== "active") {
            return res.status(400).json({ message: 'Your account is not active' });
        }

        // Generate JWT token and send it using sendToken function
          // Generate JWT token and include user role in response
     const payload = {
    user: {
        id: user.id,
        role: user.role
    }
};

jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
    (err, token) => {
        if (err) throw err;

        // Set cookie options
        const options = {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        // Set the cookie and send JSON response
        res.cookie('token', token, options).json({ token, user: payload.user });
    }
);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};
        

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email, baseURL } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return 404 error
    if (!user) {
        return next(new ErrorHander('User not found', 404));
    }

    // Generate reset password token
    const resetToken = user.getResetPasswordToken();

    // Save user with reset token and expiration (disable schema validation)
    await user.save({ validateBeforeSave: false });

    // Construct reset password URL
    const resetPasswordUrl = `${baseURL}/password/reset/${resetToken}`;

    // Email message
    const message = `
        Dear User,

        We received a request to reset your password for your ${process.env.COMPANY_NAME} account. If you made this request, please click the link below to reset your password:

        ${resetPasswordUrl}

        This link is valid for 15 minutes. After that, you will need to request a new password reset.

        If you did not request a password reset, please ignore this email. Your account remains secure, and no changes have been made.

        For any further assistance, please contact our support team at support@${process.env.COMPANY_NAME.toLowerCase()}.com.

        Best regards,

        The ${process.env.COMPANY_NAME} Team

        Note: Please be cautious and make sure to secure your account by using a strong password and updating it regularly. If you suspect any unauthorized access, contact our support team immediately.
    `;

    try {
        // Send email
        await sendEmail({
            email: user.email,
            subject: `Password Recovery for ${process.env.COMPANY_NAME}`,
            message,
        });

        // Respond with success message
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully.`,
        });
    } catch (error) {
        // If sending email fails, clean up reset token and expiration
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        // Return error to next middleware
        return next(new ErrorHander('Email could not be sent.', 500));
    }
});

  
// Reset Password
exports.resetPassword = async (req, res, next) => {
    const { resetToken, password } = req.body;
  
    if (!resetToken || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
  
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
  
        if (!user) {
            return res.status(400).json({ error: 'Reset Password Token is invalid or has expired' });
        }
  
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
  
        await user.save();
  
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

