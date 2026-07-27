// backend/src/index.ts
import express, { Express, Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createClient } from '@supabase/supabase-js';
import authController, { authenticateToken } from './controllers/authController';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// Environment Variables Validation
// ============================================
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'SUPABASE_URL',
  'SUPABASE_KEY',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    '❌ Missing required environment variables:',
    missingEnvVars.join(', ')
  );
  process.exit(1);
}

// ============================================
// Middleware Configuration
// ============================================

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// Body Parser & Cookie Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Logging Middleware
const logFormat = NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Request ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = Math.random().toString(36).substring(7);
  next();
});

// ============================================
// Database Initialization
// ============================================
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Verify Supabase connection
supabase.from('users').select('count()', { count: 'exact' }).then(
  (result) => {
    if (result.error) {
      console.error('❌ Supabase connection failed:', result.error.message);
      process.exit(1);
    }
    console.log('✅ Supabase connection successful');
  },
  (error) => {
    console.error('❌ Supabase initialization failed:', error.message);
    process.exit(1);
  }
);

// ============================================
// Routes Registration
// ============================================

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// API Version Endpoint
app.get('/api/version', (req: Request, res: Response) => {
  res.json({
    version: process.env.APP_VERSION || '1.0.0',
    name: process.env.APP_NAME || 'Smart Grocery AI',
    environment: NODE_ENV,
  });
});

// API v1 Auth Routes
const authRouter = Router();
authRouter.post('/signup', (req, res) => authController.signup(req, res));
authRouter.post('/login', (req, res) => authController.login(req, res));
authRouter.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));
authRouter.post('/refresh', (req, res) => authController.refresh(req, res));
authRouter.get('/me', authenticateToken, (req, res) => authController.getMe(req, res));
authRouter.put('/profile', authenticateToken, (req, res) => authController.updateProfile(req, res));
app.use('/api/v1/auth', authRouter);

// API v1 Routes (to be implemented)
app.use('/api/v1/users', (req: Request, res: Response) => {
  res.json({ message: 'User routes - Coming soon' });
});

app.use('/api/v1/products', (req: Request, res: Response) => {
  res.json({ message: 'Product routes - Coming soon' });
});

app.use('/api/v1/recommendations', (req: Request, res: Response) => {
  res.json({ message: 'Recommendation routes - Coming soon' });
});

app.use('/api/v1/cart', (req: Request, res: Response) => {
  res.json({ message: 'Cart routes - Coming soon' });
});

app.use('/api/v1/admin', (req: Request, res: Response) => {
  res.json({ message: 'Admin routes - Coming soon' });
});

// ============================================
// Error Handling Middleware
// ============================================

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.id,
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    error: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    requestId: req.id,
  });
});

// ============================================
// Server Startup
// ============================================

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     Smart Grocery AI Backend         ║
╠═══════════════════════════════════════╣
║ 🚀 Server Running                     ║
║ 🔗 URL: http://localhost:${PORT}       ║
║ 🌍 Environment: ${NODE_ENV.toUpperCase().padEnd(25)} ║
║ 💾 Database: ${(process.env.SUPABASE_URL ? 'Supabase' : 'Not Connected').padEnd(20)} ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
export { supabase };

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}
