// routes/auth.js

const express = require("express");
const { register, login, getMe, logout, sendVerificationOTP } = require("../controllers/auth");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post('/logout', logout);
router.get('/send-otp', protect, authorize("admin","user"), sendVerificationOTP); // Route to send OTP for email verification
// router.post('/verify-otp', verifyOTP); // Route to verify OTP and update user status


module.exports = router;
