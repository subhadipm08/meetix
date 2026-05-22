export const REDIS_KEYS = {
    otp: (email) => `otp:${email}`,
    tempUser: (email) => `temp_user:${email}`,

    waitingQueue: 'queue:waiting',

    counters: {
        online: 'counter:online',
        inCall: 'counter:in_call'
    },

    lock: {
        queueMatch: 'lock:queue_match'
    }
};
