import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/supabase';

export class EmailService {
  /**
   * Send an OTP verification code to the given email address.
   * Priority chain:
   *   1. Brevo HTTP API  (BREVO_API_KEY env var)  – port 443, universal, 300/day free
   *   2. SendGrid HTTP API (SENDGRID_API_KEY env var) – port 443, 100/day free
   *   3. Resend HTTP API  (RESEND_API_KEY env var)  – port 443, 3000/month free
   *   4. Gmail SMTP directly (local dev only – Render blocks port 587)
   * Any failure throws so the caller can surface the OTP as fallback.
   */
  static async sendOtp(email: string, otp: string): Promise<void> {
    const year = new Date().getFullYear();
    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e0e0e0;border-radius:12px;">
        <h2 style="color:#1a1a2e;margin-bottom:8px;">&#x1F6D2; FreshCart</h2>
        <p style="color:#555;font-size:15px;">Your one-time verification code:</p>
        <div style="background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;font-size:36px;font-weight:700;letter-spacing:10px;text-align:center;padding:20px;border-radius:10px;margin:24px 0;">${otp}</div>
        <p style="color:#888;font-size:13px;">Expires in <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="color:#aaa;font-size:11px;text-align:center;">&copy; ${year} FreshCart Grocery</p>
      </div>`;

    const senderEmail = (process.env.EMAIL_USER || 'sai17042004@gmail.com').replace(/^["']|["']$/g, '').trim();
    const resendKey  = process.env.RESEND_API_KEY?.replace(/^["']|["']$/g, '').trim();
    const brevoKey   = process.env.BREVO_API_KEY?.replace(/^["']|["']$/g, '').trim();
    const sendgridKey= process.env.SENDGRID_API_KEY?.replace(/^["']|["']$/g, '').trim();

    // ── 1. Resend HTTP API (key already in Render!) ──────────────────────────
    // IMPORTANT: from must be onboarding@resend.dev on free plan (Gmail not a verified Resend domain)
    if (resendKey) {
      console.log(`[Email] Sending via Resend → ${email}`);
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'FreshCart <onboarding@resend.dev>',
          to: [email],
          subject: 'Your FreshCart Verification Code',
          html,
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error('[Resend] Error:', r.status, t);
        throw new Error(`Resend ${r.status}: ${t}`);
      }
      console.log(`[Email] ✅ Resend sent to ${email}`);
      return;
    }

    // ── 2. Brevo HTTP API ────────────────────────────────────────────────────
    if (brevoKey) {
      console.log(`[Email] Sending via Brevo → ${email}`);
      const r = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'FreshCart Grocery', email: senderEmail },
          to: [{ email }],
          subject: 'Your FreshCart Verification Code',
          htmlContent: html,
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error('[Brevo] Error:', r.status, t);
        throw new Error(`Brevo ${r.status}: ${t}`);
      }
      console.log(`[Email] ✅ Brevo sent to ${email}`);
      return;
    }

    // ── 2. SendGrid HTTP API ─────────────────────────────────────────────────
    if (sendgridKey) {
      console.log(`[Email] Sending via SendGrid → ${email}`);
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sendgridKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: senderEmail, name: 'FreshCart Grocery' },
          subject: 'Your FreshCart Verification Code',
          content: [{ type: 'text/html', value: html }],
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error('[SendGrid] Error:', r.status, t);
        throw new Error(`SendGrid ${r.status}: ${t}`);
      }
      console.log(`[Email] ✅ SendGrid sent to ${email}`);
      return;
    }


    // ── 4. Gmail SMTP (local dev only – port 587 is blocked on Render free tier) ──
    console.warn('[Email] ⚠️  No HTTP API key found. Falling back to Gmail SMTP (will FAIL on Render free tier).');
    console.warn('[Email] Set BREVO_API_KEY in Render env vars to fix email delivery.');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: (process.env.EMAIL_PASS || '').replace(/^["']|["']$/g, '').trim(),
      },
      tls: { rejectUnauthorized: false },
    });
    await transporter.sendMail({
      from: `"FreshCart" <${senderEmail}>`,
      to: email,
      subject: 'Your FreshCart Verification Code',
      html,
      text: `Your FreshCart OTP is ${otp}. It expires in 10 minutes.`,
    });
    console.log(`[Email] ✅ Gmail SMTP sent to ${email}`);
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
