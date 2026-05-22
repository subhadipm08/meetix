import Redlock from 'redlock';
import redisClient from './index.js';
import logger from '../../utils/logger.js';

// Redlock requires the primary (non-subscribed) Redis client.
// Settings follow Redlock best practices for a single-node setup.
const redlock = new Redlock([redisClient], {
    // Retry 3 times with 200ms delay between attempts
    retryCount: 3,
    retryDelay: 200,  // ms
    retryJitter: 50,  // adds randomness to prevent thundering herd
});

redlock.on('clientError', (err) => {
    // Expected occasional errors during lock contention — log and continue
    logger.error('REDLOCK Client error:', err);
});

export default redlock;
