"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const deviceDetection_1 = require("../middleware/deviceDetection");
const router = (0, express_1.Router)();
// Signup flow
router.post('/signup', auth_controller_1.AuthController.signup);
router.post('/signup/verify', auth_controller_1.AuthController.verifyOtp);
// Login flow (device detection middleware attached)
router.post('/login', deviceDetection_1.deviceDetection, auth_controller_1.AuthController.login);
router.post('/login/verify', auth_controller_1.AuthController.verifyLoginOtp);
exports.default = router;
