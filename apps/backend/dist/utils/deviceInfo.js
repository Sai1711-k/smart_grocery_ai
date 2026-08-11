"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFingerprint = generateFingerprint;
const crypto_1 = __importDefault(require("crypto"));
function generateFingerprint(req) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '';
    const ua = req.headers['user-agent'] || '';
    const raw = `${ip}|${ua}`;
    // Simple SHA256 hash of IP + UA
    return crypto_1.default.createHash('sha256').update(raw).digest('hex');
}
