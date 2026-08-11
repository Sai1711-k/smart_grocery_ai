import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/supabase';

export class EmailService {
  /**
   * Send an OTP verification code to the given email address.
   */
  static async sendOtp(email: string, otp: string): Promise<void> {
    const year = new Date().getFullYear();
    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e0e0e0;border-radius:12px;">
        <h2 style="color:#1a1a2e;margin-bottom:8px;">🛒 FreshCart</h2>
        <p style="color:#555;font-size:15px;">Your one-time verification code:</p>
        <div style="background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;font-size:36px;font-weight:700;letter-spacing:10px;text-align:center;padding:20px;border-radius:10px;margin:24px 0;">${otp}</div>
        <p style="color:#888;font-size:13px;">Expires in <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="color:#aaa;font-size:11px;text-align:center;">&copy; ${year} FreshCart Grocery</p>
      </div>`;

    const senderEmail = (process.env.EMAIL_USER || 'sai17042004@gmail.com').replace(/^["']|["']$/g, '').trim();
    const brevoKey    = process.env.BREVO_API_KEY?.replace(/^["']|["']$/g, '').trim();
    const sendgridKey = process.env.SENDGRID_API_KEY?.replace(/^["']|["']$/g, '').trim();
    const resendKey   = process.env.RESEND_API_KEY?.replace(/^["']|["']$/g, '').trim();

    const errors: string[] = [];

    // ── Helper: 5s timeout fetch ──
    const fetchWithTimeout = async (url: string, options: any) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    };

    // ── 1. Brevo HTTP API ────────────
    if (brevoKey) {
      const candidateSenders = Array.from(new Set([
        process.env.BREVO_SENDER_EMAIL?.replace(/^["']|["']$/g, '').trim(),
        senderEmail,
        'karnati.saisomasekharreddy@gmail.com',
        'sai17042004@gmail.com',
      ].filter(Boolean))) as string[];

      for (const sEmail of candidateSenders) {
        try {
          console.log(`[Email] Attempting Brevo HTTP API (sender: ${sEmail}) → ${email}`);
          const r = await fetchWithTimeout('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: { name: 'FreshCart Grocery', email: sEmail },
              to: [{ email }],
              subject: 'Your FreshCart Verification Code',
              htmlContent: html,
            }),
          });
          if (r.ok) {
            console.log(`[Email] ✅ Brevo successfully sent OTP email to ${email} via ${sEmail}`);
            return;
          }
          const errTxt = await r.text();
          const msg = `Brevo (${sEmail}) returned ${r.status}: ${errTxt}`;
          console.error(`[Email] ⚠️ ${msg}`);
          errors.push(msg);
        } catch (err: any) {
          const msg = `Brevo exception (${sEmail}): ${err.message}`;
          console.error(`[Email] ⚠️ ${msg}`);
          errors.push(msg);
        }
      }
    }

    // ── 2. SendGrid HTTP API ─────────────────────────────────────────────────
    if (sendgridKey) {
      try {
        console.log(`[Email] Attempting SendGrid HTTP API → ${email}`);
        const r = await fetchWithTimeout('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${sendgridKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: senderEmail, name: 'FreshCart Grocery' },
            subject: 'Your FreshCart Verification Code',
            content: [{ type: 'text/html', value: html }],
          }),
        });
        if (r.ok) {
          console.log(`[Email] ✅ SendGrid successfully sent OTP email to ${email}`);
          return;
        }
        const errTxt = await r.text();
        const msg = `SendGrid returned ${r.status}: ${errTxt}`;
        console.error(`[Email] ⚠️ ${msg}`);
        errors.push(msg);
      } catch (err: any) {
        const msg = `SendGrid exception: ${err.message}`;
        console.error(`[Email] ⚠️ ${msg}`);
        errors.push(msg);
      }
    }

    // ── 3. Resend HTTP API ───────────────────────────────────────────────────
    if (resendKey) {
      try {
        console.log(`[Email] Attempting Resend HTTP API → ${email}`);
        const r = await fetchWithTimeout('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'FreshCart <onboarding@resend.dev>',
            to: [email],
            subject: 'Your FreshCart Verification Code',
            html,
          }),
        });
        if (r.ok) {
          console.log(`[Email] ✅ Resend successfully sent OTP email to ${email}`);
          return;
        }
        const errTxt = await r.text();
        const msg = `Resend returned ${r.status}: ${errTxt}`;
        console.error(`[Email] ⚠️ ${msg}`);
        errors.push(msg);
      } catch (err: any) {
        const msg = `Resend exception: ${err.message}`;
        console.error(`[Email] ⚠️ ${msg}`);
        errors.push(msg);
      }
    }

    // ── 4. Supabase Auth Cloud Email Trigger ─────────────────────────────────
    try {
      console.log(`[Email] Attempting Supabase Auth Cloud Email → ${email}`);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const { error: supaErr } = await supabaseAdmin.auth.signInWithOtp({ email });
      clearTimeout(id);
      
      if (!supaErr) {
        console.log(`[Email] ✅ Supabase Auth cloud email triggered to ${email}`);
        return;
      }
      const msg = `Supabase Auth returned error: ${supaErr.message}`;
      console.error(`[Email] ⚠️ ${msg}`);
      errors.push(msg);
    } catch (supaErr: any) {
      const msg = `Supabase Auth exception: ${supaErr.message}`;
      console.error(`[Email] ⚠️ ${msg}`);
      errors.push(msg);
    }

    // ── 5. Standard Nodemailer SMTP ──────────────────────────────────────────
    try {
      console.log(`[Email] Attempting Nodemailer SMTP → ${email}`);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: senderEmail,
          pass: (process.env.EMAIL_PASS || '').replace(/^["']|["']$/g, '').trim(),
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });
      await transporter.sendMail({
        from: `"FreshCart" <${senderEmail}>`,
        to: email,
        subject: 'Your FreshCart Verification Code',
        html,
        text: `Your FreshCart OTP is ${otp}. It expires in 10 minutes.`,
      });
      console.log(`[Email] ✅ Nodemailer SMTP sent to ${email}`);
      return;
    } catch (smtpErr: any) {
      const msg = `Nodemailer SMTP failed: ${smtpErr.message}`;
      console.error(`[Email] ⚠️ ${msg}`);
      errors.push(msg);
    }

    const aggregatedError = errors.join(' | ');
    throw new Error(`All email delivery options failed. Errors: ${aggregatedError}`);
  }

  /**
   * Send a "new device detected" alert email.
   */
  static async sendNewDeviceAlert(email: string): Promise<void> {
    const senderEmail = (process.env.EMAIL_USER || 'sai17042004@gmail.com').replace(/^["']|["']$/g, '').trim();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: (process.env.EMAIL_PASS || '').replace(/^["']|["']$/g, '').trim(),
      },
      tls: { rejectUnauthorized: false },
    });

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #1a1a2e;">🔔 New Device Login</h2>
        <p style="color: #555; font-size: 15px;">We noticed a login attempt from a new device. If this was you, please verify using the OTP we sent. If not, secure your account immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} FreshCart Grocery.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FreshCart" <${senderEmail}>`,
      to: email,
      subject: '⚠️ New Device Detected on Your FreshCart Account',
      html,
      text: 'A login attempt from a new device was detected on your FreshCart account.',
    });
  }
}
