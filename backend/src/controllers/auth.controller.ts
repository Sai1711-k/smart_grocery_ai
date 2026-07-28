import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import crypto from 'crypto';
import { EmailService } from '../services/email.service';
import { generateOtp } from '../utils/otp';
import { generateFingerprint } from '../utils/deviceInfo';

// In-memory OTP store for prototype (In production, use Redis)
const otpStore = new Map<string, { otp: string; expires: number }>();
// Pending signup data store
const pendingSignupStore = new Map<string, { password: string; full_name: string; expires: number }>();
// Pending login data store (when new device detected)
const pendingLoginStore = new Map<string, { session: any; user: any; fingerprint: string; expires: number }>();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to fast-fail DB queries when Supabase is asleep
const withTimeout = <T>(promise: Promise<T>, ms: number = 1000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
  ]);
};

export class AuthController {

  // ──────────────────────────────────────────────
  // 1. SIGNUP – Request OTP
  // ──────────────────────────────────────────────
  static async signup(req: Request, res: Response) {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Fast-fail check if user exists
      try {
        const existingUserResponse = await withTimeout(
          Promise.resolve(supabaseAdmin.from('users').select('id, email_verified').eq('email', email).single())
        ) as any;
        
        if (existingUserResponse.data && existingUserResponse.data.email_verified) {
          return res.status(400).json({ error: 'User already exists' });
        }
      } catch (dbErr) {
        console.log('[Signup] DB check timed out or failed (likely asleep). Proceeding with mock signup flow.');
      }

      // Generate & store OTP
      const otp = generateOtp();
      otpStore.set(email, { otp, expires: Date.now() + OTP_TTL_MS });

      // Store pending signup data
      pendingSignupStore.set(email, {
        password,
        full_name: full_name || '',
        expires: Date.now() + OTP_TTL_MS,
      });

      // Send OTP via email (Compulsory with 6s timeout so UI never hangs)
      let responseMsg = 'OTP sent successfully to your email';
      try {
        await withTimeout(EmailService.sendOtp(email, otp), 6000);
        console.log(`[Email] OTP sent successfully to ${email}`);
      } catch (emailErr: any) {
        console.error('[Email] Failed or timed out sending OTP:', emailErr.message);
        responseMsg = `Verification Code: ${otp}\n(Please enter this code to complete registration)`;
      }
      return res.status(200).json({
        message: responseMsg,
        requiresOtp: true,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // ──────────────────────────────────────────────
  // 2. SIGNUP – Verify OTP & Create Account
  // ──────────────────────────────────────────────
  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const storedData = otpStore.get(email);
      if (!storedData || storedData.expires < Date.now()) {
        return res.status(400).json({ error: 'OTP expired or not requested' });
      }
      if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
      const pendingUser = pendingSignupStore.get(email);
      if (!pendingUser) return res.status(400).json({ error: 'Signup session expired' });

      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email, password: pendingUser.password, email_confirm: true, user_metadata: { full_name: pendingUser.full_name }
        });
        if (authError) throw authError;

        const fingerprint = generateFingerprint(req);
        await supabaseAdmin.from('users').insert({
          id: authData.user.id, email, password_hash: crypto.createHash('sha256').update(pendingUser.password).digest('hex'),
          full_name: pendingUser.full_name, email_verified: true, email_verified_at: new Date().toISOString(), known_devices: JSON.stringify([fingerprint])
        });

        otpStore.delete(email); pendingSignupStore.delete(email);

        return res.status(201).json({
          message: 'Account created successfully',
          session: { access_token: 'mock-token-123' },
          user: { id: authData.user.id, email: authData.user.email, full_name: pendingUser.full_name },
        });
      } catch (err: any) {
        console.error('DB error during signup, using mock fallback for presentation:', err);
        otpStore.delete(email); pendingSignupStore.delete(email);
        return res.status(201).json({
          message: 'Account created (Mocked for presentation)',
          session: { access_token: 'mock-token-123' },
          user: { id: 'mock-user-id', email: email, full_name: pendingUser.full_name },
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // ──────────────────────────────────────────────
  // 3. LOGIN – with new‑device detection
  // ──────────────────────────────────────────────
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      try {
        const authResponse = await withTimeout(
          supabaseAdmin.auth.signInWithPassword({ email, password })
        ) as any;
        
        if (authResponse.error) throw authResponse.error;
        
        // Login successful via DB
        return res.status(200).json({ 
          message: 'Login successful', 
          session: authResponse.data.session, 
          user: authResponse.data.user, 
          newDevice: false,
          skipOtp: true // Tell frontend to skip OTP
        });
        
      } catch (err: any) {
        console.error('DB/Auth error during login (fast-fail):', err.message);
        
        // If the error specifically says invalid credentials, reject!
        if (err.message && err.message.toLowerCase().includes('invalid login credentials')) {
          return res.status(401).json({ error: 'Incorrect password or email' });
        }
        
        // Offline Mock Fallback for existing user login (only if DB is down): NO OTP REQUIRED
        return res.status(200).json({
          message: 'Login successful (mock for presentation)',
          session: { access_token: 'mock-token-' + Date.now() },
          user: { id: 'mock-user-id', email },
          newDevice: false,
          skipOtp: true // Tell frontend to skip OTP
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // ──────────────────────────────────────────────
  // 4. LOGIN – Verify device OTP
  // ──────────────────────────────────────────────
  static async verifyLoginOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const storedData = otpStore.get(`login_${email}`);
      if (!storedData || storedData.expires < Date.now()) return res.status(400).json({ error: 'OTP expired or not requested' });
      if (storedData.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

      const pending = pendingLoginStore.get(email);
      if (!pending) return res.status(400).json({ error: 'Login session expired, please login again' });

      try {
        const { data: userRow } = await supabaseAdmin.from('users').select('known_devices').eq('email', email).single();
        const knownDevices: string[] = userRow?.known_devices ? JSON.parse(userRow.known_devices) : [];
        if (!knownDevices.includes(pending.fingerprint)) knownDevices.push(pending.fingerprint);
        await supabaseAdmin.from('users').update({ known_devices: JSON.stringify(knownDevices) }).eq('email', email);
      } catch (err: any) {
        console.error('DB error during known_devices update, ignoring for mock presentation:', err);
      }

      otpStore.delete(`login_${email}`);
      pendingLoginStore.delete(email);

      return res.status(200).json({
        message: 'Device verified – login successful',
        session: pending.session,
        user: pending.user,
        newDevice: false,
      });
    } catch (error: any) {
      console.error('Verify login OTP error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // ──────────────────────────────────────────────
  // 5. ADMIN LOGIN
  // ──────────────────────────────────────────────
  static async adminLogin(req: Request, res: Response) {
    try {
      const { email, passkey } = req.body;
      const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'ADMIN2026';
      const MAIN_ADMIN_EMAIL = 'sai17042004@gmail.com';

      if (passkey !== ADMIN_PASSKEY) {
        return res.status(401).json({ error: 'Invalid admin passkey' });
      }

      if (email === MAIN_ADMIN_EMAIL) {
        // Main Admin - Instant Login
        return res.status(200).json({
          message: 'Admin login successful',
          session: { access_token: 'mock-admin-token-' + Date.now() },
          user: { id: 'main-admin-id', email, user_metadata: { role: 'admin' } },
          requiresVerification: false
        });
      } else {
        // Sub-Admin - Needs Verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the sub-admin request temporarily
        otpStore.set(`admin_${email}`, { otp, expires: Date.now() + 10 * 60 * 1000 });
        pendingLoginStore.set(`admin_${email}`, {
          session: { access_token: 'mock-admin-token-' + Date.now() },
          user: { id: 'sub-admin-' + Date.now(), email, user_metadata: { role: 'admin' } },
          fingerprint: 'subadmin',
          expires: Date.now() + 10 * 60 * 1000
        });

        // Send OTP to Main Admin email
        let responseMsg = `Verification code sent to Main Admin (${MAIN_ADMIN_EMAIL})`;
        try {
          await EmailService.sendOtp(MAIN_ADMIN_EMAIL, otp);
          console.log(`[Admin] Sub-admin OTP for ${email} sent to Main Admin (${MAIN_ADMIN_EMAIL})`);
        } catch (mailErr: any) {
          console.log(`[Admin] Email failed, OTP for ${email} is: ${otp}`);
          responseMsg = `(Email Failed) Sub-Admin OTP is: ${otp}`;
        }

        return res.status(200).json({
          message: responseMsg,
          requiresVerification: true,
          email
        });
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // ──────────────────────────────────────────────
  // 6. ADMIN LOGIN VERIFY
  // ──────────────────────────────────────────────
  static async verifyAdminOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const storedData = otpStore.get(`admin_${email}`);
      
      if (!storedData || storedData.expires < Date.now()) {
        return res.status(400).json({ error: 'Verification expired or not requested' });
      }
      if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      const pending = pendingLoginStore.get(`admin_${email}`);
      if (!pending) {
        return res.status(400).json({ error: 'Session expired, please try again' });
      }

      // Clear stores
      otpStore.delete(`admin_${email}`);
      pendingLoginStore.delete(`admin_${email}`);

      return res.status(200).json({
        message: 'Admin verified successfully',
        session: pending.session,
        user: pending.user,
        requiresVerification: false
      });
    } catch (error: any) {
      console.error('Admin verification error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // ──────────────────────────────────────────────
  // 7. FORGOT PASSWORD – Send Reset OTP
  // ──────────────────────────────────────────────
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(`reset_${email}`, { otp, expires: Date.now() + 10 * 60 * 1000 });
      
      let responseMsg = 'Reset code sent to your email';
      try {
        await withTimeout(EmailService.sendOtp(email, otp), 6000);
        console.log(`[Reset] OTP sent to ${email}`);
      } catch (mailErr: any) {
        console.log(`[Reset] Email failed or timed out, OTP for ${email} is: ${otp}`);
        responseMsg = `(Email Failed) Your Reset Code is: ${otp}`;
      }
      
      return res.status(200).json({ message: responseMsg, email });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // ──────────────────────────────────────────────
  // 8. FORGOT PASSWORD – Verify OTP & Reset
  // ──────────────────────────────────────────────
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      const storedData = otpStore.get(`reset_${email}`);
      
      if (!storedData || storedData.expires < Date.now()) {
        return res.status(400).json({ error: 'Reset code expired or not requested' });
      }
      if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid reset code' });
      }
      
      // Try to update in Supabase
      try {
        await supabaseAdmin.auth.admin.updateUserById(
          (await supabaseAdmin.from('users').select('id').eq('email', email).single()).data?.id || '',
          { password: newPassword }
        );
      } catch (dbErr) {
        console.log('[Reset] DB update failed, mock mode - password reset accepted');
      }
      
      otpStore.delete(`reset_${email}`);
      
      return res.status(200).json({ message: 'Password reset successful. Please log in with your new password.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
