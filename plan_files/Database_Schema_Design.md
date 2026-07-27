# Smart Grocery AI - Database Schema & Design Guide

## 📊 Complete Database Schema

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Authentication
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Profile
  full_name VARCHAR(255),
  avatar_url TEXT,
  
  -- Preferences
  budget_preference DECIMAL(10, 2),
  health_preference VARCHAR(50), -- 'health-conscious', 'balanced', 'relaxed'
  family_size INTEGER DEFAULT 1,
  dietary_restrictions TEXT[], -- ['vegetarian', 'vegan', 'gluten-free']
  preferred_store_id UUID REFERENCES stores(id),
  
  -- Account Management
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'moderator'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role) WHERE status = 'active';
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

#### 2. Stores Table
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  
  -- Location
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Business Info
  delivery_fee DECIMAL(10, 2),
  average_delivery_time INTEGER, -- in minutes
  min_order_value DECIMAL(10, 2),
  
  -- Rating
  average_rating DECIMAL(3, 2),
  total_ratings INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_active ON stores(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_stores_location ON stores USING GIST(
  ll_to_earth(latitude, longitude)
); -- For geographic queries
```

#### 3. Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  barcode VARCHAR(50) UNIQUE,
  
  -- Categorization
  category_id UUID NOT NULL REFERENCES categories(id),
  subcategory VARCHAR(100),
  tags TEXT[],
  
  -- Pricing & Availability
  base_price DECIMAL(10, 2) NOT NULL,
  unit_of_measure VARCHAR(50), -- 'kg', 'liter', 'piece'
  stock_quantity INTEGER,
  
  -- Health Info
  health_score DECIMAL(3, 2), -- 0-10 scale
  calories_per_100g DECIMAL(7, 2),
  protein_per_100g DECIMAL(7, 2),
  carbs_per_100g DECIMAL(7, 2),
  fat_per_100g DECIMAL(7, 2),
  dietary_labels TEXT[], -- ['organic', 'vegan', 'gluten-free']
  
  -- Images
  image_url TEXT,
  image_urls TEXT[],
  
  -- Ratings
  average_rating DECIMAL(3, 2),
  total_ratings INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products USING GIN(name gin_trgm_ops);
CREATE INDEX idx_products_health_score ON products(health_score DESC);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
```

#### 4. Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  color_code VARCHAR(7),
  
  -- Hierarchy
  parent_category_id UUID REFERENCES categories(id),
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_category_id);
CREATE INDEX idx_categories_name ON categories(name);
```

#### 5. Purchases Table
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  
  -- Purchase Details
  quantity DECIMAL(10, 3) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Categorization
  category VARCHAR(100),
  
  -- Health Context
  health_score DECIMAL(3, 2),
  is_healthy_choice BOOLEAN,
  
  -- Timeline
  purchase_date TIMESTAMP NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_purchases_user_date ON purchases(user_id, purchase_date DESC);
CREATE INDEX idx_purchases_user_category ON purchases(user_id, category);
CREATE INDEX idx_purchases_product ON purchases(product_id);
CREATE INDEX idx_purchases_store ON purchases(store_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date DESC);
CREATE INDEX idx_purchases_health ON purchases(user_id, health_score) 
  WHERE is_healthy_choice = TRUE;
```

#### 6. Recommendations Table
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  -- Recommendation Type
  reason_type VARCHAR(50) NOT NULL, -- 'frequency', 'health', 'budget', 'trending', 'alternative'
  reason_details JSONB, -- Store detailed reason info
  
  -- Scoring
  confidence_score DECIMAL(3, 2), -- 0-1 scale
  relevance_score DECIMAL(3, 2),
  
  -- Expiration
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  -- Status
  is_viewed BOOLEAN DEFAULT FALSE,
  is_clicked BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMP,
  clicked_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB
);

-- Indexes for real-time queries
CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_recommendations_user_active ON recommendations(user_id) 
  WHERE expires_at > NOW();
CREATE INDEX idx_recommendations_expires ON recommendations(expires_at) 
  WHERE expires_at > NOW();
CREATE INDEX idx_recommendations_confidence ON recommendations(user_id, confidence_score DESC);
```

#### 7. User Behavior Analytics Table
```sql
CREATE TABLE user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Behavior Metrics
  metric_type VARCHAR(50) NOT NULL, -- 'purchase_frequency', 'avg_spend', 'category_preference'
  metric_value DECIMAL(10, 2),
  
  -- Context
  category VARCHAR(100),
  time_window VARCHAR(20), -- 'daily', 'weekly', 'monthly'
  
  -- Timeline
  metric_date DATE,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_behavior_user_type ON user_behavior(user_id, metric_type);
CREATE INDEX idx_behavior_date ON user_behavior(metric_date DESC);
```

#### 8. Store Prices Table
```sql
CREATE TABLE store_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  product_id UUID NOT NULL REFERENCES products(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  
  -- Price Info
  current_price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2),
  
  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER,
  
  -- Timeline
  price_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, store_id)
);

CREATE INDEX idx_store_prices_product ON store_prices(product_id);
CREATE INDEX idx_store_prices_store ON store_prices(store_id);
CREATE INDEX idx_store_prices_updated ON store_prices(price_updated_at DESC);
```

#### 9. Cart Table
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  
  -- Quantities
  quantity DECIMAL(10, 3) NOT NULL,
  
  -- Pricing
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  
  -- Timeline
  added_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- Cart expires after 7 days
);

CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_expires ON cart_items(expires_at) WHERE expires_at > NOW();
```

