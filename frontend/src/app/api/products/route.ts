import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const fallbackProducts = [
  // 🍎 Fruits
  { name: 'Red Delicious Apple', category: 'Fruits', price: 150, image_url: '/images/products/01_Red%20Delicious%20Apple.png' },
  { name: 'Fresh Robusta Banana', category: 'Fruits', price: 60, image_url: '/images/products/02_Fresh%20Robusta%20Banana.png' },
  { name: 'Alphonso Mango', category: 'Fruits', price: 200, image_url: '/images/products/03_Alphonso%20Mango.png' },
  { name: 'Nagpur Oranges', category: 'Fruits', price: 120, image_url: '/images/products/04_Nagpur%20Oranges.png' },
  { name: 'Black Seedless Grapes', category: 'Fruits', price: 90, image_url: '/images/products/05_Black%20Seedless%20Grapes.png' },
  { name: 'Fresh Strawberries', category: 'Fruits', price: 250, image_url: '/images/products/06_Fresh%20Strawberries.png' },
  { name: 'Sweet Watermelon', category: 'Fruits', price: 80, image_url: '/images/products/07_Sweet%20Watermelon.png' },

  // 🥦 Vegetables
  { name: 'Fresh Hybrid Tomato', category: 'Vegetables', price: 40, image_url: '/images/products/08_Fresh%20Hybrid%20Tomato.png' },
  { name: 'New Crop Potato', category: 'Vegetables', price: 30, image_url: '/images/products/09_New%20Crop%20Potato.png' },
  { name: 'Red Onion', category: 'Vegetables', price: 35, image_url: '/images/products/10_Red%20Onion.png' },
  { name: 'Organic Carrot', category: 'Vegetables', price: 50, image_url: '/images/products/11_Organic%20Carrot.png' },
  { name: 'Fresh Spinach Bunch', category: 'Vegetables', price: 20, image_url: '/images/products/12_Fresh%20Spinach%20Bunch.png' },
  { name: 'Green Broccoli', category: 'Vegetables', price: 150, image_url: '/images/products/13_Green%20Broccoli.png' },
  { name: 'Fresh Cucumber', category: 'Vegetables', price: 30, image_url: '/images/products/14_Fresh%20Cucumber.png' },

  // 🥛 Dairy
  { name: 'Full Cream Milk 1L', category: 'Dairy', price: 66, image_url: '/images/products/15_Full%20Cream%20Milk%201L.png' },
  { name: 'Toned Milk', category: 'Dairy', price: 54, image_url: '/images/products/16_Toned%20Milk.png' },
  { name: 'Amul Salted Butter', category: 'Dairy', price: 55, image_url: '/images/products/17_Amul%20Salted%20Butter.png' },
  { name: 'Salted Butter', category: 'Dairy', price: 55, image_url: '/images/products/18_Salted%20Butter.png' },
  { name: 'Amul Processed Cheese Slices', category: 'Dairy', price: 150, image_url: '/images/products/19_Amul%20Processed%20Cheese%20Slices.png' },
  { name: 'Cheddar Cheese', category: 'Dairy', price: 150, image_url: '/images/products/20_Cheddar%20Cheese.png' },
  { name: 'Mozzarella Cheese', category: 'Dairy', price: 200, image_url: '/images/products/21_Mozzarella%20Cheese.png' },
  { name: 'Fresh Malai Paneer 200g', category: 'Dairy', price: 90, image_url: '/images/products/22_Fresh%20Malai%20Paneer%20200g.png' },
  { name: 'Paneer 200g', category: 'Dairy', price: 90, image_url: '/images/products/23_Paneer%20200g.png' },
  { name: 'Fresh Curd', category: 'Dairy', price: 40, image_url: '/images/products/24_Fresh%20Curd.png' },
  { name: 'Greek Plain Yogurt', category: 'Dairy', price: 80, image_url: '/images/products/25_Greek%20Plain%20Yogurt.png' },
  { name: 'Greek Yogurt', category: 'Dairy', price: 80, image_url: '/images/products/26_Greek%20Yogurt.png' },
  { name: 'Brown Eggs (6 Pack)', category: 'Dairy', price: 60, image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80' },

  // 🍞 Bakery
  { name: 'Classic White Bread', category: 'Bakery', price: 40, image_url: '/images/products/28_Classic%20White%20Bread.png' },
  { name: 'White Bread', category: 'Bakery', price: 40, image_url: '/images/products/29_White%20Bread.png' },
  { name: 'Healthy Brown Bread', category: 'Bakery', price: 50, image_url: '/images/products/30_Healthy%20Brown%20Bread.png' },
  { name: 'Brown Bread', category: 'Bakery', price: 50, image_url: '/images/products/31_Brown%20Bread.png' },
  { name: '100% Multigrain Bread', category: 'Bakery', price: 60, image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80' },
  { name: 'Multigrain Bread', category: 'Bakery', price: 60, image_url: '/images/products/33_Multigrain%20Bread.png' },
  { name: 'French Butter Croissant', category: 'Bakery', price: 80, image_url: '/images/products/34_French%20Butter%20Croissant.png' },
  { name: 'Butter Croissant', category: 'Bakery', price: 80, image_url: '/images/products/35_Butter%20Croissant.png' },
  { name: 'Rich Chocolate Muffin', category: 'Bakery', price: 60, image_url: '/images/products/36_Rich%20Chocolate%20Muffin.png' },
  { name: 'Chocolate Muffin', category: 'Bakery', price: 60, image_url: '/images/products/37_Chocolate%20Muffin.png' },
  { name: 'Blueberry Muffin', category: 'Bakery', price: 70, image_url: '/images/products/38_Blueberry%20Muffin.png' },
  { name: 'Burger Buns (4 Pcs)', category: 'Bakery', price: 40, image_url: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&q=80' },
  { name: 'Choco Chip Cookies', category: 'Bakery', price: 50, image_url: '/images/products/40_Choco%20Chip%20Cookies.png' },
  { name: 'Oatmeal Cookies', category: 'Bakery', price: 45, image_url: '/images/products/41_Oatmeal%20Cookies.png' },
  { name: 'Fruit Cake', category: 'Bakery', price: 90, image_url: '/images/products/42_Fruit%20Cake.png' },

  // 🥩 Meat
  { name: 'Fresh Chicken Breast 500g', category: 'Meat', price: 280, image_url: '/images/products/43_Fresh%20Chicken%20Breast%20500g.png' },
  { name: 'Chicken Curry Cut 1kg', category: 'Meat', price: 450, image_url: '/images/products/44_Chicken%20Curry%20Cut%201kg.png' },
  { name: 'Fresh Mutton Keema 500g', category: 'Meat', price: 650, image_url: '/images/products/45_Fresh%20Mutton%20Keema%20500g.png' },
  { name: 'Fresh Rohu Fish 1kg', category: 'Meat', price: 300, image_url: '/images/products/46_Fresh%20Rohu%20Fish%201kg.png' },

  // 🫒 EDIBLE COOKING OILS & GHEE (NO COSMETICS / REAL FOOD PHOTOS)
  { name: 'Fortune Sunflower Oil 1L', category: 'Oils', price: 140, image_url: '/images/products/47_Fortune%20Sunflower%20Oil%201L.png' },
  { name: 'Sunflower Oil 1L', category: 'Oils', price: 140, image_url: '/images/products/48_Sunflower%20Oil%201L.png' },
  { name: 'Borges Extra Virgin Olive Oil 500ml', category: 'Oils', price: 450, image_url: '/images/products/49_Borges%20Extra%20Virgin%20Olive%20Oil%20500ml.png' },
  { name: 'Dabur Kachi Ghani Mustard Oil 1L', category: 'Oils', price: 160, image_url: '/images/products/50_Dabur%20Kachi%20Ghani%20Mustard%20Oil%201L.png' },
  { name: 'Parachute Pure Coconut Oil 500ml', category: 'Oils', price: 200, image_url: '/images/products/51_Parachute%20Pure%20Coconut%20Oil%20500ml.png' },
  { name: 'Coconut Oil 500ml', category: 'Oils', price: 200, image_url: '/images/products/52_Coconut%20Oil%20500ml.png' },
  { name: 'Groundnut Oil 1L', category: 'Oils', price: 180, image_url: '/images/products/53_Groundnut%20Oil%201L.png' },
  { name: 'Sesame Oil 500ml', category: 'Oils', price: 250, image_url: '/images/products/54_Sesame%20Oil%20500ml.png' },
  { name: 'Pure Cow Ghee 500g', category: 'Oils', price: 350, image_url: '/images/products/55_Pure%20Cow%20Ghee%20500g.png' },

  // 🍚 Grains & Rice & Dal & Oats (ACCURATE RAW FOOD PHOTOS)
  { name: 'Quinoa 500g', category: 'Grains', price: 320, image_url: '/images/products/56_Quinoa%20500g.png' },
  { name: 'India Gate Basmati Rice 1kg', category: 'Grains', price: 120, image_url: '/images/products/57_India%20Gate%20Basmati%20Rice%201kg.png' },
  { name: 'Sona Masoori Rice 5kg', category: 'Grains', price: 300, image_url: '/images/products/58_Sona%20Masoori%20Rice%205kg.png' },
  { name: 'Aashirvaad Shudh Chakki Atta 5kg', category: 'Grains', price: 220, image_url: '/images/products/59_Aashirvaad%20Shudh%20Chakki%20Atta%205kg.png' },
  { name: 'Whole Wheat Atta 5kg', category: 'Grains', price: 220, image_url: '/images/products/60_Whole%20Wheat%20Atta%205kg.png' },
  { name: 'Tata Sampann Toor Dal 1kg', category: 'Grains', price: 160, image_url: '/images/products/61_Tata%20Sampann%20Toor%20Dal%201kg.png' },
  { name: 'Toor Dal 1kg', category: 'Grains', price: 160, image_url: '/images/products/62_Toor%20Dal%201kg.png' },
  { name: 'Moong Dal 1kg', category: 'Grains', price: 130, image_url: '/images/products/63_Moong%20Dal%201kg.png' },
  { name: 'Chana Dal 1kg', category: 'Grains', price: 90, image_url: '/images/products/64_Chana%20Dal%201kg.png' },
  { name: 'Rolled Oats 1kg', category: 'Grains', price: 180, image_url: '/images/products/65_Rolled%20Oats%201kg.png' },

  // ☕ Beverages
  { name: 'Tropicana 100% Orange Juice 1L', category: 'Beverages', price: 130, image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
  { name: 'Nescafe Cold Coffee 250ml', category: 'Beverages', price: 65, image_url: '/images/products/67_Nescafe%20Cold%20Coffee%20250ml.png' },
  { name: 'Tata Tea Gold 500g', category: 'Beverages', price: 280, image_url: '/images/products/68_Tata%20Tea%20Gold%20500g.png' },
  { name: 'Red Bull Energy Drink 250ml', category: 'Beverages', price: 125, image_url: '/images/products/69_Red%20Bull%20Energy%20Drink%20250ml.png' },
  { name: 'Coca-Cola Original 750ml', category: 'Beverages', price: 45, image_url: '/images/products/70_Coca-Cola%20Original%20750ml.png' },
  { name: 'Organic Green Tea 25 Bags', category: 'Beverages', price: 180, image_url: '/images/products/71_Organic%20Green%20Tea%2025%20Bags.png' },

  // 🍪 Snacks & Biscuits (EVERY BRAND HAS ITS OWN UNIQUE PHOTO)
  { name: 'Kurkure Masala Munch', category: 'Snacks', price: 20, image_url: '/images/products/72_Kurkure%20Masala%20Munch.png' },
  { name: 'Kurkure Green Chutney Style', category: 'Snacks', price: 20, image_url: '/images/products/73_Kurkure%20Green%20Chutney%20Style.png' },
  { name: 'Lays Classic Salted Chips', category: 'Snacks', price: 20, image_url: '/images/products/74_Lays%20Classic%20Salted%20Chips.png' },
  { name: 'Lays India Magic Masala', category: 'Snacks', price: 20, image_url: '/images/products/75_Lays%20India%20Magic%20Masala.png' },
  { name: 'Lays American Style Cream & Onion', category: 'Snacks', price: 20, image_url: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=400&q=80' },
  { name: 'Lays Spanish Tomato Tango', category: 'Snacks', price: 20, image_url: '/images/products/77_Lays%20Spanish%20Tomato%20Tango.png' },
  { name: 'Oreo Chocolate Cream Biscuits', category: 'Snacks', price: 40, image_url: '/images/products/78_Oreo%20Chocolate%20Cream%20Biscuits.png' },
  { name: 'Britannia JimJam Biscuits', category: 'Snacks', price: 35, image_url: '/images/products/79_Britannia%20JimJam%20Biscuits.png' },
  { name: 'Parle-G Gold Biscuits', category: 'Snacks', price: 20, image_url: '/images/products/80_Parle-G%20Gold%20Biscuits.png' },
  { name: 'Britannia Good Day Butter Cookies', category: 'Snacks', price: 30, image_url: '/images/products/81_Britannia%20Good%20Day%20Butter%20Cookies.png' },
  { name: 'Sunfeast Dark Fantasy Choco Fills', category: 'Snacks', price: 50, image_url: '/images/products/82_Sunfeast%20Dark%20Fantasy%20Choco%20Fills.png' },
  { name: 'Bingo Mad Angles Very Peri Peri', category: 'Snacks', price: 20, image_url: '/images/products/83_Bingo%20Mad%20Angles%20Very%20Peri%20Peri.png' },
  { name: 'Doritos Nacho Cheese Tortilla Chips', category: 'Snacks', price: 30, image_url: '/images/products/84_Doritos%20Nacho%20Cheese%20Tortilla%20Chips.png' },
  { name: 'Pringles Sour Cream & Onion', category: 'Snacks', price: 110, image_url: 'https://images.unsplash.com/photo-1576643958047-981101789e9b?w=400&q=80' },
  { name: 'Cheetos Cheese Puffs', category: 'Snacks', price: 20, image_url: '/images/products/86_Cheetos%20Cheese%20Puffs.png' },
  { name: 'Britannia Bourbon Chocolate Biscuits', category: 'Snacks', price: 30, image_url: '/images/products/87_Britannia%20Bourbon%20Chocolate%20Biscuits.png' },
  { name: 'Parle Hide & Seek Choco Chip', category: 'Snacks', price: 40, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80' },
  { name: 'Haldiram Aloo Bhujia 200g', category: 'Snacks', price: 50, image_url: '/images/products/89_Haldiram%20Aloo%20Bhujia%20200g.png' },
  { name: 'Haldiram Khatta Meetha Mixture', category: 'Snacks', price: 55, image_url: '/images/products/90_Haldiram%20Khatta%20Meetha%20Mixture.png' },
  { name: 'Act II Golden Butter Popcorn', category: 'Snacks', price: 25, image_url: '/images/products/91_Act%20II%20Golden%20Butter%20Popcorn.png' },
  { name: 'Snickers Peanut Chocolate Bar', category: 'Snacks', price: 50, image_url: '/images/products/92_Snickers%20Peanut%20Chocolate%20Bar.png' },
  { name: 'Cadbury Dairy Milk Silk Chocolate', category: 'Snacks', price: 90, image_url: '/images/products/93_Cadbury%20Dairy%20Milk%20Silk%20Chocolate.png' },
  { name: 'KitKat 4-Finger Chocolate Wafers', category: 'Snacks', price: 40, image_url: '/images/products/94_KitKat%204-Finger%20Chocolate%20Wafers.png' },
  { name: 'Roasted Salted Almonds 200g', category: 'Snacks', price: 220, image_url: '/images/products/95_Roasted%20Salted%20Almonds%20200g.png' },
  { name: 'Premium Whole Cashews 200g', category: 'Snacks', price: 280, image_url: '/images/products/96_Premium%20Whole%20Cashews%20200g.png' },
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
