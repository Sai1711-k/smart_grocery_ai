import { getTransporter } from '../config/email';
import { supabaseAdmin } from '../config/supabase';

export class EmailService {
  /**
   * Send an OTP verification code to the given email address.
   */
  static async sendOtp(email: string, otp: string): Promise<void> {
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

    // 1. Check HTTP-based Email APIs (Port 443 - Never blocked on Render)
    const brevoKey = process.env.BREVO_API_KEY?.replace(/^["']|["']$/g, '').trim();
    const resendKey = process.env.RESEND_API_KEY?.replace(/^["']|["']$/g, '').trim();
    const sendgridKey = process.env.SENDGRID_API_KEY?.replace(/^["']|["']$/g, '').trim();

    // Brevo (300 free emails/day to ANY recipient without domain restriction)
    if (brevoKey) {
      console.log(`[Email] Attempting to send OTP via Brevo HTTP API to ${email}...`);
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'FreshCart Grocery', email: process.env.EMAIL_USER || 'sai17042004@gmail.com' },
          to: [{ email }],
          subject: 'Your FreshCart Verification Code',
          htmlContent: html,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Brevo Error Detail]:', errorText);
        throw new Error(`Brevo API Error (${res.status}): ${errorText}`);
      }
      console.log(`[Email] Brevo HTTP API successfully sent email to ${email}`);
      return;
    }

    // SendGrid (100 free emails/day over HTTPS Port 443)
    if (sendgridKey) {
      console.log(`[Email] Attempting to send OTP via SendGrid HTTP API to ${email}...`);
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sendgridKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: process.env.EMAIL_USER || 'sai17042004@gmail.com', name: 'FreshCart Grocery' },
          subject: 'Your FreshCart Verification Code',
          content: [{ type: 'text/html', value: html }],
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[SendGrid Error Detail]:', errorText);
        throw new Error(`SendGrid API Error (${res.status}): ${errorText}`);
      }
      console.log(`[Email] SendGrid HTTP API successfully sent email to ${email}`);
      return;
    }

    // Resend (3,000 free emails/month)
    if (resendKey) {
      console.log(`[Email] Attempting to send OTP via Resend HTTP API to ${email}...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'FreshCart <onboarding@resend.dev>', to: [email], subject: 'Your FreshCart Verification Code', html }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Resend Error Detail]:', errorText);
        throw new Error(`Resend API Error (${res.status}): ${errorText}`);
      }
      console.log(`[Email] Resend HTTP API successfully sent email to ${email}`);
      return;
    }

    // 2. Standard Nodemailer SMTP
    try {
      const transporter = await getTransporter();
      await transporter.sendMail({
        from: `"FreshCart" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your FreshCart Verification Code',
        html,
        text: `Your FreshCart OTP is ${otp}. It expires in 10 minutes.`,
      });
      return;
    } catch (smtpErr: any) {
      console.warn('[Email] Standard Nodemailer SMTP failed, triggering Supabase Auth SMTP fallback:', smtpErr.message);
    }

    // 3. Supabase Auth SMTP (Uses SMTP configured in Supabase Dashboard over AWS!)
    try {
      console.log(`[Email] Sending email via Supabase Auth SMTP to ${email}...`);
      const { error: supaErr } = await supabaseAdmin.auth.signInWithOtp({ email });
      if (!supaErr) {
        console.log(`[Email] Supabase Auth SMTP successfully triggered email to ${email}`);
        return;
      }
      console.error('[Supabase Auth SMTP Error]:', supaErr.message);
      throw new Error(`Supabase Auth SMTP Error: ${supaErr.message}`);
    } catch (supaException: any) {
      console.error('[Supabase Auth SMTP Exception]:', supaException.message);
      throw supaException;
    }
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
