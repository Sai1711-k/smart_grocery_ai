"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
const crypto_1 = __importDefault(require("crypto"));
function generateOtp() {
    // Cryptographically secure random 6-digit numeric OTP (100000 - 999999)
    return crypto_1.default.randomInt(100000, 999999).toString();
}
