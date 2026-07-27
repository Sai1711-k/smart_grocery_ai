# Smart Grocery AI - Performance & Backend Architecture Guide

## ⚡ Performance Optimization Strategy

### 1. Frontend Performance Optimization

#### Core Web Vitals Targets
```
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
TTFB (Time to First Byte): < 600ms
```

#### Image Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com'
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365 // 1 year
  }
};

// Component usage
import Image from 'next/image';

<Image
  src="/products/item.jpg"
  alt="Product"
  width={400}
  height={300}
  priority={false} // Only true for LCP image
  quality={80}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // Pre-blurred placeholder
  loading="lazy" // Default
/>
```

#### Code Splitting & Dynamic Imports
```typescript
import dynamic from 'next/dynamic';

// Lazy load components
const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Don't render on server
});

// Route-based code splitting (automatic in Next.js)
// Each page is automatically code-split

// Component-level code splitting
const Chart = dynamic(() => import('recharts').then(mod => mod.LineChart), {
  ssr: false
});
```

#### CSS Optimization
```javascript
// next.config.js - CSS in JS optimization
module.exports = {
  swcMinify: true, // Use SWC for faster builds
  
  // Automatic CSS optimization
  optimizeFonts: true,
  
  // Purgecss configuration
  postcss: {
    plugins: [
      require('tailwindcss'),
      require('autoprefixer'),
      // Remove unused CSS
      process.env.NODE_ENV === 'production' && require('@fullhuman/postcss-purgecss')({
        content: [
          './pages/**/*.{js,jsx,ts,tsx}',
          './components/**/*.{js,jsx,ts,tsx}'
        ],
        safelist: ['html', 'body']
      })
    ].filter(Boolean)
  }
};
```

#### JavaScript Bundling Optimization
```typescript
// vite.config.ts (if using Vite)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate heavy dependencies
          recharts: ['recharts'],
          date: ['date-fns'],
          api: ['axios']
        }
      }
    },
    // Optimize bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

#### Caching Strategy
```typescript
// next.config.js
module.exports = {
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute
    pagesBufferLength: 5
  },
  
  // Output cache configuration
  headers: async () => {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400'
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

#### Service Worker Implementation
```typescript
// public/sw.js
const CACHE_NAME = 'smart-grocery-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API calls - network first with cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Static assets - cache first
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
  }
});
```

### 2. Backend Performance Optimization

#### Database Query Optimization
```typescript
// Use pagination for large datasets
const getPurchases = async (userId: string, page: number = 1) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  const purchases = await supabase
    .from('purchases')
    .select(`
      id, 
      product_id, 
      quantity, 
      price, 
      purchase_date,
      products(id, name, category)
    `)
    .eq('user_id', userId)
    .order('purchase_date', { ascending: false })
    .range(offset, offset + limit - 1);

  return purchases;
};

// Use cursor-based pagination for better performance
const getCursor = (item: any) => Buffer.from(item.id).toString('base64');

const getPurchasesWithCursor = async (userId: string, cursor?: string) => {
  let query = supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .order('id')
    .limit(20);

  if (cursor) {
    const decodedId = Buffer.from(cursor, 'base64').toString();
    query = query.gt('id', decodedId);
  }

  const results = await query;
  const nextCursor = results.length === 20 
    ? getCursor(results[results.length - 1]) 
    : null;

  return { results, nextCursor };
};
```

#### Database Indexing Strategy
```sql
-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_purchases_user_date 
ON purchases(user_id, purchase_date DESC);

CREATE INDEX CONCURRENTLY idx_purchases_category 
ON purchases(user_id, category);

