import logger from "../../utils/logger.js";

/**
 * Handles WebRTC signaling relay and text chat.
 * Each signal type (offer, answer, ice_candidate) has its own dedicated event
 * for clarity and easier client-side handling.
 */
export const registerSignalingHandlers = (io, socket) => {

    // WebRTC Offer relay
    socket.on("offer", ({ to, payload }) => {
        try {
            const target = io.sockets.sockets.get(to);
            if (target && socket.data.partnerId === to) {
                target.emit("offer", { from: socket.id, payload });
            }
        } catch (error) {
            logger.error(`SIGNAL offer relay error: ${error.message}`);
        }
    });

    // WebRTC Answer relay
    socket.on("answer", ({ to, payload }) => {
        try {
            const target = io.sockets.sockets.get(to);
            if (target && socket.data.partnerId === to) {
                target.emit("answer", { from: socket.id, payload });
            }
        } catch (error) {
            logger.error(`SIGNAL answer relay error: ${error.message}`);
        }
    });

    // ICE Candidate relay
    socket.on("ice_candidate", ({ to, payload }) => {
        try {
            const target = io.sockets.sockets.get(to);
            if (target && socket.data.partnerId === to) {
                target.emit("ice_candidate", { from: socket.id, payload });
            }
        } catch (error) {
            logger.error(`SIGNAL ice_candidate relay error: ${error.message}`);
        }
    });

    // Text Chat relay
    socket.on("chat_message", ({ to, message }) => {
        try {
            if (socket.data.partnerId === to) {
                // Using io.to(to) instead of sockets.get() allows it to work across multiple servers (Redis adapter)
                io.to(to).emit("chat_message", { from: socket.id, message });
            }
        } catch (error) {
            logger.error(`SIGNAL chat_message relay error: ${error.message}`);
        }
    });
};
