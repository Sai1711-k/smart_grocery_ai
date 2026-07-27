"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceDetection = deviceDetection;
const deviceInfo_1 = require("../utils/deviceInfo");
// Middleware to attach device fingerprint to request
function deviceDetection(req, res, next) {
    const fingerprint = (0, deviceInfo_1.generateFingerprint)(req);
    // Attach to request object for later use
    req.deviceFingerprint = fingerprint;
    next();
}
