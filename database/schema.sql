-- Smart Grocery AI - Complete Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  budget_preference DECIMAL(10, 2),
  health_preference VARCHAR(50), 
  family_size INTEGER DEFAULT 1,
  dietary_restrictions TEXT[], 
  preferred_store_id UUID,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  role VARCHAR(20) DEFAULT 'user', 
  status VARCHAR(20) DEFAULT 'active', 
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE status = 'active';

-- 2. Stores Table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  delivery_fee DECIMAL(10, 2),
  average_delivery_time INTEGER, 
  min_order_value DECIMAL(10, 2),
  average_rating DECIMAL(3, 2),
  total_ratings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fix the user foreign key now that stores exist
ALTER TABLE users ADD CONSTRAINT fk_preferred_store FOREIGN KEY (preferred_store_id) REFERENCES stores(id);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  color_code VARCHAR(7),
  parent_category_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Products Table (recreation with full schema if not exists)
CREATE TABLE IF NOT EXISTS products_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  barcode VARCHAR(50) UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id),
  subcategory VARCHAR(100),
  tags TEXT[],
  base_price DECIMAL(10, 2) NOT NULL,
  unit_of_measure VARCHAR(50), 
  stock_quantity INTEGER,
  health_score DECIMAL(3, 2), 
  calories_per_100g DECIMAL(7, 2),
  protein_per_100g DECIMAL(7, 2),
  carbs_per_100g DECIMAL(7, 2),
  fat_per_100g DECIMAL(7, 2),
  dietary_labels TEXT[],
  image_url TEXT,
  image_urls TEXT[],
  average_rating DECIMAL(3, 2),
  total_ratings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products_v2(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  quantity DECIMAL(10, 3) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  category VARCHAR(100),
  health_score DECIMAL(3, 2),
  is_healthy_choice BOOLEAN,
  purchase_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products_v2(id),
  reason_type VARCHAR(50) NOT NULL, 
  reason_details JSONB, 
  confidence_score DECIMAL(3, 2), 
  relevance_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_viewed BOOLEAN DEFAULT FALSE,
  is_clicked BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMP,
  clicked_at TIMESTAMP,
  metadata JSONB
);

-- 7. User Behavior Analytics Table
CREATE TABLE IF NOT EXISTS user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, 
  metric_value DECIMAL(10, 2),
  category VARCHAR(100),
  time_window VARCHAR(20), 
  metric_date DATE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Store Prices Table
CREATE TABLE IF NOT EXISTS store_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products_v2(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  current_price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2),
  is_available BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER,
  price_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);

-- 9. Cart Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products_v2(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  quantity DECIMAL(10, 3) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP 
);

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS orders_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  status VARCHAR(50) DEFAULT 'pending', 
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  delivery_address JSONB,
  notes TEXT
);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  old_values JSONB,
  new_values JSONB,
  status VARCHAR(20) DEFAULT 'success', 
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-update Timestamps Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_trigger BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_update_trigger BEFORE UPDATE ON products_v2 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
