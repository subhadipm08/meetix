const colors = {
    info: '\x1b[36m',   // Cyan
    warn: '\x1b[33m',   // Yellow
    error: '\x1b[31m',  // Red
    reset: '\x1b[0m'    // Reset color back to terminal default
};

const logger = {
    info: (...args) => {
        if (process.env.NODE_ENV === 'dev') {
            console.log(colors.info, '[INFO]', ...args, colors.reset);
        }
    },
    error: (...args) => {
        if (process.env.NODE_ENV === 'dev') {
            console.error(colors.error, '[ERROR]', ...args, colors.reset);
        }
    },
    warn: (...args) => {
        if (process.env.NODE_ENV === 'dev') {
            console.warn(colors.warn, '[WARN]', ...args, colors.reset);
        }
    }
};

export default logger;
