const express = require("express");
const { register, login, getMe, logout, sendVerificationOTP, verifyOTP, loginWithGoogle, forgotPassword, resetPassword } = require("../controllers/auth");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const utils = require("../controllers/utils");

const router = express.Router();

const { protect } = require("../middleware/auth");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: This route registers a new user with the provided credentials.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               telephoneNumber:
 *                 type: string
 *             required:
 *               - username
 *               - email
 *               - password
 *               - telephoneNumber
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: This route logs in a user with the provided email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Authentication failed
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the current user
 *     description: This route returns the current logged-in user's data.
 *     responses:
 *       200:
 *         description: Current user data retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out the current user
 *     description: This route logs out the current user.
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/send-otp:
 *   get:
 *     summary: Send OTP for email verification
 *     description: Sends a one-time password to the user's email for verification purposes.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       401:
 *         description: Authorization required
 */
router.get("/send-otp", protect, sendVerificationOTP); // Route to send OTP for email verification

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and update user status
 *     description: Verifies the OTP sent to the user and updates their verification status.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified and user status updated
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify-otp", protect, verifyOTP); // Route to verify OTP and update user status

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Login with Google
 *     description: Redirects to Google for user authentication.
 *     responses:
 *       302:
 *         description: Redirect to Google's authentication page
 */
router.get("/google", async (req, res) => {
  try {
    res.redirect(utils.request_get_auth_code_url);
  } catch (error) {
    res.sendStatus(500);
    console.log(error.message);
  }
});
router.get(process.env.REDIRECT_URI, loginWithGoogle);
/**
 * @swagger
 * /auth/forgotpassword:
 *   post:
 *     summary: Forgot Password
 *     description: Initiates a password reset process for the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: Email not registered
 */
router.post("/forgotpassword", forgotPassword);

/**
 * @swagger
 * /auth/resetpassword:
 *   put:
 *     summary: Reset Password
 *     description: Allows the user to reset their password using a token received via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or password
 */
router.put("/resetpassword", resetPassword);

module.exports = router;
