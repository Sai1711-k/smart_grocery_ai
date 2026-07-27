"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
function generateOtp() {
    // Generates a random 6-digit numeric OTP as string
    return Math.floor(100000 + Math.random() * 900000).toString();
}
