import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigrations() {
  console.log('Running database migrations...');
  
  // 1. Providers Table
  await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  });

  // 2. Provider Inventory Table
  await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS provider_inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        price DECIMAL(10, 2) NOT NULL,
        UNIQUE(provider_id, product_id)
      );
    `
  });

  // 3. Cart Items Table
  await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id, provider_id)
      );
    `
  });

  // 4. Update Order Items Table
  await supabase.rpc('exec_sql', {
    query: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);`
  });
  await supabase.rpc('exec_sql', {
    query: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id);`
  });

  // 6. Checkout RPC
  const rpcQuery = `
    CREATE OR REPLACE FUNCTION checkout_transaction(
      p_user_id UUID,
      p_cart_items JSONB,
      p_total_amount DECIMAL,
      p_subtotal DECIMAL,
      p_tax DECIMAL,
      p_delivery_fee DECIMAL,
      p_delivery_address TEXT,
      p_customer_name TEXT,
      p_customer_email TEXT,
      p_customer_phone TEXT,
      p_payment_method TEXT
    ) RETURNS JSONB AS $$
    DECLARE
      v_order_id UUID;
      v_item RECORD;
      v_stock INTEGER;
      v_order_number TEXT;
    BEGIN
      -- Generate order number
      v_order_number := 'ORD-' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS');
      
      -- Insert Order
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        delivery_address, total_amount, subtotal, tax, delivery_fee, payment_method, status
      ) VALUES (
        v_order_number, p_user_id, p_customer_name, p_customer_email, p_customer_phone,
        p_delivery_address, p_total_amount, p_subtotal, p_tax, p_delivery_fee, p_payment_method, 'confirmed'
      ) RETURNING id INTO v_order_id;
      
      -- Loop through cart items and verify stock, deduct, insert order items
      FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(
        product_id UUID, provider_id UUID, quantity INTEGER, price DECIMAL, product_name TEXT, product_image TEXT
      )
      LOOP
        -- Check and lock stock
        SELECT stock_quantity INTO v_stock FROM provider_inventory 
        WHERE product_id = v_item.product_id AND provider_id = v_item.provider_id
        FOR UPDATE;
        
        IF v_stock IS NULL OR v_stock < v_item.quantity THEN
          RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_name;
        END IF;
        
        -- Deduct stock
        UPDATE provider_inventory 
        SET stock_quantity = stock_quantity - v_item.quantity
        WHERE product_id = v_item.product_id AND provider_id = v_item.provider_id;
        
        -- Insert order item
        INSERT INTO order_items (
          order_id, product_id, provider_id, product_name, product_image, quantity, unit_price, total_price
        ) VALUES (
          v_order_id, v_item.product_id, v_item.provider_id, v_item.product_name, v_item.product_image,
          v_item.quantity, v_item.price, v_item.price * v_item.quantity
        );
      END LOOP;
      
      -- Clear cart
      DELETE FROM cart_items WHERE user_id = p_user_id;
      
      RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number);
    EXCEPTION
      WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  await supabase.rpc('exec_sql', { query: rpcQuery });

  console.log('Migrations complete.');

  // Create Admin User
  console.log('Creating Admin User...');
  const { data: adminAuth, error: authError } = await supabase.auth.admin.createUser({
    email: 'sai17042004@gmail.com',
    password: 'admin@2005g',
    email_confirm: true,
    user_metadata: { role: 'admin', full_name: 'Super Admin' }
  });

  if (authError) {
    if (authError.message.includes('User already registered') || authError.message.includes('Email already exists')) {
      console.log('Admin user already exists. Updating metadata to ensure admin role...');
      
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData.users.find(u => u.email === 'sai17042004@gmail.com');
      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: { role: 'admin', full_name: 'Super Admin' }
        });
        console.log('Admin user metadata updated.');
      }
    } else {
      console.error('Failed to create admin:', authError);
    }
  } else {
    console.log('Admin user created successfully.');
  }

  // Create default provider if none exists, and migrate existing stock
  const { data: providers } = await supabase.from('providers').select('id');
  if (!providers || providers.length === 0) {
    console.log('Creating default provider...');
    const { data: newProvider } = await supabase.from('providers').insert({
      name: 'Smart Grocery (Tech Park)',
      contact_email: 'sai17042004@gmail.com'
    }).select('id').single();

    if (newProvider) {
      console.log('Migrating existing product stock to provider_inventory...');
      const { data: allProducts } = await supabase.from('products').select('id, stock_quantity, price');
      if (allProducts && allProducts.length > 0) {
        const inventoryToInsert = allProducts.map(p => ({
          provider_id: newProvider.id,
          product_id: p.id,
          stock_quantity: p.stock_quantity || 0,
          price: p.price
        }));
        await supabase.from('provider_inventory').insert(inventoryToInsert);
        console.log(`Migrated ${inventoryToInsert.length} products into provider inventory.`);
      }
    }
  }
}

runMigrations();
