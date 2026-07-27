import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('provider_inventory')
      .select(`
        id,
        stock_quantity,
        price,
        provider_id,
        products ( id, name, category, description, unit, image_url, health_score ),
        providers ( name )
      `)
      .gt('stock_quantity', -1); // get all

    if (error) throw error;

    // Flatten for frontend
    const formatted = data.map((item: any) => ({
      id: item.products.id, // we map product ID as the main ID for the UI
      provider_id: item.provider_id,
      name: item.products.name,
      description: item.products.description,
      category: item.products.category,
      price: item.price,
      unit: item.products.unit,
      image_url: item.products.image_url,
      health_score: item.products.health_score,
      stock_quantity: item.stock_quantity,
      provider_name: item.providers.name
    }));

    // Group by category is handled on frontend, but we should sort them
    formatted.sort((a, b) => a.category.localeCompare(b.category));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Database connection failed, using high-quality fallback data.', error.message);
    
    // High-quality mock data for the poster presentation in case Supabase is offline
    const exactProducts = [
      // Fruits
      { name: 'Apple', category: 'Fruits', price: 150, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bc6c?w=400&q=80' },
      { name: 'Banana', category: 'Fruits', price: 60, image_url: 'https://images.unsplash.com/photo-1571501478200-c5c4e785f838?w=400&q=80' },
      { name: 'Mango', category: 'Fruits', price: 200, image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80' },
      { name: 'Orange', category: 'Fruits', price: 120, image_url: 'https://images.unsplash.com/photo-1549888834-3ec93abae044?w=400&q=80' },
      { name: 'Grapes', category: 'Fruits', price: 90, image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80' },
      { name: 'Strawberry', category: 'Fruits', price: 250, image_url: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400&q=80' },
      { name: 'Watermelon', category: 'Fruits', price: 80, image_url: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74476?w=400&q=80' },
      { name: 'Pineapple', category: 'Fruits', price: 110, image_url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80' },
      { name: 'Papaya', category: 'Fruits', price: 70, image_url: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&q=80' },
      { name: 'Pomegranate', category: 'Fruits', price: 180, image_url: 'https://images.unsplash.com/photo-1615486171448-4fbaf08cb4be?w=400&q=80' },

      // Vegetables
      { name: 'Tomato', category: 'Vegetables', price: 40, image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80' },
      { name: 'Potato', category: 'Vegetables', price: 30, image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80' },
      { name: 'Onion', category: 'Vegetables', price: 35, image_url: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&q=80' },
      { name: 'Carrot', category: 'Vegetables', price: 50, image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80' },
      { name: 'Cabbage', category: 'Vegetables', price: 25, image_url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80' },
      { name: 'Cauliflower', category: 'Vegetables', price: 40, image_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&q=80' },
      { name: 'Spinach', category: 'Vegetables', price: 20, image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80' },
      { name: 'Broccoli', category: 'Vegetables', price: 150, image_url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80' },
      { name: 'Capsicum', category: 'Vegetables', price: 60, image_url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80' },
      { name: 'Cucumber', category: 'Vegetables', price: 30, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80' },

      // Dairy
      { name: 'Full Cream Milk', category: 'Dairy', price: 66, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
      { name: 'Toned Milk', category: 'Dairy', price: 54, image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80' },
      { name: 'Fresh Curd', category: 'Dairy', price: 40, image_url: 'https://images.unsplash.com/photo-1570197571499-166b5343541c?w=400&q=80' },
      { name: 'Paneer 200g', category: 'Dairy', price: 90, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946cea?w=400&q=80' },
      { name: 'Cheddar Cheese', category: 'Dairy', price: 150, image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
      { name: 'Salted Butter', category: 'Dairy', price: 55, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
      { name: 'Pure Cow Ghee', category: 'Dairy', price: 600, image_url: 'https://images.unsplash.com/photo-1630145265430-6b6a032dc1df?w=400&q=80' },
      { name: 'Brown Eggs', category: 'Dairy', price: 60, image_url: 'https://images.unsplash.com/photo-1587486913049-53fc88980bfc?w=400&q=80' },
      { name: 'Greek Yogurt', category: 'Dairy', price: 80, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
      { name: 'Mozzarella', category: 'Dairy', price: 200, image_url: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&q=80' },

      // Bakery
      { name: 'White Bread', category: 'Bakery', price: 40, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
      { name: 'Brown Bread', category: 'Bakery', price: 50, image_url: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&q=80' },
      { name: 'Multigrain Bread', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80' },
      { name: 'Butter Croissant', category: 'Bakery', price: 80, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=400&q=80' },
      { name: 'Chocolate Muffin', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
      { name: 'Blueberry Muffin', category: 'Bakery', price: 70, image_url: 'https://images.unsplash.com/photo-1598215439218-f79b4ed1cb16?w=400&q=80' },
      { name: 'Choco Cookies', category: 'Bakery', price: 120, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80' },
      { name: 'Oatmeal Cookies', category: 'Bakery', price: 100, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },

      // Meat
      { name: 'Chicken Breast', category: 'Meat', price: 280, image_url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&q=80' },
      { name: 'Chicken Curry Cut', category: 'Meat', price: 450, image_url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80' },
      { name: 'Mutton Keema', category: 'Meat', price: 650, image_url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80' },
      { name: 'Rohu Fish 1kg', category: 'Meat', price: 300, image_url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&q=80' },
      { name: 'Prawns 500g', category: 'Meat', price: 400, image_url: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80' },

      // Oils
      { name: 'Sunflower Oil 1L', category: 'Oils', price: 140, image_url: 'https://images.unsplash.com/photo-1610725663801-1490960e24d7?w=400&q=80' },
      { name: 'Olive Oil 500ml', category: 'Oils', price: 450, image_url: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&q=80' },
      { name: 'Mustard Oil 1L', category: 'Oils', price: 160, image_url: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400&q=80' },
      { name: 'Coconut Oil 500ml', category: 'Oils', price: 200, image_url: 'https://images.unsplash.com/photo-1611078502570-0720b00511de?w=400&q=80' },

      // Grains
      { name: 'Basmati Rice 1kg', category: 'Grains', price: 120, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80' },
      { name: 'Sona Masoori 5kg', category: 'Grains', price: 300, image_url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80' },
      { name: 'Whole Wheat 5kg', category: 'Grains', price: 220, image_url: 'https://images.unsplash.com/photo-1508338712271-40539c95ae47?w=400&q=80' },
      { name: 'Toor Dal 1kg', category: 'Grains', price: 160, image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
      { name: 'Moong Dal 1kg', category: 'Grains', price: 130, image_url: 'https://images.unsplash.com/photo-1616421319766-3d237b67b1b3?w=400&q=80' },
      
      // Snacks
      { name: 'Kurkure Masala Munch', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
      { name: 'Lays Classic Salted', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
      { name: 'Lays American Style Cream & Onion', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
      { name: 'Oreo Biscuits', category: 'Snacks', price: 40, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
      { name: 'Parle-G Gold Biscuits', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
      { name: 'Bourbon Biscuits', category: 'Snacks', price: 30, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
      { name: 'Dark Chocolate (70%)', category: 'Snacks', price: 150, image_url: 'https://images.unsplash.com/photo-1548813293-c906666fc29b?w=400&q=80' },
      { name: 'Haldiram Aloo Bhujia', category: 'Snacks', price: 50, image_url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80' }
    ];

    const fallbackData = exactProducts.map((p, idx) => ({
      id: `mock-id-${idx}`,
      provider_id: 'mock-provider',
      name: p.name,
      description: `Fresh and high quality ${p.name}.`,
      category: p.category,
      price: p.price,
      unit: p.category === 'Dairy' || p.category === 'Oils' ? 'unit' : 'kg',
      image_url: p.image_url,
      health_score: 95,
      stock_quantity: 100,
      provider_name: 'Fresh Grocery Plus'
    }));

    return NextResponse.json({ success: true, data: fallbackData });
  }
}
