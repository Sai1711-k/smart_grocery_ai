# Smart Grocery AI - Implementation Quick Start Guide

## 🚀 Project Setup Instructions

### Prerequisites
```bash
Node.js: 18.17+
npm: 9+
Git: Latest
PostgreSQL: 14+ (or Supabase)
Redis: 6+ (or Upstash Redis)
```

---

## 📦 Step-by-Step Setup

### Phase 1: Initialize Project

#### 1.1 Clone & Create Repository
```bash
# Create project directory
mkdir smart-grocery-ai && cd smart-grocery-ai

# Initialize git
git init

# Create root package.json for monorepo
mkdir frontend backend database
```

#### 1.2 Setup Frontend (Next.js)
```bash
cd frontend

# Create Next.js app with TypeScript
npx create-next-app@latest . --typescript --tailwind

# Install additional dependencies
npm install \
  @supabase/supabase-js \
  @supabase/auth-helpers-nextjs \
  axios \
  zustand \
  @tanstack/react-query \
  react-hook-form \
  zod \
  recharts \
  next-auth \
  js-cookie \
  clsx \
  tailwind-merge \
  lucide-react

# Dev dependencies
npm install -D \
  @types/node \
  typescript \
  @playwright/test \
  jest \
  @testing-library/react \
  @testing-library/jest-dom

cd ..
```

#### 1.3 Setup Backend (Express.js)
```bash
cd backend

# Initialize Node project
npm init -y

# Install dependencies
npm install \
  express \
  @supabase/supabase-js \
  dotenv \
  cors \
  helmet \
  express-rate-limit \
  ioredis \
  bull \
  bcryptjs \
  jsonwebtoken \
  zod \
  express-async-errors \
  morgan \
  compression \
  axios \
  node-cron

# Dev dependencies
npm install -D \
  typescript \
  @types/express \
  @types/node \
  @types/bcryptjs \
  ts-node \
  tsx \
  jest \
  @types/jest \
  supertest \
  nodemon

# Create TypeScript configuration
npx tsc --init

cd ..
```

#### 1.4 Setup Database (Supabase)
```bash
# Create account at supabase.com

# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project or use existing
supabase projects list
supabase projects create --name="smart-grocery-ai"
```

---

### Phase 2: Environment Configuration

#### 2.1 Create Environment Files

**frontend/.env.local**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx_xxxx_xxxx

# API
NEXT_PUBLIC_API_URL=http://localhost:5000

# App
NEXT_PUBLIC_APP_NAME=Smart Grocery AI
NEXT_PUBLIC_APP_ENV=development

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

**backend/.env**
```env
# Server
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx_xxxx_xxxx
SUPABASE_DB_URL=postgresql://postgres:password@host:5432/postgres

# JWT
JWT_ACCESS_SECRET=generate-random-64-char-string-here
JWT_REFRESH_SECRET=generate-random-64-char-string-here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# Encryption
ENCRYPTION_KEY=generate-random-64-char-string-here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=debug
```

#### 2.2 Create GitHub Secrets (for CI/CD)
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
ENCRYPTION_KEY
```

---

### Phase 3: Database Setup

#### 3.1 Run Migrations (Using Supabase)
```bash
# Push migrations to Supabase
supabase db push

# Or manually create tables using SQL files in database/migrations/
```

#### 3.2 Create Initial Migration File
```bash
# database/migrations/001_initial_schema.sql

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  budget_preference DECIMAL(10, 2),
  health_preference VARCHAR(50),
  family_size INTEGER DEFAULT 1,
  preferred_store_id UUID,
  email_verified BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Add RLS policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX idx_users_email ON users(email);

-- ... (add remaining tables from Database Schema Guide)
```

#### 3.3 Seed Initial Data (Optional)
```bash
# database/seeds/seed.sql
INSERT INTO categories (name, icon_url, color_code) VALUES
  ('Fruits & Vegetables', '/icons/vegetables.svg', '#22C55E'),
  ('Dairy & Eggs', '/icons/dairy.svg', '#F59E0B'),
  ('Meat & Fish', '/icons/meat.svg', '#EF4444'),
  ('Grains & Bread', '/icons/grains.svg', '#D4AF37'),
  ('Beverages', '/icons/beverages.svg', '#3B82F6');

-- Insert sample stores
INSERT INTO stores (name, delivery_fee, average_delivery_time) VALUES
  ('Fresh Market', 49.00, 30),
  ('Super Store', 29.00, 45),
  ('Organic Hub', 79.00, 45);
```

---

### Phase 4: Frontend Implementation

#### 4.1 Create Folder Structure
```bash
mkdir -p frontend/src/{
  app/{auth,dashboard,admin},
  components/{auth,dashboard,products,cart,shared},
  hooks,
  lib,
  styles,
  types,
  config
}
```

#### 4.2 Setup Supabase Client
**frontend/lib/supabase.ts**
```typescript
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Type-safe queries
export type Tables<T extends keyof typeof import('./schema').Database['public']['Tables']> = 
  typeof import('./schema').Database['public']['Tables'][T]['Row'];
