import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    let error = err;

    // If the error is not an instance of our custom ApiError, convert it into one
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    // Log the error details
    if (error.statusCode >= 500) {
        logger.error(`${req.method} ${req.originalUrl} | ${error.statusCode} | ${error.message}`);
    } else {
        logger.warn(`${req.method} ${req.originalUrl} | ${error.statusCode} | ${error.message}`);
    }

    // Prepare the standardized JSON response
    const response = {
        success: error.success,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        // Only include the stack trace if we are strictly in development mode
        ...(process.env.NODE_ENV === "dev" ? { stack: error.stack } : {}),
    };

    return res.status(error.statusCode).json(response);
};
