// controllers/auth.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, telephoneNumber } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, msg: "User already exists" });
    }

    // Hash the password

    // Create new user
    user = new User({
      name,
      email,
      password,
      telephoneNumber
    });

    await user.save();

    res.status(200).json({ success: true, msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, msg: "Please provide an email and password" });
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).json({ success: false, msg: "Invalid credentials" });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, msg: "Invalid credentials" });
  }

  // Create token
  // const token = user.getSignedJwtToken();

  // res.status(200).json({ success: true, token });
  sendTokenResponse(user, 200, res);
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// At the end of file
// @desc Get current logged in user
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  // Clear the token from cookies
  res.clearCookie('token');

  res.status(200).json({ success: true, msg: 'User logged out successfully' });
};



const { generateOTP, sendEmail } = require('../utils/email');


// Route to send OTP for email verification
exports.sendVerificationOTP = async (req, res, next) => {
  try {
    console.log("w123",req.user)
    const {email} = req.user;
    console.log(email)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    await sendEmail(email, 'Email Verification OTP', `Your OTP is: ${otp}`); // Implement sendEmail function

    // You can save the OTP in the user document for comparison later if needed
    user.otp = otp;
    await user.save();

    res.status(200).json({ success: true, message: 'OTP sent successfully', otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to send OTP' });
  }
};
