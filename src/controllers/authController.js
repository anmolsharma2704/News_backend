const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const nodemailer = require('nodemailer');
// Register a new user
exports.register = async (req, res) => {
    const { email, username, password, role } = req.body;

    try {
        // Check if user with the same email or username already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        
        if (user) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create a new User instance with hashed password
        user = new User({
            email,
            username,
            password: hashedPassword, // Store hashed password
            role
        });

        // Save user to the database
        await user.save();

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.SESSION_TIME },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        
        // Check for duplicate key error (MongoError)
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        res.status(500).send('Server error');
    }
};

// Login a user

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ email });
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
                res.json({ token, user: payload.user }); // Include user object in response
            }
        );
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};
// Controller function to request password reset
exports.forgotPassword = async (req, res) => {
  

  try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Generate and set reset token and expiration
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 900000; // 15 min

      await user.save();

      // Send reset password email
      await sendResetPasswordEmail(user.email, resetToken);

      res.status(200).json({ message: 'Reset password email sent' });
  } catch (error) {
      console.error('Forgot password error:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
};

// Controller function to reset password
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.params;
  const { newPassword } = req.body;

  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
          return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      // Clear reset token and expiration
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
      console.error('Reset password error:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
};
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
  }
});
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  // Generate OTP
  const otp = generateOTP();

  // Email content
  const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Your OTP for Password Reset',
      html: `
          <p>Your OTP for password reset is: <strong>${otp}</strong></p>
          <p>This OTP is valid for a limited time.</p>
      `
  };

  try {
      // Send email
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent successfully', otp });
  } catch (error) {
      console.error('Error sending email:', error.message);
      res.status(500).json({ message: 'Failed to send OTP' });
  }
}