#### 10. Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  
  -- Order Details
  status VARCHAR(50) DEFAULT 'pending', 
  -- 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Timeline
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  
  -- Metadata
  delivery_address JSONB,
  notes TEXT
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

#### 11. Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Info
  user_id UUID REFERENCES users(id),
  
  -- Action Details
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  
  -- Request Info
  ip_address INET,
  user_agent TEXT,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed'
  error_message TEXT,
  
  -- Timeline
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

---

## 🔗 Relationships & Foreign Keys

```
users
├── FK: preferred_store_id → stores(id)
├── ← purchases(user_id) [1:many]
├── ← recommendations(user_id) [1:many]
├── ← cart_items(user_id) [1:many]
├── ← orders(user_id) [1:many]
├── ← user_behavior(user_id) [1:many]
└── ← audit_logs(user_id) [1:many]

products
├── FK: category_id → categories(id)
├── ← purchases(product_id) [1:many]
├── ← recommendations(product_id) [1:many]
├── ← store_prices(product_id) [1:many]
└── ← cart_items(product_id) [1:many]

stores
├── ← purchases(store_id) [1:many]
├── ← store_prices(store_id) [1:many]
├── ← cart_items(store_id) [1:many]
└── ← orders(store_id) [1:many]

categories
├── ← products(category_id) [1:many]
└── Self-referencing: parent_category_id → categories(id)
```

---

## 📈 Views for Analytics

### User Spending Summary
```sql
CREATE VIEW user_spending_summary AS
SELECT 
  u.id,
  u.email,
  COUNT(DISTINCT p.id) as total_purchases,
  SUM(p.total_price) as total_spent,
  AVG(p.total_price) as avg_purchase_amount,
  MAX(p.purchase_date) as last_purchase_date,
  COUNT(DISTINCT DATE(p.purchase_date)) as purchase_days,
  COUNT(DISTINCT p.category) as categories_shopped
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
GROUP BY u.id, u.email;
```

### Product Performance
```sql
CREATE VIEW product_performance AS
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT pr.user_id) as recommended_to_users,
  COUNT(DISTINCT pu.user_id) as purchased_by_users,
  COUNT(pu.id) as total_purchases,
  AVG(p.health_score) as avg_health_score,
  p.average_rating,
  SUM(pu.total_price) as total_revenue
FROM products p
LEFT JOIN recommendations pr ON p.id = pr.product_id
LEFT JOIN purchases pu ON p.id = pu.product_id
GROUP BY p.id, p.name, p.health_score, p.average_rating;
```

### Store Performance
```sql
CREATE VIEW store_performance AS
SELECT 
  s.id,
  s.name,
  COUNT(DISTINCT o.user_id) as unique_customers,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as total_revenue,
  AVG(o.total_amount) as avg_order_value,
  COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
  ROUND(100.0 * COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) / COUNT(o.id), 2) as delivery_success_rate
FROM stores s
LEFT JOIN orders o ON s.id = o.store_id
GROUP BY s.id, s.name;
```

---

## 🔐 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile
CREATE POLICY user_profile_policy ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY user_update_policy ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can see their own purchases
CREATE POLICY user_purchases_policy ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Users can see their own recommendations
CREATE POLICY user_recommendations_policy ON recommendations
  FOR SELECT USING (auth.uid() = user_id);

-- Admins bypass RLS for analytics
CREATE POLICY admin_bypass ON users
  FOR ALL USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

---

## 📝 Database Triggers

### Auto-update Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER products_update_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply to all tables that have updated_at
```

### Update Product Ratings
```sql
CREATE OR REPLACE FUNCTION recalculate_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET average_rating = (
    SELECT AVG(rating) FROM purchase_ratings 
    WHERE product_id = NEW.product_id
  ),
  total_ratings = (
    SELECT COUNT(*) FROM purchase_ratings 
    WHERE product_id = NEW.product_id
  )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rating_update_trigger
AFTER INSERT OR UPDATE ON purchase_ratings
FOR EACH ROW
EXECUTE FUNCTION recalculate_product_rating();
```

---

## 💾 Backup & Recovery Strategy

### Automated Backups
```sql
-- Supabase handles automated backups:
-- - Daily backups
-- - Point-in-time recovery (7 days)
-- - WAL archiving for longer recovery

-- Create manual backup
pg_dump -h <host> -U <user> -d smart_grocery > backup_$(date +%Y%m%d).sql

-- Restore from backup
psql -h <host> -U <user> -d smart_grocery < backup_20240115.sql
```

---

## 🔍 Query Optimization Examples

### Efficient User Analytics Query
```sql
-- BAD: Multiple joins, no pagination
SELECT u.*, p.*, r.*
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
LEFT JOIN recommendations r ON u.id = r.user_id
ORDER BY p.purchase_date DESC;

-- GOOD: Specific fields, indexed columns, pagination
SELECT 
  u.id,
  u.email,
  u.created_at,
  COUNT(DISTINCT p.id) as purchase_count,
  SUM(p.total_price) as total_spent,
  MAX(p.purchase_date) as last_purchase
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 100 OFFSET 0;
```

---

This comprehensive database schema ensures data integrity, performance, and scalability for the Smart Grocery AI platform.
