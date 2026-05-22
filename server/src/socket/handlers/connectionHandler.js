import { increment, safeDecrement } from "../../services/redis/counterService.js";
import { removeUserFromQueue } from "../../services/redis/queueService.js";
import { REDIS_KEYS } from "../../services/redis/redisKeys.js";
import { endRoomForSocket } from "./matchHandler.js";
import logger from "../../utils/logger.js";

/**
 * Handles the socket connection lifecycle:
 * - Increments the online counter on connect
 * - Decrements the online counter, leaves queue, and ends room on disconnect
 */
export const registerConnectionHandlers = async (io, socket) => {
    logger.info(`SOCKET Connected: ${socket.id} (${socket.data.user?.username})`);

    // Increment online users counter
    try {
        await increment(REDIS_KEYS.counters.online);
    } catch (error) {
        logger.error(`SOCKET Failed to increment online counter: ${error.message}`);
    }

    socket.on("disconnect", async () => {
        logger.info(`SOCKET Disconnected: ${socket.id} (${socket.data.user?.username})`);

        // Decrement online users counter
        try {
            await safeDecrement(REDIS_KEYS.counters.online);
        } catch (error) {
            logger.error(`SOCKET Failed to decrement online counter: ${error.message}`);
        }

        // Remove from waiting queue if present
        try {
            await removeUserFromQueue(socket.id);
        } catch (error) {
            logger.error(`SOCKET leave_queue on disconnect error: ${error.message}`);
        }

        // End any active room/call
        try {
            await endRoomForSocket(io, socket);
        } catch (error) {
            logger.error(`SOCKET endRoom on disconnect error: ${error.message}`);
        }
    });
};
