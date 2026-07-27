import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = [
  'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 
  'Seafood', 'Snacks', 'Beverages', 'Pantry', 'Frozen'
];

const emojis = ['🥬', '🍎', '🧀', '🍞', '🥩', '🐟', '🍪', '🧃', '🥫', '🧊'];

const generateProducts = () => {
  const products = [];
  const baseNames: Record<string, string[]> = {
    'Vegetables': ['Tomato', 'Onion', 'Potato', 'Carrot', 'Broccoli', 'Spinach', 'Bell Pepper', 'Cucumber', 'Zucchini', 'Garlic', 'Ginger', 'Mushroom', 'Cauliflower', 'Cabbage', 'Lettuce'],
    'Fruits': ['Apple', 'Banana', 'Orange', 'Mango', 'Strawberry', 'Grapes', 'Watermelon', 'Pineapple', 'Kiwi', 'Peach', 'Plum', 'Pear', 'Blueberry', 'Raspberry', 'Lemon'],
    'Dairy': ['Milk', 'Cheddar Cheese', 'Butter', 'Yogurt', 'Paneer', 'Mozzarella', 'Cream Cheese', 'Ghee', 'Sour Cream', 'Whipping Cream'],
    'Bakery': ['Whole Wheat Bread', 'Croissant', 'Bagel', 'Baguette', 'Muffin', 'Sourdough', 'Pita Bread', 'Donut', 'Hamburger Buns', 'Hot Dog Buns'],
    'Meat': ['Chicken Breast', 'Ground Beef', 'Pork Chops', 'Bacon', 'Turkey', 'Sausage', 'Lamb Leg', 'Chicken Wings', 'Chicken Thighs', 'Beef Steak'],
    'Seafood': ['Salmon Fillet', 'Shrimp', 'Tuna', 'Cod', 'Tilapia', 'Crab Legs', 'Lobster', 'Scallops', 'Oysters', 'Mussels'],
    'Snacks': ['Potato Chips', 'Popcorn', 'Pretzels', 'Tortilla Chips', 'Mixed Nuts', 'Chocolate Bar', 'Cookies', 'Crackers', 'Trail Mix', 'Protein Bar'],
    'Beverages': ['Orange Juice', 'Apple Juice', 'Coca Cola', 'Pepsi', 'Sprite', 'Green Tea', 'Coffee Beans', 'Almond Milk', 'Sparkling Water', 'Energy Drink'],
    'Pantry': ['Olive Oil', 'Vegetable Oil', 'Rice', 'Pasta', 'Flour', 'Sugar', 'Salt', 'Black Pepper', 'Ketchup', 'Mayonnaise', 'Soy Sauce', 'Peanut Butter', 'Honey', 'Vinegar', 'Lentils'],
    'Frozen': ['Frozen Peas', 'Frozen Pizza', 'Ice Cream', 'Frozen Waffles', 'Frozen Berries', 'Frozen French Fries', 'Frozen Spinach', 'Frozen Corn', 'Frozen Chicken Nuggets', 'Frozen Edamame']
  };

  for (const cat of categories) {
    const items = baseNames[cat];
    const catEmoji = emojis[categories.indexOf(cat)];
    for (const name of items) {
      products.push({
        name: name,
        category: cat,
        image_url: catEmoji
      });
    }
  }
  
  return products;
};

async function seed() {
  console.log('Generating 100 products...');
  const newProducts = generateProducts();
  
  console.log('Fetching default provider...');
  let { data: defaultProvider } = await supabase
    .from('providers')
    .select('id')
    .eq('name', 'Smart Grocery (Tech Park)')
    .single();

  if (!defaultProvider) {
    const { data: newProv } = await supabase.from('providers').insert({
      name: 'Smart Grocery (Tech Park)',
      location: 'Tech Park'
    }).select().single();
    defaultProvider = newProv;
  }

  console.log('Inserting products into database...');
  for (const p of newProducts) {
    const price = Math.floor(Math.random() * (500 - 20 + 1) + 20);
    const stock = Math.floor(Math.random() * (100 - 10 + 1) + 10);

    // 1. Insert product (including dummy price/stock to satisfy old table constraints)
    const { data: productData, error: prodErr } = await supabase
      .from('products')
      .insert({
        name: p.name,
        category: p.category,
        image_url: p.image_url,
        price: price,
        stock_quantity: stock
      })
      .select().single();

    if (prodErr) {
      console.error('Error inserting product:', p.name, prodErr.message);
      continue;
    }

    // 2. Insert inventory mapping
    const { error: invErr } = await supabase
      .from('provider_inventory')
      .insert({
        product_id: productData.id,
        provider_id: defaultProvider!.id,
        price: price,
        stock_quantity: stock
      });

    if (invErr) {
      console.error('Error inserting inventory:', p.name, invErr.message);
    }
  }

  console.log('Successfully seeded 100 products!');
}

seed();
