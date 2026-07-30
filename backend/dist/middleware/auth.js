"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = void 0;
const supabase_1 = require("../config/supabase");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split(' ')[1];
        // Bypass for presentation mock mode when DB/SMTP is down
        if (token.startsWith('mock-admin-')) {
            req.user = { id: 'mock-admin-id', email: 'admin@freshcart.com', user_metadata: { full_name: 'Admin User', role: 'admin' } };
            return next();
        }
        if (token.startsWith('mock-')) {
            req.user = { id: 'mock-user-id', email: 'presentation@mock.com', user_metadata: { full_name: 'Presentation User' } };
            return next();
        }
        const { data: { user }, error } = await supabase_1.supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
exports.requireAuth = requireAuth;
const requireAdmin = async (req, res, next) => {
    try {
        // Make sure requireAuth runs first so req.user exists
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const isAdmin = req.user.user_metadata?.role === 'admin' || req.user.email === 'sai17042004@gmail.com';
        if (!isAdmin) {
            return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
        }
        next();
    }
    catch (err) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
exports.requireAdmin = requireAdmin;
