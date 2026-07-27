import { getTransporter } from '../config/email';

export class EmailService {
  /**
   * Send an OTP verification code to the given email address.
   */
  static async sendOtp(email: string, otp: string): Promise<void> {
    const transporter = await getTransporter();

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">🛒 FreshCart</h2>
        <p style="color: #555; font-size: 15px;">Here is your one‑time verification code:</p>
        <div style="background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 18px; border-radius: 8px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} FreshCart Grocery. All rights reserved.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FreshCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your FreshCart Verification Code',
      html,
      text: `Your FreshCart OTP is ${otp}. It expires in 10 minutes.`,
    });
  }

  /**
   * Send a "new device detected" alert email.
   */
  static async sendNewDeviceAlert(email: string): Promise<void> {
    const transporter = await getTransporter();

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #1a1a2e;">🔔 New Device Login</h2>
        <p style="color: #555; font-size: 15px;">We noticed a login attempt from a new device. If this was you, please verify using the OTP we sent. If not, secure your account immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} FreshCart Grocery.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FreshCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '⚠️ New Device Detected on Your FreshCart Account',
      html,
      text: 'A login attempt from a new device was detected on your FreshCart account.',
    });
  }
}
