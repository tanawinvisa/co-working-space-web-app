// routes/auth.js

const express = require("express");
const { register, login, getMe, logout, sendVerificationOTP, verifyOTP, loginWithGoogle, forgotPassword, resetPassword } = require("../controllers/auth");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const utils = require("../controllers/utils");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post('/logout', logout);
router.get('/send-otp', protect, sendVerificationOTP); // Route to send OTP for email verification
router.post('/verify-otp', protect, verifyOTP); // Route to verify OTP and update user status

router.get('/google', async (req, res) => {
  try {
    res.redirect(utils.request_get_auth_code_url);
  } catch (error) {
    res.sendStatus(500);
    console.log(error.message);
  }
});
router.get(process.env.REDIRECT_URI, loginWithGoogle);

router.post("/forgotpassword", forgotPassword);
router.put('/resetpassword', resetPassword);

module.exports = router;
