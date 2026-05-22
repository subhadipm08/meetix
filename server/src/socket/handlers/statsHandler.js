import { getAllCounters } from "../../services/redis/counterService.js";
import logger from "../../utils/logger.js";

export const startStatsBroadcaster = (io) => {
    setInterval(async () => {
        try {
            const stats = await getAllCounters();
            io.local.emit("stats_update", stats);
        } catch (error) {
            logger.error(`Error broadcasting stats: ${error.message}`);
        }
    }, 5000);
};