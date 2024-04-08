// controllers/auth.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

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
      telephoneNumber,
      otp: { value :generateOTP(), expiresAt: new Date(Date.now() + 300000) },
      resetPasswordToken: { token: crypto.randomBytes(20).toString('hex'), expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hours ago
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
  const user = await User.findOne({ email, googleAuth: false }).select("+password");

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
  console.log("res",res)
  sendTokenResponse(user, 200, res);
};

exports.loginWithGoogle = async (req, res) => {
  const authorization_token = req.query;
  console.log({ auth_server_response: authorization_token });
  const utils = require('./utils.js');
  console.log(utils)

  try {
    const response = await utils.get_access_token(authorization_token.code);
    const { access_token } = response.data;
    const user = await utils.get_profile_data(access_token);
    const user_data = user.data;
    const existingUser = await User.findOne({ email: user_data.email });

    if (!existingUser) {
      const newUser = new User({
        email: user_data.email,
        name: user_data.name,
        telephoneNumber: 'From Google',
        password: '123456',
        googleAuth: true,
        isVerified: true,
        otp: { value :generateOTP(), expiresAt: new Date(Date.now() + 300000) },
        resetPasswordToken: { token: crypto.randomBytes(20).toString('hex'), expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hours ago
      });

      await newUser.save();

      // Check for user
      const finduser = await User.findOne({ email: user_data.email }).select("+password");

      if (!finduser) {
        return res.status(400).json({ success: false, msg: "Invalid credentials" });
      }

      // Check if password matches
      const isMatch = await finduser.matchPassword("123456");

      if (!isMatch) {
        return res.status(401).json({ success: false, msg: "Invalid credentials" });
      }

      // Create token
      // const token = user.getSignedJwtToken();

      // res.status(200).json({ success: true, token });
      console.log("res",res)
      sendTokenResponse(finduser, 200, res);

    } else {
      if (existingUser.googleAuth === true) {
        // Check for user
        const finduser = await User.findOne({ email: user_data.email }).select("+password");

        if (!finduser) {
          return res.status(400).json({ success: false, msg: "Invalid credentials" });
        }

        // Check if password matches
        const isMatch = await finduser.matchPassword("123456");

        if (!isMatch) {
          return res.status(401).json({ success: false, msg: "Invalid credentials" });
        }

        // Create token
        // const token = user.getSignedJwtToken();

        // res.status(200).json({ success: true, token });
        console.log("res",res)
        sendTokenResponse(finduser, 200, res);
      } else {
        res.status(400).json({ success: false, msg: "Email already exists" });
      }
    }
    // res.send(`
    //   <h1> welcome ${user_data.name}</h1>
    //   <img src="${user_data.picture}" alt="user_image" />
    // `);
    // console.log(user_data);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
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


// @desc    Send OTP for email verification
// @route   POST /api/v1/auth/sendVerificationOTP
// @access  Private
exports.sendVerificationOTP = async (req, res, next) => {
  try {
    const {email} = req.user;
    // console.log(email)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    await sendEmail(email, 'Email Verification OTP', `Your OTP is: ${otp}`); // Implement sendEmail function

    // You can save the OTP in the user document for comparison later if needed
    // console.log(user)
    const otpObject = {value: otp, expiresAt: new Date(Date.now() + 300000)}; // OTP expires in 5 minutes
    await User.updateOne({ email }, { otp: otpObject });
    
    res.status(200).json({ success: true, message: 'OTP sent successfully', otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to send OTP' });
  }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verifyOTP
// @access  Private
exports.verifyOTP = async (req, res, next) => {
  try {
    // console.log(req.user)
    const { otp } = req.body;
    const { email } = req.user;

    // Find the user with the provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the OTP matches and it's still within the valid time frame
    if (user.otp.value === otp && user.otp.expiresAt > new Date()) {
      await User.updateOne({ email }, { isVerified: true });
      res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to verify OTP' });
  }
};

// @desc    Request password reset
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = await user.generateResetToken(email); // Implement this function
    // console.log(resetToken);

    const resetUrl = `http://localhost:5000/api/v1/auth/resetPassword?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`;
    await sendEmail(email, 'Password Reset Request', `Click here to reset your password: ${resetUrl}`);

    res.status(200).json({ success: true, message: 'Password reset link sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to process password reset request' });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const token = decodeURIComponent(req.query.token);
    const email = decodeURIComponent(req.query.email);
    // console.log(token,email)
    const { newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    // Check if password matches
    const isMatch = await user.matchResetPasswordToken(token);

    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid token" });
    }
    if(user.resetPasswordToken.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetPasswordToken.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to reset password' });
  }
};