CREATE INDEX CONCURRENTLY idx_recommendations_user 
ON recommendations(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_recommendations_expires 
ON recommendations(expires_at) 
WHERE expires_at > NOW();

CREATE INDEX CONCURRENTLY idx_users_email 
ON users(email);

-- Partial index for active recommendations
CREATE INDEX CONCURRENTLY idx_active_recommendations 
ON recommendations(user_id) 
WHERE expires_at > NOW();

-- Composite index for complex queries
CREATE INDEX CONCURRENTLY idx_purchases_analytics 
ON purchases(user_id, category, purchase_date DESC);

-- ANALYZE after creating indexes
ANALYZE purchases;
ANALYZE recommendations;
```

#### Connection Pooling
```typescript
// pgBouncer configuration
// /etc/pgbouncer/pgbouncer.ini

[databases]
smart_grocery = host=localhost port=5432 dbname=smart_grocery

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_file = /etc/pgbouncer/userlist.txt
auth_type = md5
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
max_user_connections = 100
```

#### Batch Operations
```typescript
// Batch insert for bulk operations
const insertPurchases = async (purchases: Purchase[]) => {
  // Split into chunks of 100 to avoid memory issues
  const chunks = [];
  for (let i = 0; i < purchases.length; i += 100) {
    chunks.push(purchases.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    await supabase
      .from('purchases')
      .insert(chunk);
  }
};

// Batch update with less query overhead
const updateRecommendationScores = async (updates: Array<{id: string, score: number}>) => {
  const { data, error } = await supabase
    .rpc('batch_update_recommendations', {
      ids: updates.map(u => u.id),
      scores: updates.map(u => u.score)
    });
};

// PostgreSQL function for batch update
CREATE OR REPLACE FUNCTION batch_update_recommendations(
  ids UUID[],
  scores FLOAT[]
)
RETURNS TABLE(id UUID, updated_at TIMESTAMP) AS $$
UPDATE recommendations
SET confidence_score = scores[idx]
FROM UNNEST(ids) WITH ORDINALITY AS t(id, idx)
WHERE recommendations.id = t.id
RETURNING recommendations.id, recommendations.updated_at;
$$ LANGUAGE SQL;
```

### 3. Caching Strategy

#### Redis Multi-Level Caching
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // Connection pooling
  lazyConnect: true,
  enableOfflineQueue: false
});

// Cache layers
const cacheConfig = {
  // User preferences - 24 hours
  userPreferences: { ttl: 86400, prefix: 'user:prefs:' },
  
  // Recommendations - 24 hours (expires with data)
  recommendations: { ttl: 86400, prefix: 'rec:' },
  
  // Store data - 6 hours
  stores: { ttl: 21600, prefix: 'stores:' },
  
  // Health insights - 12 hours
  healthInsights: { ttl: 43200, prefix: 'health:' },
  
  // Analytics - 1 hour
  analytics: { ttl: 3600, prefix: 'analytics:' },
  
  // Search results - 1 hour
  search: { ttl: 3600, prefix: 'search:' }
};

// Get with cache
const getCachedRecommendations = async (userId: string) => {
  const cacheKey = `${cacheConfig.recommendations.prefix}${userId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from DB if not cached
  const recommendations = await fetchRecommendationsFromDB(userId);
  
  // Cache it
  await redis.setex(
    cacheKey,
    cacheConfig.recommendations.ttl,
    JSON.stringify(recommendations)
  );
  
  return recommendations;
};

// Invalidate cache on updates
const updateUserPreferences = async (userId: string, prefs: any) => {
  await supabase
    .from('users')
    .update(prefs)
    .eq('id', userId);
  
  // Invalidate caches
  const cacheKey = `${cacheConfig.userPreferences.prefix}${userId}`;
  await redis.del(cacheKey);
  
  // Also invalidate dependent caches
  await redis.del(`${cacheConfig.recommendations.prefix}${userId}`);
  await redis.del(`${cacheConfig.healthInsights.prefix}${userId}`);
};
```

#### Cache Warming Strategy
```typescript
// Warm cache on startup and periodically
const warmCache = async () => {
  console.log('Starting cache warm...');
  
  // Cache active stores
  const stores = await supabase.from('stores').select('*').eq('active', true);
  for (const store of stores.data) {
    await redis.setex(
      `${cacheConfig.stores.prefix}${store.id}`,
      cacheConfig.stores.ttl,
      JSON.stringify(store)
    );
  }
  
  // Cache popular categories
  const categories = await supabase
    .from('categories')
    .select('*')
    .order('popularity', { ascending: false })
    .limit(50);
  
  await redis.setex(
    'categories:popular',
    86400,
    JSON.stringify(categories.data)
  );
  
  console.log('Cache warm completed');
};

// Schedule cache warming
import cron from 'node-cron';
cron.schedule('0 * * * *', warmCache); // Every hour
```

### 4. API Response Compression
```typescript
import compression from 'compression';

// Enable compression for responses > 1KB
app.use(compression({
  level: 6, // Balance between speed and compression ratio
  threshold: 1024, // Only compress > 1KB
  filter: (req, res) => {
    // Don't compress streaming responses
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Brotli compression (better than gzip)
import { createBrotliCompress } from 'zlib';
app.use((req, res, next) => {
  if (req.headers['accept-encoding']?.includes('br')) {
    res.setHeader('Content-Encoding', 'br');
    res.write = createBrotliCompress().write;
  }
  next();
});
```

### 5. Asynchronous Job Processing

#### Bull Queue for Heavy Operations
```typescript
import Queue from 'bull';

// Create queues
const recommendationQueue = new Queue('recommendations', process.env.REDIS_URL);
const analyticsQueue = new Queue('analytics', process.env.REDIS_URL);
const emailQueue = new Queue('emails', process.env.REDIS_URL);

// Process recommendation generation
recommendationQueue.process(async (job) => {
  const { userId } = job.data;
  const recommendations = await generatePersonalizedRecommendations(userId);
  
  // Update cache
  await redis.setex(
    `${cacheConfig.recommendations.prefix}${userId}`,
    cacheConfig.recommendations.ttl,
    JSON.stringify(recommendations)
  );
  
  return { success: true };
});

// Queue job from endpoint
app.post('/api/recommendations/generate', async (req, res) => {
  const { userId } = req.body;
  
  // Queue job (non-blocking)
  recommendationQueue.add(
    { userId },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true
    }
  );
  
  res.json({ queued: true });
});

// Monitor queue
recommendationQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

recommendationQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});
```

### 6. Content Delivery Network (CDN)

#### Cloudflare Configuration
```javascript
// cloudflare.conf
[caching]
browser_cache_ttl = 1800 # 30 minutes
cache_everything = false
cache_on_cookie = "session_id"

[minification]
minify_css = true
minify_js = true
minify_html = true

[performance]
rocket_loader = true
auto_minify = true
http2_push = true
brotli = true

[security]
ssl_setting = "Full (Strict)"
always_use_https = true
```

#### Image Optimization CDN
```typescript
// Use Cloudflare Image Optimization
const optimizedImageUrl = (url: string) => {
  return `https://cdn.example.com/cdn-cgi/image/format=auto,quality=80,width=800/${url}`;
};

// In React components
<Image
  src={optimizedImageUrl('/products/item.jpg')}
  alt="Product"
  width={400}
  height={300}
/>
```

---

## 🏗️ Backend Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────┐
│     API Layer (Express Routes)      │
├─────────────────────────────────────┤
│   Middleware (Auth, Validation)     │
├─────────────────────────────────────┤
│   Controller Layer (Request Handler)│
├─────────────────────────────────────┤
│   Service Layer (Business Logic)    │
├─────────────────────────────────────┤
│   Data Layer (Repository Pattern)   │
├─────────────────────────────────────┤
│   Database (Supabase)               │
└─────────────────────────────────────┘
```

### Directory Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── recommendationController.ts
│   │   └── analyticsController.ts
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── recommendationService.ts
│   │   ├── analyticsService.ts
│   │   └── cacheService.ts
│   │
│   ├── repositories/
│   │   ├── userRepository.ts
│   │   ├── productRepository.ts
│   │   ├── purchaseRepository.ts
│   │   └── recommendationRepository.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   │
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── recommendations.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── admin.ts
│   │
│   ├── utils/
│   │   ├── db.ts
│   │   ├── cache.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── types/
│   │   ├── models.ts
│   │   ├── requests.ts
│   │   └── responses.ts
│   │
│   ├── config/
│   │   └── index.ts
│   │
│   └── index.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

### Repository Pattern Implementation
```typescript
// repositories/userRepository.ts
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return data;
  }

  async create(user: CreateUserDTO): Promise<User> {
    const { data } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    return data;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return data;
  }
}

// services/authService.ts
export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    // Validation
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Invalid email');
    }

    // Check if user exists
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.userRepository.create({
      email,
      password_hash: passwordHash,
      full_name: name
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { ...user, ...tokens };
  }

  private generateTokens(user: User) {
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}

// controllers/authController.ts
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signup(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      const user = await this.authService.signup(email, password, name);
      
      res.cookie('refreshToken', user.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });
      
      res.status(201).json({
        user: sanitizeUser(user),
        accessToken: user.accessToken
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

---

This architecture ensures optimal performance, maintainability, and scalability for the Smart Grocery AI platform.
