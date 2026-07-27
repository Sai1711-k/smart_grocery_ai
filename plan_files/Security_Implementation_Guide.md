# Smart Grocery AI - Security Implementation Guide

## 🔐 Complete Security Architecture

### 1. Authentication Layer (JWT + Session Management)

#### Implementation Strategy
```typescript
// Backend Authentication Flow
POST /api/auth/signup
├── Email validation
├── Password strength validation
├── Hash password with bcrypt (rounds: 12)
├── Create user record in Supabase
├── Generate JWT tokens
│   ├── Access Token (15 min expiry)
│   └── Refresh Token (7 days expiry, HttpOnly Cookie)
└── Return user profile

POST /api/auth/login
├── Validate credentials
├── Check rate limiting (5 attempts/15 min)
├── Generate JWT tokens
└── Set HttpOnly cookie with refresh token

GET /api/auth/refresh
├── Validate refresh token from HttpOnly cookie
├── Generate new access token
└── Extend refresh token expiry
```

#### Token Configuration
```javascript
// .env configuration
JWT_ACCESS_SECRET=<64-char random string>
JWT_REFRESH_SECRET=<64-char random string>
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

#### JWT Payload Structure
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "user|admin",
  "iat": 1234567890,
  "exp": 1234568890,
  "jti": "unique-jwt-id-for-revocation"
}
```

### 2. Database Security (Supabase + PostgreSQL)

#### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can only see their own purchases
CREATE POLICY "Users can view own purchases"
ON purchases FOR SELECT
USING (auth.uid() = user_id);

-- Users can only view their own recommendations
CREATE POLICY "Users can view own recommendations"
ON recommendations FOR SELECT
USING (auth.uid() = user_id);

-- Admins have elevated permissions
CREATE POLICY "Admins can view all data"
ON users FOR SELECT
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
```

#### Database Encryption
```sql
-- Sensitive fields encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store encrypted data
ALTER TABLE users 
ADD COLUMN encrypted_ssn bytea;

-- Function to encrypt PII
CREATE OR REPLACE FUNCTION encrypt_pii(data text)
RETURNS bytea AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;

-- Create function to decrypt (admin only)
CREATE OR REPLACE FUNCTION decrypt_pii(data bytea)
RETURNS text AS $$
BEGIN
  RETURN pgp_sym_decrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

#### Connection Security
```javascript
// Backend connection configuration
const connectionString = process.env.SUPABASE_DB_URL;

const pool = new Pool({
  connectionString,
  max: 20, // Connection pooling
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: true, // Enforce SSL
    ca: process.env.DB_SSL_CA
  }
});
```

### 3. API Security

#### Request Validation & Sanitization
```typescript
// Middleware for input validation
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase().trim(),
  password: z.string().min(8).max(128)
});

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
};

// Use middleware
app.post('/api/auth/login', 
  validateRequest(loginSchema),
  loginController
);
```

#### Rate Limiting
```typescript
import RedisStore from 'rate-limit-redis';
import rateLimit from 'express-rate-limit';

const redis = new Redis(process.env.REDIS_URL);

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts',
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiting
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  skip: (req) => req.user?.role === 'admin'
});

app.use('/api/', apiLimiter);
app.post('/api/auth/login', authLimiter, loginController);
```

#### CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

#### CSRF Protection
```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

// GET request returns CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ token: req.csrfToken() });
});

// POST/PUT/DELETE require valid CSRF token
app.post('/api/cart/add', csrfProtection, requireAuth, addToCart);
```

#### Security Headers
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_URL],
      fontSrc: ["'self'", "fonts.googleapis.com"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### 4. Frontend Security

#### XSS Prevention
```typescript
// React escaping (automatic in JSX)
const userInput = sanitizeHtml(untrustedInput, {
  allowedTags: [],
  allowedAttributes: {}
});

// Safe rendering
<div>{sanitizedInput}</div>

// Avoid dangerouslySetInnerHTML
// ❌ NOT SECURE:
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SECURE:
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

#### Secure Token Storage
```typescript
// Store JWT in HttpOnly cookie (backend sets)
// Access token can be in memory

// Frontend retrieval
const getAccessToken = () => {
  // Token sent via secure cookie automatically
  // Don't store in localStorage
};

// For API calls
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true // Send cookies
});

// Add authorization header for non-cookie endpoints if needed
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken'); // Temporary storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Content Security Policy (CSP)
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      img-src 'self' data: https:;
      font-src 'self' fonts.gstatic.com;
      connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL};
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self'
    `.replace(/\s+/g, ' ')
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

### 5. Environment Variables Security

#### Secure Configuration
```bash
# .env.example (safe to commit)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=Smart Grocery AI

# .env.local (NEVER commit)
JWT_ACCESS_SECRET=<random-string>
JWT_REFRESH_SECRET=<random-string>
SUPABASE_DB_PASSWORD=<strong-password>
ENCRYPTION_KEY=<64-char-random-string>
REDIS_URL=<secure-url>
```

#### Secret Rotation Strategy
```bash
# Automated secret rotation every 90 days
# Using CI/CD pipeline:

