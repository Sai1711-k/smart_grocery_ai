import { Request, Response, NextFunction } from 'express';
import { generateFingerprint } from '../utils/deviceInfo';

// Middleware to attach device fingerprint to request
export function deviceDetection(req: Request, res: Response, next: NextFunction) {
  const fingerprint = generateFingerprint(req);
  // Attach to request object for later use
  (req as any).deviceFingerprint = fingerprint;
  next();
}
