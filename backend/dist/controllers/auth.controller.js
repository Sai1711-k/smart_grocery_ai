"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const supabase_1 = require("../config/supabase");
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("../services/email.service");
const otp_1 = require("../utils/otp");
const deviceInfo_1 = require("../utils/deviceInfo");
// In-memory OTP store for prototype (In production, use Redis)
const otpStore = new Map();
// Pending signup data store
const pendingSignupStore = new Map();
// Pending login data store (when new device detected)
const pendingLoginStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
class AuthController {
    // ──────────────────────────────────────────────
    // 1. SIGNUP – Request OTP
    // ──────────────────────────────────────────────
    static async signup(req, res) {
        try {
            const { email, password, full_name } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            // Check if user already exists
            const { data: existingUser } = await supabase_1.supabaseAdmin
                .from('users')
                .select('id, email_verified')
                .eq('email', email)
                .single();
            if (existingUser && existingUser.email_verified) {
                return res.status(400).json({ error: 'User already exists' });
            }
            // Generate & store OTP
            const otp = (0, otp_1.generateOtp)();
            otpStore.set(email, { otp, expires: Date.now() + OTP_TTL_MS });
            // Store pending signup data
            pendingSignupStore.set(email, {
                password,
                full_name: full_name || '',
                expires: Date.now() + OTP_TTL_MS,
            });
            // Send OTP via email
            try {
                await email_service_1.EmailService.sendOtp(email, otp);
            }
            catch (emailErr) {
                console.warn('[Email] Failed to send – falling back to dev log:', emailErr);
            }
            // Always log OTP in dev for testing
            console.log(`[DEV] OTP for ${email}: ${otp}`);
            return res.status(200).json({
                message: 'OTP sent successfully to email',
                requiresOtp: true,
                dev_otp: otp, // Remove in production
            });
        }
        catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
    // ──────────────────────────────────────────────
    // 2. SIGNUP – Verify OTP & Create Account
    // ──────────────────────────────────────────────
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const storedData = otpStore.get(email);
            if (!storedData || storedData.expires < Date.now()) {
                return res.status(400).json({ error: 'OTP expired or not requested' });
            }
            if (storedData.otp !== otp) {
                return res.status(400).json({ error: 'Invalid OTP' });
            }
            // Get pending signup details
            const pendingUser = pendingSignupStore.get(email);
            if (!pendingUser) {
                return res.status(400).json({ error: 'Signup session expired' });
            }
            // 1. Create user in Supabase Auth
            const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
                email,
                password: pendingUser.password,
                email_confirm: true,
                user_metadata: { full_name: pendingUser.full_name },
            });
            if (authError)
                throw authError;
            // 2. Build device fingerprint and store it as the first known device
            const fingerprint = (0, deviceInfo_1.generateFingerprint)(req);
            // 3. Create user record in our custom `users` table
            const { error: dbError } = await supabase_1.supabaseAdmin
                .from('users')
                .insert({
                id: authData.user.id,
                email,
                password_hash: crypto_1.default.createHash('sha256').update(pendingUser.password).digest('hex'),
                full_name: pendingUser.full_name,
                email_verified: true,
                email_verified_at: new Date().toISOString(),
                known_devices: JSON.stringify([fingerprint]),
            });
            if (dbError) {
                console.error('Failed to create user in DB:', dbError);
            }
            // Clean up
            otpStore.delete(email);
            pendingSignupStore.delete(email);
            return res.status(201).json({
                message: 'Account created successfully',
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    full_name: pendingUser.full_name,
                },
            });
        }
        catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
    // ──────────────────────────────────────────────
    // 3. LOGIN – with new‑device detection
    // ──────────────────────────────────────────────
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            // Authenticate credentials
            const { data, error } = await supabase_1.supabaseAdmin.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                return res.status(401).json({ error: error.message });
            }
            // Build fingerprint from the current request
            const fingerprint = (0, deviceInfo_1.generateFingerprint)(req);
            // Look up user's known devices
            const { data: userRow } = await supabase_1.supabaseAdmin
                .from('users')
                .select('known_devices')
                .eq('email', email)
                .single();
            const knownDevices = userRow?.known_devices
                ? JSON.parse(userRow.known_devices)
                : [];
            // If device is already known → login immediately
            if (knownDevices.includes(fingerprint)) {
                return res.status(200).json({
                    message: 'Login successful',
                    session: data.session,
                    user: data.user,
                    newDevice: false,
                });
            }
            // ── NEW DEVICE DETECTED ──
            // Generate OTP and require verification before releasing the session
            const otp = (0, otp_1.generateOtp)();
            otpStore.set(`login_${email}`, { otp, expires: Date.now() + OTP_TTL_MS });
            pendingLoginStore.set(email, {
                session: data.session,
                user: data.user,
                fingerprint,
                expires: Date.now() + OTP_TTL_MS,
            });
            // Send OTP
            try {
                await email_service_1.EmailService.sendOtp(email, otp);
            }
            catch (emailErr) {
                console.warn('[Email] Failed to send login OTP:', emailErr);
            }
            console.log(`[DEV] Login OTP for ${email}: ${otp}`);
            return res.status(200).json({
                message: 'New device detected – OTP sent to your email',
                requiresOtp: true,
                newDevice: true,
                dev_otp: otp, // Remove in production
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
    // ──────────────────────────────────────────────
    // 4. LOGIN – Verify device OTP
    // ──────────────────────────────────────────────
    static async verifyLoginOtp(req, res) {
        try {
            const { email, otp } = req.body;
            // Check OTP
            const storedData = otpStore.get(`login_${email}`);
            if (!storedData || storedData.expires < Date.now()) {
                return res.status(400).json({ error: 'OTP expired or not requested' });
            }
            if (storedData.otp !== otp) {
                return res.status(400).json({ error: 'Invalid OTP' });
            }
            // Retrieve pending login session
            const pending = pendingLoginStore.get(email);
            if (!pending || pending.expires < Date.now()) {
                return res.status(400).json({ error: 'Login session expired, please login again' });
            }
            // Add this device to known devices
            const { data: userRow } = await supabase_1.supabaseAdmin
                .from('users')
                .select('known_devices')
                .eq('email', email)
                .single();
            const knownDevices = userRow?.known_devices
                ? JSON.parse(userRow.known_devices)
                : [];
            if (!knownDevices.includes(pending.fingerprint)) {
                knownDevices.push(pending.fingerprint);
            }
            await supabase_1.supabaseAdmin
                .from('users')
                .update({ known_devices: JSON.stringify(knownDevices) })
                .eq('email', email);
            // Clean up
            otpStore.delete(`login_${email}`);
            pendingLoginStore.delete(email);
            return res.status(200).json({
                message: 'Device verified – login successful',
                session: pending.session,
                user: pending.user,
                newDevice: true,
            });
        }
        catch (error) {
            console.error('Verify login OTP error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
}
exports.AuthController = AuthController;
