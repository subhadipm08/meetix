import Redis from 'ioredis';
import logger from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

const redisClient = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
    lazyConnect: true
});

redisClient.on('error', (err) => logger.error('[REDIS] Client Error', err));
redisClient.on('connect', () => logger.info('Redis client connected successfully'));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('REDIS Connection failed', error);
        throw new ApiError(503, error.message || 'Redis connection failed');
    }
};

export default redisClient;
