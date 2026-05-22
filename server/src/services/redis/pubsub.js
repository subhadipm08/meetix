import Redis from 'ioredis';
import logger from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

// Dedicated pub/sub clients must be separate ioredis instances.
// A subscribed client cannot issue any other commands.
const publisher = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', { lazyConnect: true });
const subscriber = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', { lazyConnect: true });

publisher.on('error', (err) => logger.error('Redis Publisher Error:', err));
subscriber.on('error', (err) => logger.error('Redis Subscriber Error:', err));

export const connectPubSub = async () => {
    try{
        await publisher.connect();
        await subscriber.connect();
        logger.info('Redis Pub/Sub clients connected');
    }
    catch(err){
        logger.error('Redis Pub/Sub Connection failed', err);
        throw new ApiError(503, err.message || 'Redis Pub/Sub connection failed');
    }
};

export { publisher, subscriber };
