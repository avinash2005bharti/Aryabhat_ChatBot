const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/auth.control');

// Register & Verify
router.post("/register", authControllers.registerUser);
router.post("/verify-email", authControllers.verifyEmail);
router.post("/resend-verification-otp", authControllers.resendOTP);

// Login
router.post("/login", authControllers.loginUser);
router.post("/logout", authControllers.logoutUser);

// Forgot Password Flow
router.post("/forgot-password", authControllers.forgotPassword);
router.post("/verify-reset-otp", authControllers.verifyResetOTP);
router.post("/reset-password", authControllers.resetPassword);
router.post("/resend-reset-otp", authControllers.resendcode);

module.exports = router;