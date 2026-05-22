import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// Rate limiter for login/registration attempts
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per 15 minutes
    standardHeaders: true, 
    legacyHeaders: false, 
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many authentication requests, please try again later."));
    }
});

// Stricter rate limiter specifically for requesting OTPs
export const otpRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 OTP requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many OTP requests, please try again later."));
    }
});