1. Generate new secret
2. Update in production environment
3. Keep old secret for 24h (grace period)
4. Remove old secret
5. Log rotation event
```

### 6. API Request/Response Security

#### Request Signing (for critical operations)
```typescript
import crypto from 'crypto';

// Sign sensitive requests
const signRequest = (method: string, path: string, body: any) => {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const message = `${method}${path}${timestamp}${nonce}${JSON.stringify(body)}`;
  const signature = crypto
    .createHmac('sha256', process.env.REQUEST_SIGN_KEY)
    .update(message)
    .digest('hex');

  return {
    'X-Request-Signature': signature,
    'X-Request-Timestamp': timestamp,
    'X-Request-Nonce': nonce
  };
};

// Verify on backend
const verifySignature = (req: Request) => {
  const signature = req.headers['x-request-signature'];
  const timestamp = req.headers['x-request-timestamp'];
  const nonce = req.headers['x-request-nonce'];

  // Check timestamp is recent (within 5 minutes)
  if (Math.abs(Date.now() - parseInt(timestamp)) > 5 * 60 * 1000) {
    throw new Error('Request expired');
  }

  // Verify signature
  const message = `${req.method}${req.path}${timestamp}${nonce}${JSON.stringify(req.body)}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.REQUEST_SIGN_KEY)
    .update(message)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }
};
```

#### Response Sanitization
```typescript
// Remove sensitive data from responses
const sanitizeUserResponse = (user: User) => {
  const { password_hash, reset_token, ...safe } = user;
  return safe;
};

// Apply to all endpoints
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (data.user) {
      data.user = sanitizeUserResponse(data.user);
    }
    return originalJson.call(this, data);
  };
  next();
});
```

### 7. Audit Logging

#### Comprehensive Audit Trail
```typescript
// Audit log middleware
const auditLog = async (req: Request, user: User, action: string, details: any) => {
  await supabase
    .from('audit_logs')
    .insert({
      user_id: user.id,
      action,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
      status: 'success'
    });
};

// Log sensitive operations
app.put('/api/users/:id', requireAuth, async (req, res) => {
  try {
    const result = await updateUser(req.params.id, req.body);
    
    await auditLog(req, req.user, 'UPDATE_USER', {
      target_user: req.params.id,
      fields_modified: Object.keys(req.body)
    });
    
    res.json(result);
  } catch (error) {
    await auditLog(req, req.user, 'UPDATE_USER_FAILED', { error: error.message });
    res.status(500).json({ error: 'Failed to update user' });
  }
});
```

### 8. Dependency Security

#### Automated Scanning
```bash
# Check for vulnerabilities
npm audit

# Use Snyk for automated scanning
snyk test
snyk monitor

# Keep dependencies updated
npm update
npm outdated

# Lockfile verification
npm ci --frozen-lockfile
```

#### CI/CD Security
```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Dependency Check
        run: npm audit --production
      
      - name: SAST with ESLint Security
        run: npm run lint:security
      
      - name: Snyk Scan
        run: snyk test
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: License Check
        run: npm run license:check
```

---

## 🔍 Security Testing

### Penetration Testing Checklist
- [ ] SQL Injection attempts
- [ ] XSS payload injection
- [ ] CSRF attacks
- [ ] Session hijacking
- [ ] Brute force attacks
- [ ] Rate limiting bypass
- [ ] Authentication bypass
- [ ] Authorization bypass
- [ ] Sensitive data exposure
- [ ] Insecure deserialization

### Tools to Use
- **OWASP ZAP** - API security scanning
- **Burp Suite** - Web application security testing
- **npm audit** - Dependency vulnerability scanning
- **Snyk** - Continuous vulnerability monitoring
- **SonarQube** - Code quality and security

---

## 🚨 Incident Response Plan

### Data Breach Response
```
1. Detect & Contain (< 1 hour)
   ├── Isolate affected systems
   ├── Revoke compromised tokens
   └── Enable emergency mode

2. Assess Damage (< 4 hours)
   ├── Determine data exposed
   ├── Identify affected users
   └── Preserve evidence

3. Notify Users (< 72 hours)
   ├── Send security alerts
   ├── Provide remediation steps
   └── Offer free credit monitoring

4. Post-Incident (Ongoing)
   ├── Root cause analysis
   ├── Implement fixes
   └── Update security policies
```

---

## 📋 Security Checklist for Deployment

- [ ] All secrets in environment variables
- [ ] HTTPS/TLS enabled
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly restricted
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention implemented
- [ ] CSRF protection enabled
- [ ] Authentication tokens properly configured
- [ ] Password hashing with bcrypt
- [ ] Audit logging enabled
- [ ] Database backups automated
- [ ] Monitoring and alerts configured
- [ ] Security team access validated
- [ ] Penetration testing completed
- [ ] Compliance requirements met (GDPR, etc.)
- [ ] Incident response plan documented

---

This security implementation ensures the Smart Grocery AI platform maintains enterprise-grade security standards while protecting user data and system integrity.
