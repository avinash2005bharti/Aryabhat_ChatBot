const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/auth.control');

// Auth routes
router.post("/register", authControllers.registerUser);
router.post("/verify-email", authControllers.verifyEmail);   // FIX: was missing
router.post("/login", authControllers.loginUser);
router.post("/forgot-password", authControllers.forgotPassword);
router.post("/verify-reset-otp",authControllers.verifyResetOTP);
router.post("/reset-password",authControllers.resetPassword);

module.exports = router;