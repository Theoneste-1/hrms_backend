import { logger } from '../config/logger.js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE;

const twilioClient = twilio(accountSid, authToken);

export const sendSMS = async (to: string, message: string) => {
  try {
    logger.info(`📱 Sending SMS to ${to}`);
    const result = await twilioClient.messages.create({
      body: message,
      from: fromPhone,
      to,
    });
    logger.info(`✅ SMS sent to ${to}`, { sid: result.sid });
    return {
      sid: result.sid,
      status: result.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`❌ Failed to send SMS to ${to}:`, error);
    throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
  