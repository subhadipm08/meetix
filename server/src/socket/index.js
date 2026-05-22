import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { publisher, subscriber } from "../services/redis/pubsub.js";
import logger from "../utils/logger.js";
import { socketAuth } from "./middlewares/socketAuth.js";
import { registerConnectionHandlers } from "./handlers/connectionHandler.js";
import { registerMatchHandlers } from "./handlers/matchHandler.js";
import { registerSignalingHandlers } from "./handlers/signalingHandler.js";
import { startStatsBroadcaster } from "./handlers/statsHandler.js";


const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials:true
        },
        adapter: createAdapter(publisher, subscriber)
    });

    // Authentication middleware
    io.use(socketAuth);

    // Start broadcasting live metrics to clients
    startStatsBroadcaster(io);

    io.on("connection", async (socket) => {
        // Connection lifecycle (online counter, disconnect cleanup)
        await registerConnectionHandlers(io, socket);

        // Matching queue & room management
        registerMatchHandlers(io, socket);

        // WebRTC signaling relay (offer, answer, ice_candidate) & chat
        registerSignalingHandlers(io, socket);
    });

    return io;
};

export { initializeSocket };
