import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB connected to host: ${connectionInstance.connection.host}`);
        return connectionInstance;
    } catch (error) {
        logger.error("[MONGODB] connection FAILED ", error);
        throw new ApiError(503, error.message || 'MongoDB connection failed');
    }
};

export default connectDB;
