import nodemailer from 'nodemailer';
import logger from '../../utils/logger.js';
const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });


export const sendOTPEmail = async (email, otp) => {
    try {
        
        const mailOptions = {
            from: `${process.env.EMAIL_FROM}`,
            to: email,
            subject: 'Your Meetix Verification Code',
            html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="cid:meetixlogo" alt="Meetix Logo" style="max-width: 150px;" />
                </div>
                <h2 style="color: #1a1a1a; font-size: 24px; text-align: center; margin-bottom: 20px;">Verify Your Email</h2>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
                    Welcome to Meetix! To complete your registration and join the random video chat, please use the verification code below. This code will expire in 10 minutes.
                </p>
                <div style="background: linear-gradient(135deg, #f6f8fd 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #8a2be2; font-size: 42px; letter-spacing: 8px; margin: 0; font-weight: 700;">${otp}</h1>
                </div>
                <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 40px;">
                    If you didn't request this code, you can safely ignore this email.
                </p>
            </div>
            `,
            attachments: [
                {
                    filename: 'logo.png',
                    path: './public/logo.png',
                    cid: 'meetixlogo' // matches the cid in the img src
                }
            ]
        };
        
        await transporter.sendMail(mailOptions);
        logger.info(`[EMAIL] OTP sent to ${email}`);
    } catch (error) {
        logger.error(`[EMAIL] Error sending OTP to ${email}:`, error);
        throw error;
    }
};
