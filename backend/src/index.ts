import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import dns from 'dns';

// Force IPv4 first to prevent ENETUNREACH errors on Windows for IPv6
dns.setDefaultResultOrder('ipv4first');
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Backend API is running at http://localhost:${port}`);
});
