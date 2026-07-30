import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const exactProducts = [
  // 🍎 Fruits
  { name: 'Red Delicious Apple', category: 'Fruits', price: 150, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop' },
  { name: 'Fresh Robusta Banana', category: 'Fruits', price: 60, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop' },
  { name: 'Alphonso Mango', category: 'Fruits', price: 200, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop' },
  { name: 'Nagpur Oranges', category: 'Fruits', price: 120, image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop' },
  { name: 'Black Seedless Grapes', category: 'Fruits', price: 90, image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop' },

  // 🥦 Vegetables
  { name: 'Fresh Hybrid Tomato', category: 'Vegetables', price: 40, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop' },
  { name: 'New Crop Potato', category: 'Vegetables', price: 30, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop' },
  { name: 'Red Onion', category: 'Vegetables', price: 35, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop' },
  { name: 'Organic Carrot', category: 'Vegetables', price: 50, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop' },
  { name: 'Fresh Spinach Bunch', category: 'Vegetables', price: 20, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop' },

  // 🥛 Dairy
  { name: 'Full Cream Milk 1L', category: 'Dairy', price: 66, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop' },
  { name: 'Amul Salted Butter', category: 'Dairy', price: 55, image: 'https://images.unsplash.com/photo-1584278860011-678e36e68948?w=500&auto=format&fit=crop' },
  { name: 'Amul Processed Cheese Slices', category: 'Dairy', price: 150, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop' },
  { name: 'Fresh Malai Paneer 200g', category: 'Dairy', price: 90, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946cea?w=500&auto=format&fit=crop' },

  // 🍞 Bakery
  { name: 'Classic White Bread', category: 'Bakery', price: 40, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop' },
  { name: 'Healthy Brown Bread', category: 'Bakery', price: 50, image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&auto=format&fit=crop' },
  { name: '100% Multigrain Bread', category: 'Bakery', price: 60, image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop' },
  { name: 'French Butter Croissant', category: 'Bakery', price: 80, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop' },

  // 🍪 SNACKS & BISCUITS (25 UNIQUE ITEMS)
  { name: 'Kurkure Masala Munch', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop' },
  { name: 'Kurkure Green Chutney Style', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop' },
  { name: 'Lays Classic Salted Chips', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop' },
  { name: 'Lays India Magic Masala', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop' },
  { name: 'Lays American Style Cream & Onion', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=500&auto=format&fit=crop' },
  { name: 'Lays Spanish Tomato Tango', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1566478978921-654b0e8c81ef?w=500&auto=format&fit=crop' },
  { name: 'Oreo Chocolate Cream Biscuits', category: 'Snacks', price: 40, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop' },
  { name: 'Britannia JimJam Biscuits', category: 'Snacks', price: 35, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop' },
  { name: 'Parle-G Gold Biscuits', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop' },
  { name: 'Britannia Good Day Butter Cookies', category: 'Snacks', price: 30, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop' },
  { name: 'Sunfeast Dark Fantasy Choco Fills', category: 'Snacks', price: 50, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop' },
  { name: 'Bingo Mad Angles Very Peri Peri', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop' },
  { name: 'Doritos Nacho Cheese Tortilla Chips', category: 'Snacks', price: 30, image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop' },
  { name: 'Pringles Sour Cream & Onion', category: 'Snacks', price: 110, image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop' },
  { name: 'Cheetos Cheese Puffs', category: 'Snacks', price: 20, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop' },
  { name: 'Britannia Bourbon Chocolate Biscuits', category: 'Snacks', price: 30, image: 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=500&auto=format&fit=crop' },
  { name: 'Parle Hide & Seek Choco Chip', category: 'Snacks', price: 40, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop' },
  { name: 'Haldiram Aloo Bhujia 200g', category: 'Snacks', price: 50, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop' },
  { name: 'Haldiram Khatta Meetha Mixture', category: 'Snacks', price: 55, image: 'https://images.unsplash.com/photo-1601050690187-013098522301?w=500&auto=format&fit=crop' },
  { name: 'Act II Golden Butter Popcorn', category: 'Snacks', price: 25, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&auto=format&fit=crop' },
  { name: 'Snickers Peanut Chocolate Bar', category: 'Snacks', price: 50, image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=500&auto=format&fit=crop' },
  { name: 'Cadbury Dairy Milk Silk Chocolate', category: 'Snacks', price: 90, image: 'https://images.unsplash.com/photo-1548813293-c906666fc29b?w=500&auto=format&fit=crop' },
  { name: 'KitKat 4-Finger Chocolate Wafers', category: 'Snacks', price: 40, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop' },
  { name: 'Roasted Salted Almonds 200g', category: 'Snacks', price: 220, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop' },
  { name: 'Premium Whole Cashews 200g', category: 'Snacks', price: 280, image: 'https://images.unsplash.com/photo-1536591375315-198956582373?w=500&auto=format&fit=crop' },
];

async function reseed() {
  console.log('Fetching providers...');
  const { data: providers, error: provErr } = await supabaseAdmin.from('providers').select('id');
  if (provErr || !providers?.length) {
    console.error('No providers found!');
    return;
  }
  const defaultProvider = providers[0].id;

  console.log(`Inserting ${exactProducts.length} curated products...`);
  for (const item of exactProducts) {
    const { data: product } = await supabaseAdmin
      .from('products')
      .upsert({
        name: item.name,
        category: item.category,
        description: `Fresh, crispy and delicious ${item.name.toLowerCase()}.`,
        unit: item.category === 'Dairy' || item.category === 'Oils' ? 'unit' : 'pack',
        image_url: item.image,
        health_score: 85,
        price: item.price,
      }, { onConflict: 'name' })
      .select()
      .single();

    if (product) {
      await supabaseAdmin.from('provider_inventory').upsert({
        provider_id: defaultProvider,
        product_id: product.id,
        stock_quantity: 100,
        price: item.price
      }, { onConflict: 'provider_id,product_id' });
    }
  }
  console.log('Done reseeding!');
}

reseed();
