# Smart Grocery AI - Complete Implementation Setup Guide

## 🚀 Project Initialization (Week 1)

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git initialized
- Supabase account (free tier)
- Vercel account (for frontend deployment)
- Railway/Render account (for backend deployment)

---

## Phase 1: Frontend Setup (Next.js 14)

### Step 1: Initialize Next.js 14 Project
```bash
cd smart-grocery-ai
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend
```

**Recommended options:**
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Src directory: Yes
- Import alias: Yes

### Step 2: Install Core Dependencies

```bash
npm install \
  @supabase/supabase-js \
  @tanstack/react-query \
  zustand \
  react-hook-form \
  zod \
  recharts \
  axios \
  socket.io-client \
  clsx \
  dompurify \
  next-auth
```

### Step 3: Install Dev Dependencies

```bash
npm install --save-dev \
  @types/dompurify \
  @testing-library/react \
  @testing-library/jest-dom \
  jest \
  @playwright/test \
  typescript
```

### Step 4: Create Environment Configuration

Create `frontend/.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_TIMEOUT=30000

# Application Configuration
NEXT_PUBLIC_APP_NAME=Smart Grocery AI
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development
```

Create `frontend/.env.example` (safe to commit):
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_TIMEOUT=30000

# Application Configuration
NEXT_PUBLIC_APP_NAME=Smart Grocery AI
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development
```

### Step 5: Configure Tailwind CSS

Update `frontend/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5AC8FA',
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
        'neutral-50': '#F9FAFB',
        'neutral-100': '#F3F4F6',
        'neutral-200': '#E5E7EB',
        'neutral-300': '#D1D5DB',
        'neutral-400': '#9CA3AF',
        'neutral-500': '#6B7280',
        'neutral-600': '#4B5563',
        'neutral-700': '#374151',
        'neutral-800': '#1F2937',
        'neutral-900': '#111827',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}

export default config
```

### Step 6: Create Project Structure

```bash
mkdir -p frontend/src/{app,components,hooks,lib,services,stores,types,styles}
mkdir -p frontend/src/app/{auth,dashboard,admin,api}
mkdir -p frontend/src/components/{auth,dashboard,products,cart,admin,shared}
```

---

## Phase 2: Backend Setup (Express.js)

### Step 1: Initialize Express Project

```bash
cd smart-grocery-ai
mkdir backend
cd backend
npm init -y
```

### Step 2: Install Core Dependencies

```bash
npm install \
  express \
  typescript \
  ts-node \
  dotenv \
  cors \
  helmet \
  express-validator \
  zod \
  bcryptjs \
  jsonwebtoken \
  @supabase/supabase-js \
  redis \
  bull \
  axios \
  morgan \
  express-rate-limit
```

### Step 3: Install Dev Dependencies

```bash
npm install --save-dev \
  @types/express \
  @types/node \
  @types/bcryptjs \
  @types/jsonwebtoken \
  nodemon \
  jest \
  @types/jest \
  ts-jest \
  supertest \
  @types/supertest
```

### Step 4: Create TypeScript Configuration

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 5: Create Environment Configuration

Create `backend/.env.local`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_ACCESS_SECRET=your_64_char_random_string
JWT_REFRESH_SECRET=your_64_char_random_string
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
SUPABASE_DB_URL=postgresql://user:password@host:5432/database

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Application Configuration
LOG_LEVEL=info
APP_NAME=Smart Grocery AI
APP_VERSION=1.0.0
```

Create `backend/.env.example` (safe to commit):
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secrets
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Supabase Configuration
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_DB_URL=

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Application Configuration
LOG_LEVEL=info
APP_NAME=Smart Grocery AI
APP_VERSION=1.0.0
```

### Step 6: Create Project Structure

```bash
mkdir -p backend/src/{routes,controllers,services,repositories,middleware,models,config,utils}
mkdir -p backend/src/routes/{auth,users,products,recommendations,cart,admin}
mkdir -p backend/tests/unit backend/tests/integration
```

### Step 7: Update package.json Scripts

Update `backend/package.json`:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts"
  }
}
```

---

## Phase 3: Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and set database password
4. Wait for provisioning (~2 minutes)

### Step 2: Configure Database Connection

