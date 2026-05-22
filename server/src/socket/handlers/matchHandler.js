import crypto from "crypto";
import { enqueueUser, removeUserFromQueue, tryMatch } from "../../services/redis/queueService.js";
import { incrementBy, safeDecrementBy } from "../../services/redis/counterService.js";
import { REDIS_KEYS } from "../../services/redis/redisKeys.js";
import logger from "../../utils/logger.js";

/**
 * Ends the room/call for a given socket and notifies the partner.
 * Exported for use by connectionHandler on disconnect.
 */
export const endRoomForSocket = async (io, socket) => {
    try {
        const roomId = socket.data?.roomId;
        const partnerId = socket.data?.partnerId;
        const disconnectedUsername = socket.data?.user?.username || "partner";

        // User is not in any room
        if (!roomId) {
            return;
        }

        // FIX: Clear state SYNCHRONOUSLY before any `await` to prevent async race conditions.
        socket.data.roomId = null;
        socket.data.partnerId = null;

        // Find partner
        const partnerSocket = partnerId
            ? io.sockets.sockets.get(partnerId)
            : null;

        if (partnerSocket) {
            // Clean partner state SYNCHRONOUSLY
            partnerSocket.data.roomId = null;
            partnerSocket.data.partnerId = null;
        }

        // Clean up disconnecting user's state
        await socket.leave(roomId);

        if (partnerSocket?.connected) {
            // Remove partner from room
            await partnerSocket.leave(roomId);

            // Notify partner
            partnerSocket.emit("partner_disconnected", { partner: disconnectedUsername });
        }

        // Decrement active call counter
        await safeDecrementBy(
            REDIS_KEYS.counters.inCall,
            2
        );

        logger.info(
            `MATCH Room ${roomId} closed`
        );

    } catch (error) {
        logger.error(
            `MATCH endRoom error: ${error.message}`
        );
    }
};

/**
 * Registers matching-related socket events:
 * - join_queue: Enter the waiting queue and attempt to match
 * - leave_queue: Leave the waiting queue
 * - leave_room: End the current call
 * - next: End the current call and re-enqueue after a delay
 */
export const registerMatchHandlers = (io, socket) => {

    const joinQueue = async () => {
        try {
            await enqueueUser(socket.id);

            const match = await tryMatch();

            // No match found or another server got the lock
            if (!match) {
                logger.info(`joined queue | user ${socket.id}`);
                return;
            }

            const { user1, user2 } = match;
            const roomId = crypto.randomUUID();

            const socket1 = io.sockets.sockets.get(user1);
            const socket2 = io.sockets.sockets.get(user2);

            // One or both users disconnected after being popped from queue
            if (!socket1?.connected || !socket2?.connected) {
                if (socket1?.connected) {
                    await enqueueUser(user1);
                }

                if (socket2?.connected) {
                    await enqueueUser(user2);
                }

                return;
            }

            await socket1.join(roomId);
            await socket2.join(roomId);

            socket1.data.roomId = roomId;
            socket1.data.partnerId = user2;

            socket2.data.roomId = roomId;
            socket2.data.partnerId = user1;

            await incrementBy(
                REDIS_KEYS.counters.inCall,
                2
            );

            logger.info(`[MATCH] matchHandler: socket1.data.user=${JSON.stringify(socket1.data?.user)}, socket2.data.user=${JSON.stringify(socket2.data?.user)}`);

            const user1Data = {
                socketId: user1,
                username: socket1.data.user?.username || "Stranger",
                avatar: socket1.data.user?.avatar || ""
            };
            const user2Data = {
                socketId: user2,
                username: socket2.data.user?.username || "Stranger",
                avatar: socket2.data.user?.avatar || ""
            };

            socket1.emit("match_found", {
                roomId,
                user1,
                user2,
                partner: user2Data
            });

            socket2.emit("match_found", {
                roomId,
                user1,
                user2,
                partner: user1Data
            });

            logger.info(
                `[MATCH] Room ${roomId} created for ${user1} (${user1Data.username}) and ${user2} (${user2Data.username})`
            );

        } catch (error) {
            logger.error(
                `[MATCH] join_queue error: ${error.message}`
            );
        }
    };

    const leaveQueue = async () => {
        try {
            const result = await removeUserFromQueue(socket.id);
            logger.info(`left queue | user ${socket.id} | removed: ${result}`);
        } catch (error) {
            logger.error(`MATCH leave_queue error: ${error.message}`);
        }
    };

    // Register Event Listeners
    socket.on("join_queue", joinQueue);
    socket.on("leave_queue", leaveQueue);

    socket.on("leave_room", async () => {
        await endRoomForSocket(io, socket);
    });

    socket.on("next", async () => {
        // Leave current room
        await endRoomForSocket(io, socket);
        // Wait 2 seconds, then re-enqueue
        setTimeout(async () => {
            try {
                // To avoid enqueueing a disconnected socket
                if (socket.connected) {
                    await joinQueue();
                }
            } catch (error) {
                logger.error(`MATCH next auto-re-enqueue error: ${error.message}`);
            }
        }, 2000);
    });
};
