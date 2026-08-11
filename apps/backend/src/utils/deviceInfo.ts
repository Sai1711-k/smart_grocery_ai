import crypto from 'crypto';
import { Request } from 'express';

export function generateFingerprint(req: Request): string {
  const ip = req.ip || req.headers['x-forwarded-for'] || '';
  const ua = req.headers['user-agent'] || '';
  const raw = `${ip}|${ua}`;
  // Simple SHA256 hash of IP + UA
  return crypto.createHash('sha256').update(raw).digest('hex');
}
