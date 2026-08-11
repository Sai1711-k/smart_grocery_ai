// API route: /api/seed — Seeds the Supabase database with mock data
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST() {
  try {
    // =============================================
    // 1. Create tables if they don't exist
    // =============================================

    // Products table
    await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          category VARCHAR(100) NOT NULL,
          subcategory VARCHAR(100),
          price DECIMAL(10, 2) NOT NULL,
          unit VARCHAR(50),
          health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
          image_url TEXT,
          stock_quantity INTEGER DEFAULT 50,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });

    // Migration columns
    await supabaseAdmin.rpc('exec_sql', {
      query: `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;`
    });
    await supabaseAdmin.rpc('exec_sql', {
      query: `ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 50;`
    });

    // Orders table
    await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_number VARCHAR(50) UNIQUE NOT NULL,
          user_id UUID,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255),
          customer_phone VARCHAR(20),
          delivery_address TEXT,
          total_amount DECIMAL(10, 2) NOT NULL,
          subtotal DECIMAL(10, 2) NOT NULL,
          tax DECIMAL(10, 2) DEFAULT 0,
          delivery_fee DECIMAL(10, 2) DEFAULT 40,
          payment_method VARCHAR(100),
          status VARCHAR(50) DEFAULT 'pending' CHECK (
            status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
          ),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          delivered_at TIMESTAMP
        );
      `,
    });

    await supabaseAdmin.rpc('exec_sql', {
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID;`
    });

    // Order items table
    await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS order_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_name VARCHAR(255) NOT NULL,
          product_image TEXT,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10, 2) NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL
        );
      `,
    });

    await supabaseAdmin.rpc('exec_sql', {
      query: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image TEXT;`
    });

    // =============================================
    // 2. Seed Products (36 items, 7 categories)
    // =============================================
    const products = [
      // ---- VEGETABLES (6) ----
      { name: 'Spinach 500g', description: 'Fresh organic baby spinach, perfect for salads and smoothies.', category: 'Vegetables', price: 40, unit: '500g', health_score: 95, stock_quantity: 30, image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80' },
      { name: 'Tomatoes 1kg', description: 'Fresh, juicy vine-ripened red tomatoes.', category: 'Vegetables', price: 35, unit: 'kg', health_score: 88, stock_quantity: 0, image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' },
      { name: 'Broccoli 500g', description: 'Crunchy green broccoli florets, nutrient-dense superfood.', category: 'Vegetables', price: 60, unit: '500g', health_score: 96, stock_quantity: 18, image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500&q=80' },
      { name: 'Carrots 1kg', description: 'Sweet and crunchy orange carrots, great for snacking.', category: 'Vegetables', price: 30, unit: 'kg', health_score: 90, stock_quantity: 45, image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80' },
      { name: 'Bell Peppers 500g', description: 'Colorful mix of red, yellow, and green bell peppers.', category: 'Vegetables', price: 70, unit: '500g', health_score: 87, stock_quantity: 3, image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&q=80' },
      { name: 'Onions 1kg', description: 'Fresh red onions, essential for every kitchen.', category: 'Vegetables', price: 25, unit: 'kg', health_score: 78, stock_quantity: 60, image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80' },

      // ---- FRUITS (6) ----
      { name: 'Bananas 1kg', description: 'Fresh, naturally sweet ripe bananas.', category: 'Fruits', price: 55, unit: 'kg', health_score: 80, stock_quantity: 40, image_url: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=500&q=80' },
      { name: 'Apples 1kg', description: 'Crispy red Fuji apples, sweet and juicy.', category: 'Fruits', price: 120, unit: 'kg', health_score: 85, stock_quantity: 0, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&q=80' },
      { name: 'Mangoes 1kg', description: 'Premium Alphonso mangoes, king of fruits.', category: 'Fruits', price: 200, unit: 'kg', health_score: 75, stock_quantity: 5, image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&q=80' },
      { name: 'Oranges 1kg', description: 'Juicy Nagpur oranges, rich in Vitamin C.', category: 'Fruits', price: 80, unit: 'kg', health_score: 88, stock_quantity: 25, image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&q=80' },
      { name: 'Strawberries 250g', description: 'Fresh red strawberries, perfect for desserts.', category: 'Fruits', price: 150, unit: '250g', health_score: 82, stock_quantity: 2, image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&q=80' },
      { name: 'Grapes 500g', description: 'Seedless green grapes, sweet and refreshing.', category: 'Fruits', price: 90, unit: '500g', health_score: 79, stock_quantity: 20, image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&q=80' },

      // ---- DAIRY (5) ----
      { name: 'Organic Milk 1L', description: 'Fresh organic whole milk from grass-fed cows.', category: 'Dairy', price: 60, unit: 'liter', health_score: 85, stock_quantity: 35, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80' },
      { name: 'Greek Yogurt 400g', description: 'Thick and creamy high-protein Greek yogurt.', category: 'Dairy', price: 120, unit: '400g', health_score: 82, stock_quantity: 15, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80' },
      { name: 'Eggs (12 pack)', description: 'Farm fresh free-range brown eggs.', category: 'Dairy', price: 90, unit: 'dozen', health_score: 86, stock_quantity: 50, image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&q=80' },
      { name: 'Paneer 200g', description: 'Fresh cottage cheese, rich in protein and calcium.', category: 'Dairy', price: 80, unit: '200g', health_score: 80, stock_quantity: 0, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80' },
      { name: 'Butter 500g', description: 'Creamy salted butter, perfect for cooking and toast.', category: 'Dairy', price: 250, unit: '500g', health_score: 60, stock_quantity: 22, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80' },

      // ---- BAKERY (5) ----
      { name: 'Whole Wheat Bread', description: 'Freshly baked whole wheat bread loaf.', category: 'Bakery', price: 45, unit: 'piece', health_score: 75, stock_quantity: 4, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80' },
      { name: 'Croissants (4 pack)', description: 'Buttery, flaky French croissants.', category: 'Bakery', price: 180, unit: 'pack', health_score: 50, stock_quantity: 12, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=500&q=80' },
      { name: 'Blueberry Muffins (6)', description: 'Soft muffins loaded with fresh blueberries.', category: 'Bakery', price: 220, unit: 'pack', health_score: 45, stock_quantity: 8, image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&q=80' },
      { name: 'Bagels (4 pack)', description: 'Chewy New York-style plain bagels.', category: 'Bakery', price: 140, unit: 'pack', health_score: 55, stock_quantity: 0, image_url: 'https://images.unsplash.com/photo-1585445490387-f47934b73b54?w=500&q=80' },
      { name: 'Chocolate Cake Slice', description: 'Rich, moist Belgian chocolate cake.', category: 'Bakery', price: 160, unit: 'piece', health_score: 30, stock_quantity: 6, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80' },

      // ---- MEAT (5) ----
      { name: 'Chicken Breast 500g', description: 'Lean boneless chicken breast, high in protein.', category: 'Meat', price: 250, unit: '500g', health_score: 88, stock_quantity: 20, image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&q=80' },
      { name: 'Salmon Fillet 300g', description: 'Fresh Atlantic salmon, rich in Omega-3.', category: 'Meat', price: 450, unit: '300g', health_score: 92, stock_quantity: 3, image_url: 'https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?w=500&q=80' },
      { name: 'Lamb Chops 500g', description: 'Tender lamb chops, perfect for grilling.', category: 'Meat', price: 550, unit: '500g', health_score: 78, stock_quantity: 10, image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=500&q=80' },
      { name: 'Prawns 500g', description: 'Fresh jumbo prawns, cleaned and deveined.', category: 'Meat', price: 380, unit: '500g', health_score: 85, stock_quantity: 0, image_url: 'https://images.unsplash.com/photo-1565680018093-ebb6e4db5dcd?w=500&q=80' },
      { name: 'Mutton Keema 500g', description: 'Minced mutton, ideal for kebabs and curries.', category: 'Meat', price: 480, unit: '500g', health_score: 75, stock_quantity: 7, image_url: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=500&q=80' },

      // ---- OILS (4) ----
      { name: 'Extra Virgin Olive Oil 500ml', description: 'Cold-pressed premium quality extra virgin olive oil.', category: 'Oils', price: 350, unit: '500ml', health_score: 92, stock_quantity: 15, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80' },
      { name: 'Coconut Oil 500ml', description: 'Pure cold-pressed virgin coconut oil.', category: 'Oils', price: 220, unit: '500ml', health_score: 88, stock_quantity: 25, image_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80' },
      { name: 'Sunflower Oil 1L', description: 'Light and healthy refined sunflower oil.', category: 'Oils', price: 140, unit: 'liter', health_score: 70, stock_quantity: 40, image_url: 'https://images.unsplash.com/photo-1610725663801-1490960e24d7?w=500&q=80' },
      { name: 'Mustard Oil 1L', description: 'Pungent cold-pressed yellow mustard oil.', category: 'Oils', price: 160, unit: 'liter', health_score: 78, stock_quantity: 18, image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80' },

      // ---- GRAINS (5) ----
      { name: 'Brown Rice 1kg', description: 'Healthy whole grain brown rice, rich in fiber.', category: 'Grains', price: 80, unit: 'kg', health_score: 90, stock_quantity: 55, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&q=80' },
      { name: 'Quinoa 500g', description: 'Organic white quinoa, complete protein superfood.', category: 'Grains', price: 280, unit: '500g', health_score: 95, stock_quantity: 10, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&q=80' },
      { name: 'Rolled Oats 1kg', description: 'Whole grain rolled oats for a healthy breakfast.', category: 'Grains', price: 120, unit: 'kg', health_score: 92, stock_quantity: 30, image_url: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=500&q=80' },
      { name: 'Basmati Rice 1kg', description: 'Premium aged long-grain basmati rice.', category: 'Grains', price: 110, unit: 'kg', health_score: 72, stock_quantity: 2, image_url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&q=80' },
      { name: 'Red Lentils 1kg', description: 'Protein-rich masoor dal, cooks quickly.', category: 'Grains', price: 95, unit: 'kg', health_score: 90, stock_quantity: 35, image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&q=80' },
    ];

    // Upsert products
    const { error: productError } = await supabaseAdmin
      .from('products')
      .upsert(products, { onConflict: 'name', ignoreDuplicates: false });

    // =============================================
    // 3. Seed Orders (expanded for analytics)
    // =============================================
    const orders = [
      {
        order_number: 'ORD-2026-9821',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+91 98765 43210',
        delivery_address: '123 Smart Grocery Lane, Tech Park, Bangalore 560001',
        subtotal: 770, tax: 40, delivery_fee: 40, total_amount: 850,
        payment_method: 'Credit Card (ending in 4242)',
        status: 'delivered',
        created_at: '2026-05-01T14:30:00Z',
        delivered_at: '2026-05-02T10:00:00Z',
      },
      {
        order_number: 'ORD-2026-9844',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+91 98765 43210',
        delivery_address: '123 Smart Grocery Lane, Tech Park, Bangalore 560001',
        subtotal: 270, tax: 14, delivery_fee: 40, total_amount: 324,
        payment_method: 'UPI',
        status: 'delivered',
        created_at: '2026-05-05T09:15:00Z',
        delivered_at: '2026-05-06T11:00:00Z',
      },
      {
        order_number: 'ORD-2026-9855',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+91 98765 43210',
        delivery_address: 'Building 4, Cyber City, Tech Park, Bangalore 560002',
        subtotal: 680, tax: 34, delivery_fee: 40, total_amount: 754,
        payment_method: 'Cash on Delivery',
        status: 'delivered',
        created_at: '2026-05-10T10:00:00Z',
        delivered_at: '2026-05-11T09:30:00Z',
      },
      {
        order_number: 'ORD-2026-9860',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+91 98765 43210',
        delivery_address: '123 Smart Grocery Lane, Tech Park, Bangalore 560001',
        subtotal: 505, tax: 25, delivery_fee: 40, total_amount: 570,
        payment_method: 'UPI',
        status: 'delivered',
        created_at: '2026-05-15T08:30:00Z',
        delivered_at: '2026-05-16T10:00:00Z',
      },
      {
        order_number: 'ORD-2026-9870',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+91 98765 43210',
        delivery_address: '123 Smart Grocery Lane, Tech Park, Bangalore 560001',
        subtotal: 920, tax: 46, delivery_fee: 40, total_amount: 1006,
        payment_method: 'Credit Card (ending in 4242)',
        status: 'delivered',
        created_at: '2026-05-20T15:00:00Z',
        delivered_at: '2026-05-21T11:00:00Z',
      },
      {
        order_number: 'ORD-2026-9880',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+91 98765 43210',
        delivery_address: '123 Smart Grocery Lane, Tech Park, Bangalore 560001',
        subtotal: 440, tax: 22, delivery_fee: 40, total_amount: 502,
        payment_method: 'UPI',
        status: 'shipped',
        created_at: '2026-05-25T09:00:00Z',
      },
      {
        order_number: 'ORD-2026-9890',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+91 98765 43210',
        delivery_address: 'Building 4, Cyber City, Tech Park, Bangalore 560002',
        subtotal: 350, tax: 18, delivery_fee: 40, total_amount: 408,
        payment_method: 'Credit Card (ending in 4242)',
        status: 'processing',
        created_at: '2026-05-27T08:30:00Z',
      },
      {
        order_number: 'ORD-2026-9900',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+91 98765 43210',
        delivery_address: '123 Smart Grocery Lane, Tech Park, Bangalore 560001',
        subtotal: 280, tax: 14, delivery_fee: 40, total_amount: 334,
        payment_method: 'UPI',
        status: 'pending',
        created_at: '2026-05-28T15:00:00Z',
      },
    ];

    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .upsert(orders, { onConflict: 'order_number', ignoreDuplicates: false });

    // =============================================
    // 4. Seed Order Items (expanded for analytics)
    // =============================================
    const { data: insertedOrders } = await supabaseAdmin
      .from('orders')
      .select('id, order_number');

    if (insertedOrders) {
      const orderMap: Record<string, string> = {};
      insertedOrders.forEach((o: any) => { orderMap[o.order_number] = o.id; });

      const orderItems = [
        // ORD-9821 (subtotal ~770)
        { order_id: orderMap['ORD-2026-9821'], product_name: 'Organic Milk 1L', quantity: 3, unit_price: 60, total_price: 180 },
        { order_id: orderMap['ORD-2026-9821'], product_name: 'Chicken Breast 500g', quantity: 2, unit_price: 250, total_price: 500 },
        { order_id: orderMap['ORD-2026-9821'], product_name: 'Spinach 500g', quantity: 1, unit_price: 40, total_price: 40 },
        { order_id: orderMap['ORD-2026-9821'], product_name: 'Onions 1kg', quantity: 2, unit_price: 25, total_price: 50 },

        // ORD-9844 (subtotal ~270)
        { order_id: orderMap['ORD-2026-9844'], product_name: 'Brown Rice 1kg', quantity: 1, unit_price: 80, total_price: 80 },
        { order_id: orderMap['ORD-2026-9844'], product_name: 'Greek Yogurt 400g', quantity: 1, unit_price: 120, total_price: 120 },
        { order_id: orderMap['ORD-2026-9844'], product_name: 'Carrots 1kg', quantity: 1, unit_price: 30, total_price: 30 },
        { order_id: orderMap['ORD-2026-9844'], product_name: 'Bananas 1kg', quantity: 1, unit_price: 55, total_price: 55 },

        // ORD-9855 (subtotal ~680)
        { order_id: orderMap['ORD-2026-9855'], product_name: 'Salmon Fillet 300g', quantity: 1, unit_price: 450, total_price: 450 },
        { order_id: orderMap['ORD-2026-9855'], product_name: 'Whole Wheat Bread', quantity: 2, unit_price: 45, total_price: 90 },
        { order_id: orderMap['ORD-2026-9855'], product_name: 'Eggs (12 pack)', quantity: 1, unit_price: 90, total_price: 90 },
        { order_id: orderMap['ORD-2026-9855'], product_name: 'Tomatoes 1kg', quantity: 1, unit_price: 35, total_price: 35 },

        // ORD-9860 (subtotal ~505)
        { order_id: orderMap['ORD-2026-9860'], product_name: 'Extra Virgin Olive Oil 500ml', quantity: 1, unit_price: 350, total_price: 350 },
        { order_id: orderMap['ORD-2026-9860'], product_name: 'Bananas 1kg', quantity: 1, unit_price: 55, total_price: 55 },
        { order_id: orderMap['ORD-2026-9860'], product_name: 'Rolled Oats 1kg', quantity: 1, unit_price: 120, total_price: 120 },

        // ORD-9870 (subtotal ~920)
        { order_id: orderMap['ORD-2026-9870'], product_name: 'Lamb Chops 500g', quantity: 1, unit_price: 550, total_price: 550 },
        { order_id: orderMap['ORD-2026-9870'], product_name: 'Mangoes 1kg', quantity: 1, unit_price: 200, total_price: 200 },
        { order_id: orderMap['ORD-2026-9870'], product_name: 'Organic Milk 1L', quantity: 2, unit_price: 60, total_price: 120 },
        { order_id: orderMap['ORD-2026-9870'], product_name: 'Spinach 500g', quantity: 1, unit_price: 40, total_price: 40 },

        // ORD-9880 (subtotal ~440)
        { order_id: orderMap['ORD-2026-9880'], product_name: 'Quinoa 500g', quantity: 1, unit_price: 280, total_price: 280 },
        { order_id: orderMap['ORD-2026-9880'], product_name: 'Apples 1kg', quantity: 1, unit_price: 120, total_price: 120 },
        { order_id: orderMap['ORD-2026-9880'], product_name: 'Carrots 1kg', quantity: 1, unit_price: 30, total_price: 30 },

        // ORD-9890 (subtotal ~350)
        { order_id: orderMap['ORD-2026-9890'], product_name: 'Chicken Breast 500g', quantity: 1, unit_price: 250, total_price: 250 },
        { order_id: orderMap['ORD-2026-9890'], product_name: 'Oranges 1kg', quantity: 1, unit_price: 80, total_price: 80 },
        { order_id: orderMap['ORD-2026-9890'], product_name: 'Onions 1kg', quantity: 1, unit_price: 25, total_price: 25 },

        // ORD-9900 (subtotal ~280)
        { order_id: orderMap['ORD-2026-9900'], product_name: 'Croissants (4 pack)', quantity: 1, unit_price: 180, total_price: 180 },
        { order_id: orderMap['ORD-2026-9900'], product_name: 'Butter 500g', quantity: 1, unit_price: 250, total_price: 250 },
      ].filter(item => item.order_id);

      if (orderItems.length > 0) {
        for (const orderId of Object.values(orderMap)) {
          await supabaseAdmin.from('order_items').delete().eq('order_id', orderId);
        }
        await supabaseAdmin.from('order_items').insert(orderItems);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with 36 products and 8 orders!',
      errors: {
        products: productError?.message || null,
        orders: orderError?.message || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
