"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTransporter = exports.getTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let transporterInstance = null;
const getTransporter = async () => {
    if (transporterInstance)
        return transporterInstance;
    const host = (process.env.EMAIL_HOST || 'smtp.gmail.com').replace(/^["']|["']$/g, '').trim();
    const port = Number(process.env.EMAIL_PORT) || 587;
    const user = (process.env.EMAIL_USER || '').replace(/^["']|["']$/g, '').trim();
    const pass = (process.env.EMAIL_PASS || '').replace(/^["']|["']$/g, '').trim();
    if (!host || !user || !pass) {
        throw new Error('SMTP not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
    }
    console.log(`[Email] Creating SMTP transporter: ${user} @ ${host}:${port}`);
    const isGmail = host?.includes('gmail');
    transporterInstance = nodemailer_1.default.createTransport(isGmail
        ? {
            service: 'gmail',
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
        }
        : {
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
        });
    // Verify the connection works
    try {
        await transporterInstance.verify();
        console.log('[Email] SMTP connection verified successfully!');
    }
    catch (err) {
        console.error('[Email] SMTP verification failed:', err.message);
        transporterInstance = null; // Reset so next call retries
        throw new Error('SMTP connection failed: ' + err.message);
    }
    return transporterInstance;
};
exports.getTransporter = getTransporter;
// Force reset the transporter (useful after .env changes)
const resetTransporter = () => {
    transporterInstance = null;
};
exports.resetTransporter = resetTransporter;
