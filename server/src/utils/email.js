const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Email utility for sending verification and password reset emails
 * Uses SMTP transport (configurable for any provider)
 */

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send verification email
 * @param {string} to - Recipient email
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const mailOptions = {
    from: `"Task Manager" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Verify Your Email - Task Manager',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✉️ Verify Your Email</h1>
        </div>
        <div style="padding: 40px 30px; color: #e2e8f0;">
          <p style="font-size: 16px; line-height: 1.6;">Welcome to Task Manager! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Verify Email</a>
          </div>
          <p style="font-size: 14px; color: #94a3b8;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error(`Error sending verification email: ${error.message}`);
    throw new Error('Error sending verification email');
  }
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} token - Reset token
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"Task Manager" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset Your Password - Task Manager',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Reset Password</h1>
        </div>
        <div style="padding: 40px 30px; color: #e2e8f0;">
          <p style="font-size: 16px; line-height: 1.6;">You requested a password reset. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #ef4444, #f97316); color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #94a3b8;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error(`Error sending password reset email: ${error.message}`);
    throw new Error('Error sending password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
