import redisClient from '../redis/index.js';
import crypto from 'crypto';
import { REDIS_KEYS } from '../redis/redisKeys.js';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

const OTP_EXPIRY = 300; // 5 minutes in seconds

export const generateAndStoreOTP = async (email) => {
    try{
        // Generate a secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store in Redis with expiration
        const key = REDIS_KEYS.otp(email);
        await redisClient.set(key, otp, 'EX', OTP_EXPIRY);

        return otp;
    }
    catch(error){
        logger.error('[OTP] Error generating or storing OTP:', error);
        throw new ApiError(503, error.message || 'OTP generation or storage failed');
    }
};

export const verifyOTP = async (email, otpInput) => {
    try{
        const key = REDIS_KEYS.otp(email);
        const storedOtp = await redisClient.get(key);
        
        if (!storedOtp) {
            return false; // Expired or doesn't exist
        }
        
        if (storedOtp === otpInput) {
            // OTP matches, delete it so it cannot be reused
            await redisClient.del(key);
            return true;
        }
        
        return false;
    }
    catch(error){
        logger.error('[OTP] Error verifying OTP:', error);
        throw new ApiError(503, error.message || 'OTP verification failed');
    }
};
