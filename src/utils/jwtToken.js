// utils/sendToken.js
const jwt = require('jsonwebtoken');

function sendToken(user, statusCode, res) {
  const token = user.getJWTToken();

  // Options for cookie
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  // Send response with token as a cookie and JSON data
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        role: user.role
      }
    });
}

module.exports = sendToken;
