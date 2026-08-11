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
// Forgot password flow
router.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', auth_controller_1.AuthController.resetPassword);
// Admin flow
router.post('/admin/login', auth_controller_1.AuthController.adminLogin);
router.post('/admin/verify', auth_controller_1.AuthController.verifyAdminOtp);
exports.default = router;
