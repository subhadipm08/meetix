import redisClient from './index.js';
import redlock from './redlock.js';
import { REDIS_KEYS } from './redisKeys.js';

const LOCK_TTL = 5000;

export const enqueueUser = async (socketId) => {
    const existingIndex = await redisClient.lpos(
        REDIS_KEYS.waitingQueue,
        socketId
    );

    if (existingIndex !== null) {
        return;
    }

    await redisClient.lpush(
        REDIS_KEYS.waitingQueue,
        socketId
    );
};

export const removeUserFromQueue = async (socketId) => {
    return redisClient.lrem(
        REDIS_KEYS.waitingQueue,
        0,
        socketId
    );
};

export const getQueueLength = async () => {
    return redisClient.llen(
        REDIS_KEYS.waitingQueue
    );
};

export const tryMatch = async () => {
    let lock;

    try {
        lock = await redlock.acquire(
            [REDIS_KEYS.lock.queueMatch],
            LOCK_TTL
        );

        const queueLen =
            await redisClient.llen(
                REDIS_KEYS.waitingQueue
            );

        if (queueLen < 2) {
            return null;
        }

        const result =
            await redisClient
                .multi()
                .rpop(REDIS_KEYS.waitingQueue)
                .rpop(REDIS_KEYS.waitingQueue)
                .exec();

        const user1 = result?.[0]?.[1];
        const user2 = result?.[1]?.[1];

        if (!user1 || !user2) {
            return null;
        }

        return {
            user1,
            user2,
        };
    } catch {
        return null;
    } finally {
        if (lock) {
            try {
                await lock.release();
            } catch {}
        }
    }
};