Get these values from Supabase dashboard:
- Project URL
- Anon Key (for frontend)
- Service Role Key (for backend)
- Database Connection String

### Step 3: Create Database Migrations Directory

```bash
mkdir -p database/migrations
mkdir -p database/seeds
```

### Step 4: Create Initial Schema Migration

Create `database/migrations/001_create_initial_schema.sql`:
```sql
-- This will be populated with the complete schema from Database_Schema_Design.md
-- See next section for full SQL
```

---

## Phase 4: Docker Setup (Local Development)

### Step 1: Create docker-compose.yml

Create `smart-grocery-ai/docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: grocery_ai
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

### Step 2: Start Local Services

```bash
docker-compose up -d
```

---

## Phase 5: Git Repository Setup

### Step 1: Initialize Git

```bash
cd smart-grocery-ai
git init
```

### Step 2: Create .gitignore

Create `.gitignore`:
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build
/dist

# Misc
.DS_Store
*.pem
.env.local
.env.*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
```

### Step 3: Create README.md

Create `README.md`:
```markdown
# Smart Grocery AI Platform

An AI-powered grocery intelligence platform that helps users make healthier, budget-friendly, and personalized grocery decisions.

## Getting Started

### Prerequisites
- Node.js 18+
- Docker (for local PostgreSQL and Redis)
- Supabase account

### Installation

1. Clone repository
   \`\`\`bash
   git clone <repository-url>
   cd smart-grocery-ai
   \`\`\`

2. Setup frontend
   \`\`\`bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Update .env.local with Supabase credentials
   \`\`\`

3. Setup backend
   \`\`\`bash
   cd ../backend
   npm install
   cp .env.example .env.local
   # Update .env.local with credentials
   \`\`\`

4. Start services
   \`\`\`bash
   docker-compose up -d
   npm run dev (in both frontend and backend directories)
   \`\`\`

5. Access application
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - pgAdmin: http://localhost:5050

## Documentation

- [Development Plan](./Smart_Grocery_AI_Development_Plan.md)
- [Security Guide](./Security_Implementation_Guide.md)
- [Database Schema](./Database_Schema_Design.md)
- [Performance Guide](./Performance_And_Architecture_Guide.md)
- [Quick Start](./Implementation_Quick_Start_Guide.md)

## Tech Stack

**Frontend:** Next.js 14, React 18, Tailwind CSS, TanStack Query
**Backend:** Express.js, Node.js, TypeScript
**Database:** PostgreSQL (Supabase), Redis
**Authentication:** JWT, Supabase Auth

## License

MIT
```

---

## Phase 6: Quick Verification

### Check Frontend Setup
```bash
cd frontend
npm run dev
# Should start on http://localhost:3000
```

### Check Backend Setup
```bash
cd backend
npm run dev
# Should start on http://localhost:5000
```

### Check Docker Services
```bash
docker-compose ps
# Should show postgres, redis, pgadmin running
```

---

## Next Steps

1. **Create Authentication System** (Week 1-2)
   - Backend: JWT implementation, password hashing
   - Frontend: Login/Signup forms, auth context

2. **Create Database Schema** (Week 1-2)
   - Run migrations on Supabase
   - Set up RLS policies
   - Create indexes

3. **Implement Core APIs** (Week 2-4)
   - User endpoints
   - Product endpoints
   - Recommendation engine

4. **Build Dashboard UI** (Week 3-4)
   - Responsive layout
   - Component library
   - State management integration

5. **Connect Frontend to Backend** (Week 4-5)
   - API client setup
   - Data fetching hooks
   - Error handling

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Docker Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild
docker-compose up -d --build
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Key Decisions Made

✅ **Next.js 14** - Best for performance, server components, Vercel integration
✅ **Express.js** - Lightweight, flexible, industry-standard
✅ **PostgreSQL** - ACID compliance, RLS support, powerful queries
✅ **Redis** - High-performance caching, job queues
✅ **TypeScript** - Type safety, better DX, fewer runtime errors
✅ **Tailwind CSS** - Utility-first, rapid development
✅ **JWT** - Stateless, scalable authentication

---

**Status:** Ready to Start Implementation
**Estimated Time to MVP:** 12 weeks
**Team Size:** 2-3 engineers

Let's build something amazing! 🚀
