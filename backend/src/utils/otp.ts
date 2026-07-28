import crypto from 'crypto';

export function generateOtp(): string {
  // Cryptographically secure random 6-digit numeric OTP (100000 - 999999)
  return crypto.randomInt(100000, 999999).toString();
}
