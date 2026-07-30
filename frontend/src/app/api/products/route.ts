import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const fallbackProducts = [
  // 🍎 Fruits
  { name: 'Red Delicious Apple', category: 'Fruits', price: 150, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop' },
  { name: 'Fresh Robusta Banana', category: 'Fruits', price: 60, image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop' },
  { name: 'Alphonso Mango', category: 'Fruits', price: 200, image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop' },
  { name: 'Nagpur Oranges', category: 'Fruits', price: 120, image_url: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop' },
  { name: 'Black Seedless Grapes', category: 'Fruits', price: 90, image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop' },
  { name: 'Fresh Strawberries', category: 'Fruits', price: 250, image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop' },
  { name: 'Sweet Watermelon', category: 'Fruits', price: 80, image_url: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74476?w=500&auto=format&fit=crop' },

  // 🥦 Vegetables
  { name: 'Fresh Hybrid Tomato', category: 'Vegetables', price: 40, image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop' },
  { name: 'New Crop Potato', category: 'Vegetables', price: 30, image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop' },
  { name: 'Red Onion', category: 'Vegetables', price: 35, image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop' },
  { name: 'Organic Carrot', category: 'Vegetables', price: 50, image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop' },
  { name: 'Fresh Spinach Bunch', category: 'Vegetables', price: 20, image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop' },
  { name: 'Green Broccoli', category: 'Vegetables', price: 150, image_url: 'https://images.unsplash.com/photo-1447175008436-08417090ea77?w=500&auto=format&fit=crop' },
  { name: 'Fresh Cucumber', category: 'Vegetables', price: 30, image_url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&auto=format&fit=crop' },

  // 🥛 Dairy
  { name: 'Full Cream Milk 1L', category: 'Dairy', price: 66, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop' },
  { name: 'Amul Salted Butter', category: 'Dairy', price: 55, image_url: 'https://images.unsplash.com/photo-1584278860011-678e36e68948?w=500&auto=format&fit=crop' },
  { name: 'Amul Processed Cheese Slices', category: 'Dairy', price: 150, image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop' },
  { name: 'Fresh Malai Paneer 200g', category: 'Dairy', price: 90, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946cea?w=500&auto=format&fit=crop' },
  { name: 'Greek Plain Yogurt', category: 'Dairy', price: 80, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop' },

  // 🍞 Bakery
  { name: 'Classic White Bread', category: 'Bakery', price: 40, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop' },
  { name: 'Healthy Brown Bread', category: 'Bakery', price: 50, image_url: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&auto=format&fit=crop' },
  { name: '100% Multigrain Bread', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop' },
  { name: 'French Butter Croissant', category: 'Bakery', price: 80, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop' },
  { name: 'Rich Chocolate Muffin', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop' },
  { name: 'Blueberry Muffin', category: 'Bakery', price: 70, image_url: 'https://images.unsplash.com/photo-1598215439218-f79b4ed1cb16?w=500&auto=format&fit=crop' },

  // 🥩 Meat
  { name: 'Fresh Chicken Breast 500g', category: 'Meat', price: 280, image_url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=500&auto=format&fit=crop' },
  { name: 'Chicken Curry Cut 1kg', category: 'Meat', price: 450, image_url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop' },
  { name: 'Fresh Mutton Keema 500g', category: 'Meat', price: 650, image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop' },
  { name: 'Fresh Rohu Fish 1kg', category: 'Meat', price: 300, image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop' },

  // 🫒 Oils & Fats
  { name: 'Fortune Sunflower Oil 1L', category: 'Oils', price: 140, image_url: 'https://images.unsplash.com/photo-1610725663801-1490960e24d7?w=500&auto=format&fit=crop' },
  { name: 'Borges Extra Virgin Olive Oil 500ml', category: 'Oils', price: 450, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop' },
  { name: 'Dabur Kachi Ghani Mustard Oil 1L', category: 'Oils', price: 160, image_url: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500&auto=format&fit=crop' },
  { name: 'Parachute Pure Coconut Oil 500ml', category: 'Oils', price: 200, image_url: 'https://images.unsplash.com/photo-1611078502570-0720b00511de?w=500&auto=format&fit=crop' },
  { name: 'Pure Cow Ghee 500g', category: 'Oils', price: 350, image_url: 'https://images.unsplash.com/photo-1630145265430-6b6a032dc1df?w=500&auto=format&fit=crop' },

  // 🍚 Grains & Rice
  { name: 'India Gate Basmati Rice 1kg', category: 'Grains', price: 120, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&auto=format&fit=crop' },
  { name: 'Sona Masoori Rice 5kg', category: 'Grains', price: 300, image_url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop' },
  { name: 'Aashirvaad Shudh Chakki Atta 5kg', category: 'Grains', price: 220, image_url: 'https://images.unsplash.com/photo-1508338712271-40539c95ae47?w=500&auto=format&fit=crop' },
  { name: 'Tata Sampann Toor Dal 1kg', category: 'Grains', price: 160, image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop' },

  // ☕ Beverages
  { name: 'Tropicana 100% Orange Juice 1L', category: 'Beverages', price: 130, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop' },
  { name: 'Nescafe Cold Coffee 250ml', category: 'Beverages', price: 65, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop' },
  { name: 'Tata Tea Gold 500g', category: 'Beverages', price: 280, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop' },
  { name: 'Red Bull Energy Drink 250ml', category: 'Beverages', price: 125, image_url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&auto=format&fit=crop' },
  { name: 'Coca-Cola Original 750ml', category: 'Beverages', price: 45, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop' },
  { name: 'Organic Green Tea 25 Bags', category: 'Beverages', price: 180, image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop' },

  // 🍪 Snacks & Biscuits
  { name: 'Kurkure Masala Munch', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop' },
  { name: 'Kurkure Green Chutney Style', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop' },
  { name: 'Lays Classic Salted Chips', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop' },
  { name: 'Lays India Magic Masala', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop' },
  { name: 'Lays American Style Cream & Onion', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=500&auto=format&fit=crop' },
  { name: 'Lays Spanish Tomato Tango', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1566478978921-654b0e8c81ef?w=500&auto=format&fit=crop' },
  { name: 'Oreo Chocolate Cream Biscuits', category: 'Snacks', price: 40, image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop' },
  { name: 'Britannia JimJam Biscuits', category: 'Snacks', price: 35, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop' },
  { name: 'Parle-G Gold Biscuits', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop' },
  { name: 'Britannia Good Day Butter Cookies', category: 'Snacks', price: 30, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop' },
  { name: 'Sunfeast Dark Fantasy Choco Fills', category: 'Snacks', price: 50, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop' },
  { name: 'Bingo Mad Angles Very Peri Peri', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop' },
  { name: 'Doritos Nacho Cheese Tortilla Chips', category: 'Snacks', price: 30, image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop' },
  { name: 'Pringles Sour Cream & Onion', category: 'Snacks', price: 110, image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop' },
  { name: 'Cheetos Cheese Puffs', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop' },
  { name: 'Britannia Bourbon Chocolate Biscuits', category: 'Snacks', price: 30, image_url: 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=500&auto=format&fit=crop' },
  { name: 'Parle Hide & Seek Choco Chip', category: 'Snacks', price: 40, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop' },
  { name: 'Haldiram Aloo Bhujia 200g', category: 'Snacks', price: 50, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop' },
  { name: 'Haldiram Khatta Meetha Mixture', category: 'Snacks', price: 55, image_url: 'https://images.unsplash.com/photo-1601050690187-013098522301?w=500&auto=format&fit=crop' },
  { name: 'Act II Golden Butter Popcorn', category: 'Snacks', price: 25, image_url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&auto=format&fit=crop' },
  { name: 'Snickers Peanut Chocolate Bar', category: 'Snacks', price: 50, image_url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=500&auto=format&fit=crop' },
  { name: 'Cadbury Dairy Milk Silk Chocolate', category: 'Snacks', price: 90, image_url: 'https://images.unsplash.com/photo-1548813293-c906666fc29b?w=500&auto=format&fit=crop' },
  { name: 'KitKat 4-Finger Chocolate Wafers', category: 'Snacks', price: 40, image_url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop' },
  { name: 'Roasted Salted Almonds 200g', category: 'Snacks', price: 220, image_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop' },
  { name: 'Premium Whole Cashews 200g', category: 'Snacks', price: 280, image_url: 'https://images.unsplash.com/photo-1536591375315-198956582373?w=500&auto=format&fit=crop' },
];

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
      .gt('stock_quantity', -1);

    let formatted: any[] = [];
    if (!error && data && data.length > 0) {
      formatted = data.map((item: any) => ({
        id: item.products.id,
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
    }

    // Ensure all 11 categories have products by merging fallbacks for missing categories
    const existingCategories = new Set(formatted.map((p: any) => (p.category || '').toLowerCase()));
    
    fallbackProducts.forEach((fp, idx) => {
      const catLower = fp.category.toLowerCase();
      // If DB has fewer than 2 items for this category or category missing, merge fallback item
      const categoryCount = formatted.filter((p: any) => (p.category || '').toLowerCase() === catLower).length;
      if (categoryCount < 3) {
        formatted.push({
          id: `product-item-${idx}-${fp.name.replace(/\s+/g, '-').toLowerCase()}`,
          provider_id: 'freshcart-store',
          name: fp.name,
          description: `Fresh, natural and delicious ${fp.name}.`,
          category: fp.category,
          price: fp.price,
          unit: fp.category === 'Dairy' || fp.category === 'Oils' || fp.category === 'Beverages' ? 'unit' : 'pack',
          image_url: fp.image_url,
          health_score: fp.category === 'Snacks' ? 82 : 95,
          stock_quantity: 100,
          provider_name: 'Smart Grocery (Tech Park)'
        });
      }
    });

    formatted.sort((a: any, b: any) => a.category.localeCompare(b.category));
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Database fallback engaged:', error.message);

    const fallbackData = fallbackProducts.map((p, idx) => ({
      id: `product-item-${idx}`,
      provider_id: 'freshcart-store',
      name: p.name,
      description: `Fresh, high quality ${p.name}.`,
      category: p.category,
      price: p.price,
      unit: p.category === 'Dairy' || p.category === 'Oils' || p.category === 'Beverages' ? 'unit' : 'pack',
      image_url: p.image_url,
      health_score: p.category === 'Snacks' ? 82 : 95,
      stock_quantity: 100,
      provider_name: 'Smart Grocery (Tech Park)'
    }));

    return NextResponse.json({ success: true, data: fallbackData });
  }
}
