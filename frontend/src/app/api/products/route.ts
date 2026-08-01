import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const fallbackProducts = [
  // 🍎 Fruits
  { name: 'Red Delicious Apple', category: 'Fruits', price: 150, image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg' },
  { name: 'Fresh Robusta Banana', category: 'Fruits', price: 60, image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg' },
  { name: 'Alphonso Mango', category: 'Fruits', price: 200, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Haden_mango_aa.jpg' },
  { name: 'Nagpur Oranges', category: 'Fruits', price: 120, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg' },
  { name: 'Black Seedless Grapes', category: 'Fruits', price: 90, image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Kyoho-grape.jpg' },
  { name: 'Fresh Strawberries', category: 'Fruits', price: 250, image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Strawberries.jpg' },
  { name: 'Sweet Watermelon', category: 'Fruits', price: 80, image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Watermelon-slice.jpg' },

  // 🥦 Vegetables
  { name: 'Fresh Hybrid Tomato', category: 'Vegetables', price: 40, image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg' },
  { name: 'New Crop Potato', category: 'Vegetables', price: 30, image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patatas.jpg' },
  { name: 'Red Onion', category: 'Vegetables', price: 35, image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG' },
  { name: 'Organic Carrot', category: 'Vegetables', price: 50, image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Vegetable-Carrots.jpg' },
  { name: 'Fresh Spinach Bunch', category: 'Vegetables', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Spinach_leaves.jpg' },
  { name: 'Green Broccoli', category: 'Vegetables', price: 150, image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Broccoli_and_cross_section_edit.jpg' },
  { name: 'Fresh Cucumber', category: 'Vegetables', price: 30, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Cucumbers_anim.gif' },

  // 🥛 Dairy
  { name: 'Full Cream Milk 1L', category: 'Dairy', price: 66, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Glass_of_Milk_%283367496550%29.jpg' },
  { name: 'Toned Milk', category: 'Dairy', price: 54, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Glass_of_Milk_%283367496550%29.jpg' },
  { name: 'Amul Salted Butter', category: 'Dairy', price: 55, image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_piemontesi_butter.jpg' },
  { name: 'Salted Butter', category: 'Dairy', price: 55, image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_piemontesi_butter.jpg' },
  { name: 'Amul Processed Cheese Slices', category: 'Dairy', price: 150, image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Cheddar_cheese_3.jpg' },
  { name: 'Cheddar Cheese', category: 'Dairy', price: 150, image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Cheddar_cheese_3.jpg' },
  { name: 'Mozzarella Cheese', category: 'Dairy', price: 200, image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Cheddar_cheese_3.jpg' },
  { name: 'Fresh Malai Paneer 200g', category: 'Dairy', price: 90, image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Paneer_cubes.jpg' },
  { name: 'Paneer 200g', category: 'Dairy', price: 90, image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Paneer_cubes.jpg' },
  { name: 'Fresh Curd', category: 'Dairy', price: 40, image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yogurt_in_a_bowl.jpg' },
  { name: 'Greek Plain Yogurt', category: 'Dairy', price: 80, image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yogurt_in_a_bowl.jpg' },
  { name: 'Greek Yogurt', category: 'Dairy', price: 80, image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yogurt_in_a_bowl.jpg' },
  { name: 'Brown Eggs (6 Pack)', category: 'Dairy', price: 60, image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_egg_2009-06-04.jpg' },

  // 🍞 Bakery
  { name: 'Classic White Bread', category: 'Bakery', price: 40, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'White Bread', category: 'Bakery', price: 40, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'Healthy Brown Bread', category: 'Bakery', price: 50, image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&q=80' },
  { name: 'Brown Bread', category: 'Bakery', price: 50, image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&q=80' },
  { name: '100% Multigrain Bread', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80' },
  { name: 'Multigrain Bread', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80' },
  { name: 'French Butter Croissant', category: 'Bakery', price: 80, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
  { name: 'Butter Croissant', category: 'Bakery', price: 80, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
  { name: 'Rich Chocolate Muffin', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80' },
  { name: 'Chocolate Muffin', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80' },
  { name: 'Blueberry Muffin', category: 'Bakery', price: 70, image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
  { name: 'Burger Buns (4 Pcs)', category: 'Bakery', price: 40, image_url: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&q=80' },
  { name: 'Choco Chip Cookies', category: 'Bakery', price: 50, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80' },
  { name: 'Oatmeal Cookies', category: 'Bakery', price: 45, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
  { name: 'Fruit Cake', category: 'Bakery', price: 90, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },

  // 🥩 Meat
  { name: 'Fresh Chicken Breast 500g', category: 'Meat', price: 280, image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Raw_chicken_breast.jpg' },
  { name: 'Chicken Curry Cut 1kg', category: 'Meat', price: 450, image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Raw_chicken_breast.jpg' },
  { name: 'Fresh Mutton Keema 500g', category: 'Meat', price: 650, image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Minced_meat.jpg' },
  { name: 'Fresh Rohu Fish 1kg', category: 'Meat', price: 300, image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Fish_market_fish.jpg' },

  // 🫒 Oils & Fats
  { name: 'Fortune Sunflower Oil 1L', category: 'Oils', price: 140, image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sunflower_oil_and_sunflower.jpg' },
  { name: 'Borges Extra Virgin Olive Oil 500ml', category: 'Oils', price: 450, image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Olive_oil_bottle.jpg' },
  { name: 'Dabur Kachi Ghani Mustard Oil 1L', category: 'Oils', price: 160, image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sunflower_oil_and_sunflower.jpg' },
  { name: 'Parachute Pure Coconut Oil 500ml', category: 'Oils', price: 200, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Coconut_oil.jpg' },
  { name: 'Pure Cow Ghee 500g', category: 'Oils', price: 350, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Ghee_in_a_jar.jpg' },

  // 🍚 Grains & Rice
  { name: 'India Gate Basmati Rice 1kg', category: 'Grains', price: 120, image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Basmati_Rice_raw.jpg' },
  { name: 'Sona Masoori Rice 5kg', category: 'Grains', price: 300, image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Basmati_Rice_raw.jpg' },
  { name: 'Aashirvaad Shudh Chakki Atta 5kg', category: 'Grains', price: 220, image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Wheat_flour.jpg' },
  { name: 'Tata Sampann Toor Dal 1kg', category: 'Grains', price: 160, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Toor_dal.jpg' },

  // ☕ Beverages
  { name: 'Tropicana 100% Orange Juice 1L', category: 'Beverages', price: 130, image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Orange_juice_1.jpg' },
  { name: 'Nescafe Cold Coffee 250ml', category: 'Beverages', price: 65, image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG' },
  { name: 'Tata Tea Gold 500g', category: 'Beverages', price: 280, image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Black_tea_cup.jpg' },
  { name: 'Red Bull Energy Drink 250ml', category: 'Beverages', price: 125, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Red_Bull_can.jpg' },
  { name: 'Coca-Cola Original 750ml', category: 'Beverages', price: 45, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Coca-Cola_Can.jpg' },
  { name: 'Organic Green Tea 25 Bags', category: 'Beverages', price: 180, image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Black_tea_cup.jpg' },

  // 🍪 Snacks & Biscuits
  { name: 'Kurkure Masala Munch', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Kurkure Green Chutney Style', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Lays Classic Salted Chips', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Lays India Magic Masala', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Lays American Style Cream & Onion', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Lays Spanish Tomato Tango', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Oreo Chocolate Cream Biscuits', category: 'Snacks', price: 40, image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Oreo-Two-Cookies.jpg' },
  { name: 'Britannia JimJam Biscuits', category: 'Snacks', price: 35, image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Jam_biscuits.jpg' },
  { name: 'Parle-G Gold Biscuits', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Butter_cookies.jpg' },
  { name: 'Britannia Good Day Butter Cookies', category: 'Snacks', price: 30, image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Butter_cookies.jpg' },
  { name: 'Sunfeast Dark Fantasy Choco Fills', category: 'Snacks', price: 50, image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chocolate_chip_cookies.jpg' },
  { name: 'Bingo Mad Angles Very Peri Peri', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Doritos Nacho Cheese Tortilla Chips', category: 'Snacks', price: 30, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Pringles Sour Cream & Onion', category: 'Snacks', price: 110, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Cheetos Cheese Puffs', category: 'Snacks', price: 20, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Britannia Bourbon Chocolate Biscuits', category: 'Snacks', price: 30, image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chocolate_chip_cookies.jpg' },
  { name: 'Parle Hide & Seek Choco Chip', category: 'Snacks', price: 40, image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chocolate_chip_cookies.jpg' },
  { name: 'Haldiram Aloo Bhujia 200g', category: 'Snacks', price: 50, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Haldiram Khatta Meetha Mixture', category: 'Snacks', price: 55, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { name: 'Act II Golden Butter Popcorn', category: 'Snacks', price: 25, image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Popcorn_in_bowl.jpg' },
  { name: 'Snickers Peanut Chocolate Bar', category: 'Snacks', price: 50, image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Snickers_broken.jpg' },
  { name: 'Cadbury Dairy Milk Silk Chocolate', category: 'Snacks', price: 90, image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Snickers_broken.jpg' },
  { name: 'KitKat 4-Finger Chocolate Wafers', category: 'Snacks', price: 40, image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Snickers_broken.jpg' },
  { name: 'Roasted Salted Almonds 200g', category: 'Snacks', price: 220, image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Almonds.jpg' },
  { name: 'Premium Whole Cashews 200g', category: 'Snacks', price: 280, image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Cashew_nuts.jpg' },
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

    // Merge fallback products to guarantee full category coverage and working images
    fallbackProducts.forEach((fp, idx) => {
      const catLower = fp.category.toLowerCase();
      const existingName = formatted.find((p: any) => p.name.toLowerCase() === fp.name.toLowerCase());
      if (!existingName) {
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
