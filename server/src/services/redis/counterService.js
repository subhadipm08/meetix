import redisClient from './index.js';
import { REDIS_KEYS } from './redisKeys.js';

// Lua script: safe decrement — never goes below zero
const SAFE_DECR_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1]) or 0)
if current <= 0 then
    return 0
end
return redis.call('DECR', KEYS[1])
`;

// Lua script: safe DECRBY — never goes below zero
const SAFE_DECRBY_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1]) or 0)
local amount = tonumber(ARGV[1])
if current <= 0 then
    return 0
end
if current - amount < 0 then
    return redis.call('SET', KEYS[1], 0)
end
return redis.call('DECRBY', KEYS[1], amount)
`;

/** Increment a counter by 1. */
export const increment = async (key) => {
    return redisClient.incr(key);
};

/** Increment a counter by a given amount (e.g. INCRBY 2 when a match is created). */
export const incrementBy = async (key, amount) => {
    return redisClient.incrby(key, amount);
};

/** Safely decrement a counter by 1. Cannot go below zero. */
export const safeDecrement = async (key) => {
    return redisClient.eval(SAFE_DECR_SCRIPT, 1, key);
};

/** Safely decrement a counter by a given amount. Cannot go below zero. */
export const safeDecrementBy = async (key, amount) => {
    return redisClient.eval(SAFE_DECRBY_SCRIPT, 1, key, amount);
};

/** Get the current integer value of a counter. Returns 0 if not set. */
export const getCounter = async (key) => {
    const value = await redisClient.get(key);
    return value ? parseInt(value, 10) : 0;
};

/**
 * Get all live platform stats in a single call.
 * `waiting` is derived from LLEN on the queue — no separate counter key.
 * Returns: { online, inCall, waiting }
 */
export const getAllCounters = async () => {
    const [online, inCall, waiting] = await Promise.all([
        getCounter(REDIS_KEYS.counters.online),
        getCounter(REDIS_KEYS.counters.inCall),
        redisClient.llen(REDIS_KEYS.waitingQueue),
    ]);
    return { online, inCall, waiting };
};

/** Reset all counters to 0 on server startup. */
export const resetCounters = async () => {
    await redisClient.del(REDIS_KEYS.counters.online);
    await redisClient.del(REDIS_KEYS.counters.inCall);
    await redisClient.del(REDIS_KEYS.waitingQueue);
};