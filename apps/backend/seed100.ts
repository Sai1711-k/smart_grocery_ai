import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = ['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 'Oils', 'Grains', 'Snacks', 'Beverages', 'Spices'];
const adjectives = ['Fresh', 'Organic', 'Premium', 'Local', 'Imported', 'Artisanal', 'Farm-Fresh', 'Natural', 'Whole', 'Gourmet'];

function generateProducts(count: number) {
  const products = [];
  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const name = `${adj} ${category} Item ${i}`;
    
    // Generate some somewhat realistic base names
    let baseName = name;
    if (category === 'Vegetables') baseName = `${adj} Cabbage ${i}`;
    if (category === 'Fruits') baseName = `${adj} Berries ${i}`;
    if (category === 'Snacks') baseName = `${adj} Potato Chips ${i}`;
    if (category === 'Beverages') baseName = `${adj} Mango Juice ${i}`;

    products.push({
      name: baseName,
      description: `High quality ${baseName.toLowerCase()} sourced for the best taste.`,
      category: category,
      price: Math.floor(Math.random() * 500) + 20,
      unit: ['kg', '500g', 'pack', 'liter', 'piece'][Math.floor(Math.random() * 5)],
      health_score: Math.floor(Math.random() * 40) + 60, // 60 to 100
      stock_quantity: Math.floor(Math.random() * 100) + 10,
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', // generic grocery image
      is_active: true
    });
  }
  return products;
}

async function runSeed() {
  console.log('Generating 100 products...');
  const newProducts = generateProducts(100);

  console.log('Inserting into Supabase...');
  const { data, error } = await supabase
    .from('products')
    .upsert(newProducts, { onConflict: 'name', ignoreDuplicates: true });

  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Successfully seeded 100 products!');
  }
}

runSeed();
