import jwt from "jsonwebtoken";
import logger from "../../utils/logger.js";
import {ApiError} from "../../utils/ApiError.js";

export const socketAuth = async (socket, next) => {
    try {
        const authHeader = socket.handshake.headers?.authorization;

        const token =
            socket.handshake.auth?.token ||
            (authHeader?.startsWith("Bearer ")
                ? authHeader.slice(7)
                : null);

        if (!token) {
            return next(new ApiError(401, "Authentication token is required"));
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded._id) {
            return next(new ApiError(401, "Invalid token payload"));
        }


        socket.data.user = {
            id: decoded._id,
            username: decoded.username,
            avatar: decoded.avatar
        };
                

        return next();
    } catch (error) {
        logger.warn(`Socket authentication failed: ${error.message}`);
        return next(new ApiError(401, "Unauthorized request"));
    }
};