```

#### 4.3 Setup API Client
**frontend/lib/api.ts**
```typescript
import axios, { AxiosInstance } from 'axios';
import { supabase } from './supabase';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      const { data } = await supabase.auth.refreshSession();
      if (data.session?.access_token) {
        error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
        return apiClient(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### 4.4 Create Custom Hooks
**frontend/hooks/useAuth.ts**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading };
};
```

---

### Phase 5: Backend Implementation

#### 5.1 Create Server Structure
```bash
mkdir -p backend/src/{
  routes,
  controllers,
  services,
  repositories,
  middleware,
  types,
  utils,
  config
}
```

#### 5.2 Initialize Express Server
**backend/src/index.ts**
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import 'express-async-errors';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import recommendationRoutes from './routes/recommendations';
import adminRoutes from './routes/admin';

import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', authMiddleware, recommendationRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 5.3 Create Authentication Controller
**backend/src/controllers/authController.ts**
```typescript
import { Request, Response } from 'express';
import { supabase } from '@/utils/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in Supabase
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });

    if (error) throw error;

    // Create user profile
    await supabase.from('users').insert({
      id: user.id,
      email,
      password_hash: passwordHash,
      full_name: name
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: process.env.JWT_ACCESS_EXPIRE }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      user: { id: user.id, email },
      accessToken
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

---

### Phase 6: Testing Setup

#### 6.1 Setup Jest Configuration
**frontend/jest.config.js**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### 6.2 Setup Playwright E2E Tests
**frontend/e2e/auth.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should sign up a new user', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="name"]', 'Test User');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

### Phase 7: Deployment Configuration

#### 7.1 Create Docker Configuration
**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: smart_grocery
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/smart_grocery
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:5000
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### 7.2 Create CI/CD Pipeline
**.github/workflows/deploy.yml**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy backend
        run: railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## ⚠️ IMPORTANT: NEXT STEP - Figma Design Templates

### 📌 Please Provide Your Figma Design File

To complete the implementation plan with exact component specifications, UI designs, and styling guidelines, **please share your Figma design file link**.

**Expected Figma file should contain:**
- [ ] Login/Signup screens
- [ ] Dashboard layouts
- [ ] Product search interface
- [ ] Cart & checkout flow
- [ ] Recommendation cards
- [ ] Admin analytics dashboard
- [ ] Mobile responsive designs
- [ ] Color palette & typography
- [ ] Component library (buttons, inputs, cards, etc.)

### 📝 How to Share Figma File

1. **In Figma:** Click Share → Copy link
2. **Required permission:** "View" or "Edit" access
3. **URL format:** `https://figma.com/design/XXXX/SmartGroceryAI`

### ✅ After You Share the Figma Link, I Will:

1. **Extract Component Specifications**
   - Analyze all UI components from your designs
   - Document component properties and variants
   - Extract design tokens (colors, typography, spacing)

2. **Create React Components**
   - Generate React component code matching Figma designs
   - Implement responsive layouts
   - Apply Tailwind CSS styling

3. **Create Component Library**
   - Build Storybook documentation
   - Document component usage patterns
   - Create example implementations

4. **Integration Guide**
   - Connect components to backend APIs
   - Add state management
   - Implement form validations

5. **UI Implementation Checklist**
   - All pages and screens
   - Navigation flows
   - Responsive breakpoints
   - Accessibility standards

---

## 🎯 Implementation Checklist (Without Figma)

### Frontend Setup
- [ ] Next.js project initialized
- [ ] Tailwind CSS configured
- [ ] Supabase client setup
- [ ] API client configured
- [ ] Authentication hooks created
- [ ] State management setup (Zustand)
- [ ] React Query configured
- [ ] Error handling implemented

### Backend Setup
- [ ] Express server initialized
- [ ] PostgreSQL connection established
- [ ] Redis connection configured
- [ ] JWT authentication implemented
- [ ] Rate limiting configured
- [ ] CORS setup
- [ ] Error handling middleware
- [ ] Logging configured

### Database
- [ ] All tables created
- [ ] Indexes created
- [ ] RLS policies applied
- [ ] Initial data seeded
- [ ] Backup strategy configured

### Security
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Input validation setup
- [ ] Password hashing implemented
- [ ] Audit logging enabled

### Testing
- [ ] Unit tests setup
- [ ] Integration tests setup
- [ ] E2E tests setup
- [ ] Jest configuration
- [ ] Playwright configuration

### Deployment
- [ ] Docker configuration
- [ ] CI/CD pipeline setup
- [ ] Environment secrets configured
- [ ] Deployment documented

---

## 📚 Documentation Files Generated

1. **Smart_Grocery_AI_Development_Plan.md** - High-level project plan
2. **Security_Implementation_Guide.md** - Complete security setup
3. **Performance_And_Architecture_Guide.md** - Backend architecture & optimization
4. **Database_Schema_Design.md** - Complete database schema
5. **Implementation_Quick_Start_Guide.md** - This file

---

## 🚀 Quick Start Commands

```bash
# Frontend
cd frontend
npm install
npm run dev  # http://localhost:3000

# Backend
cd backend
npm install
npm run dev  # http://localhost:5000

# Database
supabase start

# Docker (all services)
docker-compose up

# Tests
npm test
npm run test:e2e
npm run lint
```

---

## 🎨 Design System Parameters (Ready for Figma Integration)

**Once Figma file is provided, we'll extract:**

```typescript
// Will be auto-generated from Figma
export const designSystem = {
  colors: {
    primary: '#', // Auto-extracted
    secondary: '#',
    accent: '#'
  },
  typography: {
    heading: { fontSize: '', fontWeight: '' },
    body: { fontSize: '', fontWeight: '' }
  },
  spacing: {
    xs: '', sm: '', md: '', lg: '', xl: ''
  },
  breakpoints: {
    mobile: '', tablet: '', desktop: ''
  }
};
```

---

**Next Action:** Share your Figma design file link, and I'll generate component-specific implementation code! 🎨
