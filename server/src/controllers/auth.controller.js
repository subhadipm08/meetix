import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { generateAndStoreOTP, verifyOTP } from "../services/otp/index.js";
import { sendOTPEmail } from "../services/email/index.js";
import redisClient from "../services/redis/index.js";
import { REDIS_KEYS } from "../services/redis/redisKeys.js";
import { validateEmail, validatePassword, validateUsername, validateGender } from "../utils/validation.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, gender } = req.body;

    if (!username || !email || !password || !gender) {
        throw new ApiError(400, "All fields are required");
    }

    if (!validateEmail(email)) throw new ApiError(400, "Invalid email format");
    if (!validatePassword(password)) throw new ApiError(400, "Password must be at least 6 characters");
    if (!validateUsername(username)) throw new ApiError(400, "Username must be 3-20 characters long and contain only letters, numbers, and underscores");
    if (!validateGender(gender)) throw new ApiError(400, "Invalid gender. Must be male, female, or other");

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Temporarily store user data in Redis for 10 minutes
    const tempUserData = { username, email, password, gender };
    await redisClient.set(REDIS_KEYS.tempUser(email), JSON.stringify(tempUserData), 'EX', 600);

    const otp = await generateAndStoreOTP(email);
    await sendOTPEmail(email, otp);

    return res.status(200).json(
        new ApiResponse(200, { email }, "OTP sent to your email. Please verify to complete registration.")
    );
});

export const verifyOTPAndCreateUser = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const isOtpValid = await verifyOTP(email, otp);
    if (!isOtpValid) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Retrieve temp user data
    const tempUserKey = REDIS_KEYS.tempUser(email);
    const tempUserDataStr = await redisClient.get(tempUserKey);

    if (!tempUserDataStr) {
        throw new ApiError(400, "Registration session expired. Please register again.");
    }

    const { username, password, gender } = JSON.parse(tempUserDataStr);

    const user = await User.create({
        username,
        email,
        password,
        gender
    });

    if (!user) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    await redisClient.del(tempUserKey);

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    const createdUser = user.toObject();
    delete createdUser.password;
    delete createdUser.refreshToken;

    // Secure cookie configuration based on user feedback
    const optionsHttpOnly = { httpOnly: true, secure: true };
    const optionsNormal = { httpOnly: false, secure: true }; // Accessible by frontend JS

    return res
        .status(201)
        .cookie("accessToken", accessToken, optionsNormal)
        .cookie("refreshToken", refreshToken, optionsHttpOnly)
        .json(new ApiResponse(201, { user: createdUser, accessToken, refreshToken }, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const optionsHttpOnly = { httpOnly: true, secure: true };
    const optionsNormal = { httpOnly: false, secure: true };

    return res
        .status(200)
        .cookie("accessToken", accessToken, optionsNormal)
        .cookie("refreshToken", refreshToken, optionsHttpOnly)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { returnDocument: 'after' }
    );

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .clearCookie("accessToken", { ...options, httpOnly: false })
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

// Forgot Password Flow
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
        throw new ApiError(400, "Valid email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    const otp = await generateAndStoreOTP(email);
    await sendOTPEmail(email, otp);

    return res.status(200).json(new ApiResponse(200, {}, "OTP sent to email for password reset"));
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    if (!validatePassword(newPassword)) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    const isOtpValid = await verifyOTP(email, otp);
    if (!isOtpValid) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false }); // Mongoose will automatically run the pre-save hook to hash this!

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const optionsHttpOnly = { httpOnly: true, secure: true };
        const optionsNormal = { httpOnly: false, secure: true };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user);

        const loggedInUser = user.toObject();
        delete loggedInUser.password;
        delete loggedInUser.refreshToken;

        return res
            .status(200)
            .cookie("accessToken", accessToken, optionsNormal)
            .cookie("refreshToken", newRefreshToken, optionsHttpOnly)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken, user: loggedInUser },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
