import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const exactProducts = [
  // Fruits
  { name: 'Apple', category: 'Fruits', price: 150, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bc6c?w=400&q=80' },
  { name: 'Banana', category: 'Fruits', price: 60, image: 'https://images.unsplash.com/photo-1571501478200-c5c4e785f838?w=400&q=80' },
  { name: 'Mango', category: 'Fruits', price: 200, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80' },
  { name: 'Orange', category: 'Fruits', price: 120, image: 'https://images.unsplash.com/photo-1549888834-3ec93abae044?w=400&q=80' },
  { name: 'Grapes', category: 'Fruits', price: 90, image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80' },
  { name: 'Strawberry', category: 'Fruits', price: 250, image: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400&q=80' },
  { name: 'Watermelon', category: 'Fruits', price: 80, image: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74476?w=400&q=80' },
  { name: 'Pineapple', category: 'Fruits', price: 110, image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80' },
  { name: 'Papaya', category: 'Fruits', price: 70, image: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&q=80' },
  { name: 'Pomegranate', category: 'Fruits', price: 180, image: 'https://images.unsplash.com/photo-1615486171448-4fbaf08cb4be?w=400&q=80' },

  // Vegetables
  { name: 'Tomato', category: 'Vegetables', price: 40, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80' },
  { name: 'Potato', category: 'Vegetables', price: 30, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80' },
  { name: 'Onion', category: 'Vegetables', price: 35, image: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&q=80' },
  { name: 'Carrot', category: 'Vegetables', price: 50, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80' },
  { name: 'Cabbage', category: 'Vegetables', price: 25, image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80' },
  { name: 'Cauliflower', category: 'Vegetables', price: 40, image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&q=80' },
  { name: 'Spinach', category: 'Vegetables', price: 20, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80' },
  { name: 'Broccoli', category: 'Vegetables', price: 150, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80' },
  { name: 'Capsicum', category: 'Vegetables', price: 60, image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80' },
  { name: 'Cucumber', category: 'Vegetables', price: 30, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80' },

  // Dairy
  { name: 'Full Cream Milk', category: 'Dairy', price: 66, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
  { name: 'Toned Milk', category: 'Dairy', price: 54, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80' },
  { name: 'Fresh Curd', category: 'Dairy', price: 40, image: 'https://images.unsplash.com/photo-1570197571499-166b5343541c?w=400&q=80' },
  { name: 'Paneer 200g', category: 'Dairy', price: 90, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946cea?w=400&q=80' },
  { name: 'Cheddar Cheese', category: 'Dairy', price: 150, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
  { name: 'Salted Butter', category: 'Dairy', price: 55, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
  { name: 'Pure Cow Ghee', category: 'Dairy', price: 600, image: 'https://images.unsplash.com/photo-1630145265430-6b6a032dc1df?w=400&q=80' },
  { name: 'Brown Eggs (6 Pack)', category: 'Dairy', price: 60, image: 'https://images.unsplash.com/photo-1587486913049-53fc88980bfc?w=400&q=80' },
  { name: 'Greek Yogurt', category: 'Dairy', price: 80, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
  { name: 'Mozzarella Cheese', category: 'Dairy', price: 200, image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&q=80' },

  // Bakery
  { name: 'White Bread', category: 'Bakery', price: 40, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'Brown Bread', category: 'Bakery', price: 50, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'Multigrain Bread', category: 'Bakery', price: 60, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'Butter Croissant', category: 'Bakery', price: 80, image: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=400&q=80' },
  { name: 'Chocolate Muffin', category: 'Bakery', price: 60, image: 'https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?w=400&q=80' },
  { name: 'Blueberry Muffin', category: 'Bakery', price: 70, image: 'https://images.unsplash.com/photo-1598215439218-f79b4ed1cb16?w=400&q=80' },
  { name: 'Choco Chip Cookies', category: 'Bakery', price: 120, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80' },
  { name: 'Oatmeal Cookies', category: 'Bakery', price: 100, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
  { name: 'Fruit Cake', category: 'Bakery', price: 250, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
  { name: 'Burger Buns (4 Pcs)', category: 'Bakery', price: 40, image: 'https://images.unsplash.com/photo-1550508139-ce0cb9f3f4e1?w=400&q=80' },

  // Meat
  { name: 'Chicken Breast 500g', category: 'Meat', price: 280, image: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&q=80' },
  { name: 'Chicken Curry Cut 1kg', category: 'Meat', price: 450, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80' },
  { name: 'Mutton Keema 500g', category: 'Meat', price: 650, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80' },
  { name: 'Rohu Fish 1kg', category: 'Meat', price: 300, image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&q=80' },
  { name: 'Prawns 500g', category: 'Meat', price: 400, image: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80' },
  { name: 'Chicken Drumsticks', category: 'Meat', price: 300, image: 'https://images.unsplash.com/photo-1608039755401-74207cc5c784?w=400&q=80' },
  { name: 'Salmon Fillet', category: 'Meat', price: 1200, image: 'https://images.unsplash.com/photo-1599084990807-6b08e2f89f41?w=400&q=80' },
  { name: 'Mutton Curry Cut 1kg', category: 'Meat', price: 900, image: 'https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?w=400&q=80' },

  // Oils
  { name: 'Sunflower Oil 1L', category: 'Oils', price: 140, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { name: 'Olive Oil 500ml', category: 'Oils', price: 450, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { name: 'Mustard Oil 1L', category: 'Oils', price: 160, image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400&q=80' },
  { name: 'Coconut Oil 500ml', category: 'Oils', price: 200, image: 'https://images.unsplash.com/photo-1611078502570-0720b00511de?w=400&q=80' },
  { name: 'Groundnut Oil 1L', category: 'Oils', price: 180, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { name: 'Sesame Oil 500ml', category: 'Oils', price: 250, image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400&q=80' },

  // Grains
  { name: 'Basmati Rice 1kg', category: 'Grains', price: 120, image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80' },
  { name: 'Sona Masoori Rice 5kg', category: 'Grains', price: 300, image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80' },
  { name: 'Whole Wheat Atta 5kg', category: 'Grains', price: 220, image: 'https://images.unsplash.com/photo-1508338712271-40539c95ae47?w=400&q=80' },
  { name: 'Toor Dal 1kg', category: 'Grains', price: 160, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
  { name: 'Moong Dal 1kg', category: 'Grains', price: 130, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
  { name: 'Chana Dal 1kg', category: 'Grains', price: 90, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
  { name: 'Rolled Oats 1kg', category: 'Grains', price: 180, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80' },
  { name: 'Quinoa 500g', category: 'Grains', price: 250, image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80' },
];

async function reseed() {
  console.log('Fetching providers...');
  const { data: providers, error: provErr } = await supabaseAdmin.from('providers').select('id');
  if (provErr || !providers?.length) {
    console.error('No providers found!');
    return;
  }
  const defaultProvider = providers[0].id;

  console.log('Clearing existing inventory & products...');
  // Delete all existing products (which cascades to provider_inventory and order_items)
  await supabaseAdmin.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log(`Inserting ${exactProducts.length} curated products...`);
  let count = 0;
  for (const item of exactProducts) {
    // 1. Create product
    const { data: product, error: prodErr } = await supabaseAdmin
      .from('products')
      .insert([{
        name: item.name,
        category: item.category,
        description: `Fresh and high quality ${item.name.toLowerCase()}.`,
        unit: item.category === 'Dairy' || item.category === 'Oils' ? 'unit' : 'kg',
        image_url: item.image,
        health_score: Math.floor(Math.random() * 30) + 70, // 70-100
        price: item.price,
      }])
      .select()
      .single();

    if (prodErr) {
      console.error(`Error inserting product ${item.name}:`, prodErr.message);
      continue;
    }

    // 2. Add to inventory
    const { error: invErr } = await supabaseAdmin
      .from('provider_inventory')
      .insert([{
        provider_id: defaultProvider,
        product_id: product.id,
        price: item.price,
        stock_quantity: Math.floor(Math.random() * 50) + 50, // 50-100
      }]);

    if (invErr) {
      console.error(`Error inserting inventory for ${item.name}:`, invErr.message);
    } else {
      count++;
    }
  }

  console.log(`Successfully reseeded database with ${count} exact products!`);
}

reseed();
