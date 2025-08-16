import { logger } from '../config/logger.js';
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  message: string;
  subject?: string;
  metadata?: any;
}

export const sendEmail = async (
  to: string,
  message: string,
  subject?: string,
  metadata?: any
) => {
  try {
    logger.info(`📧 Sending email to ${to}`, { subject, metadata });

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@hrms.com',
      to,
      subject: subject || 'Notification from HRMS',
      text: message,
      html: `<p>${message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`✅ Email sent successfully to ${to}`, { messageId: info.messageId });

    return {
      messageId: info.messageId,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`❌ Failed to send email to ${to}:`, error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Template-based email sending
export const sendTemplatedEmail = async (
  to: string,
  templateId: string,
  variables: Record<string, any>,
  subject?: string
) => {
  try {
    logger.info(`📧 Sending templated email to ${to}`, { templateId, variables });

    // TODO: Load template from database and replace variables
    let message = `Template ${templateId} email`;

    // Replace variables in message
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return await sendEmail(to, message, subject, { templateId, variables });
  } catch (error) {
    logger.error(`❌ Failed to send templated email to ${to}:`, error);
    throw new Error(`Failed to send templated email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
  
