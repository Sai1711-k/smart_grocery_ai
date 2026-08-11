import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporterInstance: nodemailer.Transporter | null = null;

export const getTransporter = async () => {
  if (transporterInstance) return transporterInstance;

  const host = (process.env.EMAIL_HOST || 'smtp.gmail.com').replace(/^["']|["']$/g, '').trim();
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = (process.env.EMAIL_USER || '').replace(/^["']|["']$/g, '').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/^["']|["']$/g, '').trim();

  if (!host || !user || !pass) {
    throw new Error('SMTP not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
  }

  console.log(`[Email] Creating SMTP transporter: ${user} @ ${host}:${port}`);

  const isGmail = host?.includes('gmail');

  transporterInstance = nodemailer.createTransport(
    isGmail
      ? {
          service: 'gmail',
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        }
      : ({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000,
        } as any)
  );

  // Verify the connection works
  try {
    await transporterInstance.verify();
    console.log('[Email] SMTP connection verified successfully!');
  } catch (err: any) {
    console.error('[Email] SMTP verification failed:', err.message);
    transporterInstance = null; // Reset so next call retries
    throw new Error('SMTP connection failed: ' + err.message);
  }

  return transporterInstance;
};

// Force reset the transporter (useful after .env changes)
export const resetTransporter = () => {
  transporterInstance = null;
};
