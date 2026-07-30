"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
// Force IPv4 first to prevent ENETUNREACH errors on Windows for IPv6
dns_1.default.setDefaultResultOrder('ipv4first');
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Basic health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes (Supports both /api/* and direct /* paths for maximum URL flexibility)
app.use('/api/auth', auth_routes_1.default);
app.use('/auth', auth_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/admin', admin_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/cart', cart_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/orders', order_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/ai', ai_routes_1.default);
app.listen(port, () => {
    console.log(`⚡️[server]: Backend API is running at http://localhost:${port}`);
});
