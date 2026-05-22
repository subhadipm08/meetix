import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import { initializeSocket } from "./socket/index.js";
import logger from "./utils/logger.js";
import { connectRedis } from './services/redis/index.js';
import { connectPubSub } from './services/redis/pubsub.js';
import { resetCounters } from './services/redis/counterService.js';

const server = http.createServer(app);
connectDB()
    .then(async () => {
        await connectRedis();
        await connectPubSub();
        
        // Clear old counters on startup (useful for dev and single-node setups)
        await resetCounters();

        // Initialize Socket.io after Redis pub/sub clients are connected
        const io = initializeSocket(server);
        app.set("io", io);
        server.listen(process.env.PORT || 8000, () => {
            logger.info(`Server is running on port ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        logger.error("[SERVER] connection FAILED ", err);
        process.exit(1);
    });
