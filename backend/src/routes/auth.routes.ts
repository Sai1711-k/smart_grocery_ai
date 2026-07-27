import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { deviceDetection } from '../middleware/deviceDetection';

const router = Router();

// Signup flow
router.post('/signup', AuthController.signup);
router.post('/signup/verify', AuthController.verifyOtp);

// Login flow (device detection middleware attached)
router.post('/login', deviceDetection, AuthController.login);
router.post('/login/verify', AuthController.verifyLoginOtp);

// Forgot password flow
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Admin flow
router.post('/admin/login', AuthController.adminLogin);
router.post('/admin/verify', AuthController.verifyAdminOtp);

export default router;
