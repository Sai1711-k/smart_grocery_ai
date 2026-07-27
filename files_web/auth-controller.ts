// backend/src/controllers/authController.ts
// Combines auth middleware and auth controllers in a single module
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/authService';

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided',
    });
  }

  const payload = authService.verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }

  // Attach user to request
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };

  next();
};

/**
 * Check if user is admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }

  next();
};

/**
 * Optional authentication - attach user if token exists
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = authService.verifyAccessToken(token);
    if (payload) {
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }
  }

  next();
};

// ============================================
// Auth Controllers
// ============================================


// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

class AuthController {
  /**
   * POST /api/v1/auth/signup
   * Register a new user
   */
  async signup(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const { email, password, fullName } = signupSchema.parse(req.body);

      // Register user
      const { user, accessToken, refreshToken } = await authService.signup(
        email,
        password,
        fullName
      );

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return response (without password hash)
      res.status(201).json({
        message: 'User registered successfully',
        user,
        accessToken,
      });
    } catch (error: any) {
      console.error('Signup error:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          issues: error.issues,
        });
      } else {
        res.status(400).json({
          error: 'Signup Failed',
          message: error.message,
        });
      }
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login user with email and password
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const { email, password } = loginSchema.parse(req.body);

      // Login user
      const { user, accessToken, refreshToken } = await authService.login(
        email,
        password
      );

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return response
      res.json({
        message: 'Login successful',
        user,
        accessToken,
      });
    } catch (error: any) {
      console.error('Login error:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          issues: error.issues,
        });
      } else {
        res.status(401).json({
          error: 'Login Failed',
          message: error.message,
        });
      }
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        message: 'Logout successful',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Logout Failed',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookie or body
      const refreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Refresh token is required',
        });
        return;
      }

      // Refresh token
      const accessToken = await authService.refreshAccessToken(refreshToken);

      res.json({
        accessToken,
      });
    } catch (error: any) {
      console.error('Refresh error:', error);
      res.status(401).json({
        error: 'Token Refresh Failed',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No user context',
        });
        return;
      }

      const user = await authService.getUserProfile(req.user.id);

      res.json({
        user,
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to fetch profile',
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/auth/profile
   * Update current user profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No user context',
        });
        return;
      }

      const { fullName } = req.body;

      const user = await authService.updateUserProfile(req.user.id, {
        full_name: fullName,
      } as any);

      res.json({
        message: 'Profile updated successfully',
        user,
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(400).json({
        error: 'Update Failed',
        message: error.message,
      });
    }
  }
}

export default new AuthController();
export { authenticateToken, isAdmin, optionalAuth };
