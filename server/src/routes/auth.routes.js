import { Router } from "express";
import { 
    registerUser, 
    verifyOTPAndCreateUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    forgotPassword, 
    resetPassword 
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter, otpRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Registration Flow
router.route("/register").post(authRateLimiter, registerUser);
router.route("/verify-otp").post(authRateLimiter, verifyOTPAndCreateUser);

// Login & Session
router.route("/login").post(authRateLimiter, loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Password Reset Flow
router.route("/forgot-password").post(otpRateLimiter, forgotPassword);
router.route("/reset-password").post(authRateLimiter, resetPassword);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
