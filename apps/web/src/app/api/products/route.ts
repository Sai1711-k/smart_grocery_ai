import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const fallbackProducts = [
  // 🍎 Fruits
  { name: 'Red Delicious Apple', category: 'Fruits', price: 150, image_url: "/images/products/Red_Delicious_Apple.png" },
  { name: 'Fresh Robusta Banana', category: 'Fruits', price: 60, image_url: "/images/products/Fresh_Robusta_Banana.png" },
  { name: 'Alphonso Mango', category: 'Fruits', price: 200, image_url: "/images/products/Alphonso_Mango.png" },
  { name: 'Nagpur Oranges', category: 'Fruits', price: 120, image_url: "/images/products/Nagpur_Oranges.png" },
  { name: 'Black Seedless Grapes', category: 'Fruits', price: 90, image_url: "/images/products/Black_Seedless_Grapes.png" },
  { name: 'Fresh Strawberries', category: 'Fruits', price: 250, image_url: "/images/products/Fresh_Strawberries.png" },
  { name: 'Sweet Watermelon', category: 'Fruits', price: 80, image_url: "/images/products/Sweet_Watermelon.png" },

  // 🥦 Vegetables
  { name: 'Fresh Hybrid Tomato', category: 'Vegetables', price: 40, image_url: "/images/products/Fresh_Hybrid_Tomato.png" },
  { name: 'New Crop Potato', category: 'Vegetables', price: 30, image_url: "/images/products/New_Crop_Potato.png" },
  { name: 'Red Onion', category: 'Vegetables', price: 35, image_url: "/images/products/Red_Onion.png" },
  { name: 'Organic Carrot', category: 'Vegetables', price: 50, image_url: "/images/products/Organic_Carrot.png" },
  { name: 'Fresh Spinach Bunch', category: 'Vegetables', price: 20, image_url: "/images/products/Fresh_Spinach_Bunch.png" },
  { name: 'Green Broccoli', category: 'Vegetables', price: 150, image_url: "/images/products/Green_Broccoli.png" },
  { name: 'Fresh Cucumber', category: 'Vegetables', price: 30, image_url: "/images/products/Fresh_Cucumber.png" },

  // 🥛 Dairy
  { name: 'Full Cream Milk 1L', category: 'Dairy', price: 66, image_url: "/images/products/Full_Cream_Milk_1L.png" },
  { name: 'Toned Milk', category: 'Dairy', price: 54, image_url: "/images/products/Toned_Milk.png" },
  { name: 'Amul Salted Butter', category: 'Dairy', price: 55, image_url: "/images/products/Amul_Salted_Butter.png" },
  { name: 'Salted Butter', category: 'Dairy', price: 55, image_url: "/images/products/Salted_Butter.png" },
  { name: 'Amul Processed Cheese Slices', category: 'Dairy', price: 150, image_url: "/images/products/Amul_Processed_Cheese_Slices.png" },
  { name: 'Cheddar Cheese', category: 'Dairy', price: 150, image_url: "/images/products/Cheddar_Cheese.png" },
  { name: 'Mozzarella Cheese', category: 'Dairy', price: 200, image_url: "/images/products/Mozzarella_Cheese.png" },
  { name: 'Fresh Malai Paneer 200g', category: 'Dairy', price: 90, image_url: "/images/products/Fresh_Malai_Paneer_200g.png" },
  { name: 'Paneer 200g', category: 'Dairy', price: 90, image_url: "/images/products/Paneer_200g.png" },
  { name: 'Fresh Curd', category: 'Dairy', price: 40, image_url: "/images/products/Fresh_Curd.png" },
  { name: 'Greek Plain Yogurt', category: 'Dairy', price: 80, image_url: "/images/products/Greek_Plain_Yogurt.png" },
  { name: 'Greek Yogurt', category: 'Dairy', price: 80, image_url: "/images/products/Greek_Yogurt.png" },
  { name: 'Brown Eggs (6 Pack)', category: 'Dairy', price: 60, image_url: "/images/products/Brown_Eggs_6_Pack.png" },

  // 🍞 Bakery
  { name: 'Classic White Bread', category: 'Bakery', price: 40, image_url: "/images/products/Classic_White_Bread.png" },
  { name: 'White Bread', category: 'Bakery', price: 40, image_url: "/images/products/White_Bread.png" },
  { name: 'Healthy Brown Bread', category: 'Bakery', price: 50, image_url: "/images/products/Brown_Bread.png" },
  { name: 'Brown Bread', category: 'Bakery', price: 50, image_url: "/images/products/Brown_Bread.png" },
  { name: '100% Multigrain Bread', category: 'Bakery', price: 60, image_url: "/images/products/100_Multigrain_Bread.png" },
  { name: 'Multigrain Bread', category: 'Bakery', price: 60, image_url: "/images/products/Multigrain_Bread.png" },
  { name: 'French Butter Croissant', category: 'Bakery', price: 80, image_url: "/images/products/Butter_Croissant.png" },
  { name: 'Butter Croissant', category: 'Bakery', price: 80, image_url: "/images/products/Butter_Croissant.png" },
  { name: 'Rich Chocolate Muffin', category: 'Bakery', price: 60, image_url: "/images/products/Chocolate_Muffin.png" },
  { name: 'Chocolate Muffin', category: 'Bakery', price: 60, image_url: "/images/products/Chocolate_Muffin.png" },
  { name: 'Blueberry Muffin', category: 'Bakery', price: 70, image_url: "/images/products/Blueberry_Muffin.png" },
  { name: 'Burger Buns (4 Pcs)', category: 'Bakery', price: 40, image_url: "/images/products/Burger_Buns_4_Pcs.png" },
  { name: 'Choco Chip Cookies', category: 'Bakery', price: 50, image_url: "/images/products/Choco_Chip_Cookies.png" },
  { name: 'Oatmeal Cookies', category: 'Bakery', price: 45, image_url: "/images/products/Oatmeal_Cookies.png" },
  { name: 'Fruit Cake', category: 'Bakery', price: 90, image_url: "/images/products/Fruit_Cake.png" },

  // 🥩 Meat
  { name: 'Fresh Chicken Breast 500g', category: 'Meat', price: 280, image_url: "/images/products/Fresh_Chicken_Breast_500g.png" },
  { name: 'Chicken Curry Cut 1kg', category: 'Meat', price: 450, image_url: "/images/products/Chicken_Curry_Cut_1kg.png" },
  { name: 'Fresh Mutton Keema 500g', category: 'Meat', price: 650, image_url: "/images/products/Fresh_Mutton_Keema_500g.png" },
  { name: 'Fresh Rohu Fish 1kg', category: 'Meat', price: 300, image_url: "/images/products/Fresh_Rohu_Fish_1kg.png" },

  // 🫒 EDIBLE COOKING OILS & GHEE (NO COSMETICS / REAL FOOD PHOTOS)
  { name: 'Fortune Sunflower Oil 1L', category: 'Oils', price: 140, image_url: "/images/products/Fortune_Sunflower_Oil_1L.png" },
  { name: 'Sunflower Oil 1L', category: 'Oils', price: 140, image_url: "/images/products/Sunflower_Oil_1L.png" },
  { name: 'Borges Extra Virgin Olive Oil 500ml', category: 'Oils', price: 450, image_url: "/images/products/Borges_Extra_Virgin_Olive_Oil_500ml.png" },
  { name: 'Dabur Kachi Ghani Mustard Oil 1L', category: 'Oils', price: 160, image_url: "/images/products/Dabur_Kachi_Ghani_Mustard_Oil_1L.png" },
  { name: 'Parachute Pure Coconut Oil 500ml', category: 'Oils', price: 200, image_url: "/images/products/Coconut_Oil_500ml.png" },
  { name: 'Coconut Oil 500ml', category: 'Oils', price: 200, image_url: "/images/products/Coconut_Oil_500ml.png" },
  { name: 'Groundnut Oil 1L', category: 'Oils', price: 180, image_url: "/images/products/Groundnut_Oil_1L.png" },
  { name: 'Sesame Oil 500ml', category: 'Oils', price: 250, image_url: "/images/products/Sesame_Oil_500ml.png" },
  { name: 'Pure Cow Ghee 500g', category: 'Oils', price: 350, image_url: "/images/products/Pure_Cow_Ghee_500g.png" },

  // 🍚 Grains & Rice & Dal & Oats (ACCURATE RAW FOOD PHOTOS)
  { name: 'Quinoa 500g', category: 'Grains', price: 320, image_url: "/images/products/Quinoa_500g.png" },
  { name: 'India Gate Basmati Rice 1kg', category: 'Grains', price: 120, image_url: "/images/products/India_Gate_Basmati_Rice_1kg.png" },
  { name: 'Sona Masoori Rice 5kg', category: 'Grains', price: 300, image_url: "/images/products/Sona_Masoori_Rice_5kg.png" },
  { name: 'Aashirvaad Shudh Chakki Atta 5kg', category: 'Grains', price: 220, image_url: "/images/products/Aashirvaad_Shudh_Chakki_Atta_5kg.png" },
  { name: 'Whole Wheat Atta 5kg', category: 'Grains', price: 220, image_url: "/images/products/Whole_Wheat_Atta_5kg.png" },
  { name: 'Tata Sampann Toor Dal 1kg', category: 'Grains', price: 160, image_url: "/images/products/Tata_Sampann_Toor_Dal_1kg.png" },
  { name: 'Toor Dal 1kg', category: 'Grains', price: 160, image_url: "/images/products/Toor_Dal_1kg.png" },
  { name: 'Moong Dal 1kg', category: 'Grains', price: 130, image_url: "/images/products/Moong_Dal_1kg.png" },
  { name: 'Chana Dal 1kg', category: 'Grains', price: 90, image_url: "/images/products/Chana_Dal_1kg.png" },
  { name: 'Rolled Oats 1kg', category: 'Grains', price: 180, image_url: "/images/products/Rolled_Oats_1kg.png" },

  // ☕ Beverages
  { name: 'Tropicana 100% Orange Juice 1L', category: 'Beverages', price: 130, image_url: "/images/products/Tropicana_100_Orange_Juice_1L.png" },
  { name: 'Nescafe Cold Coffee 250ml', category: 'Beverages', price: 65, image_url: "/images/products/Nescafe_Cold_Coffee_250ml.png" },
  { name: 'Tata Tea Gold 500g', category: 'Beverages', price: 280, image_url: "/images/products/Tata_Tea_Gold_500g.png" },
  { name: 'Red Bull Energy Drink 250ml', category: 'Beverages', price: 125, image_url: "/images/products/Red_Bull_Energy_Drink_250ml.png" },
  { name: 'Coca-Cola Original 750ml', category: 'Beverages', price: 45, image_url: "/images/products/Coca_Cola_Original_750ml.png" },
  { name: 'Organic Green Tea 25 Bags', category: 'Beverages', price: 180, image_url: "/images/products/Organic_Green_Tea_25_Bags.png" },

  // 🍪 Snacks & Biscuits (EVERY BRAND HAS ITS OWN UNIQUE PHOTO)
  { name: 'Kurkure Masala Munch', category: 'Snacks', price: 20, image_url: "/images/products/Kurkure_Masala_Munch.png" },
  { name: 'Kurkure Green Chutney Style', category: 'Snacks', price: 20, image_url: "/images/products/Kurkure_Green_Chutney_Style.png" },
  { name: 'Lays Classic Salted Chips', category: 'Snacks', price: 20, image_url: "/images/products/Lays_Classic_Salted_Chips.png" },
  { name: 'Lays India Magic Masala', category: 'Snacks', price: 20, image_url: "/images/products/Lays_India_Magic_Masala.png" },
  { name: 'Lays American Style Cream & Onion', category: 'Snacks', price: 20, image_url: "/images/products/Lays_American_Style_Cream_Onion.png" },
  { name: 'Lays Spanish Tomato Tango', category: 'Snacks', price: 20, image_url: "/images/products/Lays_Spanish_Tomato_Tango.png" },
  { name: 'Oreo Chocolate Cream Biscuits', category: 'Snacks', price: 40, image_url: "/images/products/Oreo_Chocolate_Cream_Biscuits.png" },
  { name: 'Britannia JimJam Biscuits', category: 'Snacks', price: 35, image_url: "/images/products/Britannia_JimJam_Biscuits.png" },
  { name: 'Parle-G Gold Biscuits', category: 'Snacks', price: 20, image_url: "/images/products/Parle_G_Gold_Biscuits.png" },
  { name: 'Britannia Good Day Butter Cookies', category: 'Snacks', price: 30, image_url: "/images/products/Britannia_Good_Day_Butter_Cookies.png" },
  { name: 'Sunfeast Dark Fantasy Choco Fills', category: 'Snacks', price: 50, image_url: "/images/products/Sunfeast_Dark_Fantasy_Choco_Fills.png" },
  { name: 'Bingo Mad Angles Very Peri Peri', category: 'Snacks', price: 20, image_url: "/images/products/Bingo_Mad_Angles_Very_Peri_Peri.png" },
  { name: 'Doritos Nacho Cheese Tortilla Chips', category: 'Snacks', price: 30, image_url: "/images/products/Doritos_Nacho_Cheese_Tortilla_Chips.png" },
  { name: 'Pringles Sour Cream & Onion', category: 'Snacks', price: 110, image_url: "/images/products/Pringles_Sour_Cream_Onion.png" },
  { name: 'Cheetos Cheese Puffs', category: 'Snacks', price: 20, image_url: "/images/products/Cheetos_Cheese_Puffs.png" },
  { name: 'Britannia Bourbon Chocolate Biscuits', category: 'Snacks', price: 30, image_url: "/images/products/Britannia_Bourbon_Chocolate_Biscuits.png" },
  { name: 'Parle Hide & Seek Choco Chip', category: 'Snacks', price: 40, image_url: "/images/products/Parle_Hide_Seek_Choco_Chip.png" },
  { name: 'Haldiram Aloo Bhujia 200g', category: 'Snacks', price: 50, image_url: "/images/products/Haldiram_Aloo_Bhujia_200g.png" },
  { name: 'Haldiram Khatta Meetha Mixture', category: 'Snacks', price: 55, image_url: "/images/products/Haldiram_Khatta_Meetha_Mixture.png" },
  { name: 'Act II Golden Butter Popcorn', category: 'Snacks', price: 25, image_url: "/images/products/Act_II_Golden_Butter_Popcorn.png" },
  { name: 'Snickers Peanut Chocolate Bar', category: 'Snacks', price: 50, image_url: "/images/products/Snickers_Peanut_Chocolate_Bar.png" },
  { name: 'Cadbury Dairy Milk Silk Chocolate', category: 'Snacks', price: 90, image_url: "/images/products/Cadbury_Dairy_Milk_Silk_Chocolate.png" },
  { name: 'KitKat 4-Finger Chocolate Wafers', category: 'Snacks', price: 40, image_url: "/images/products/KitKat_4_Finger_Chocolate_Wafers.png" },
  { name: 'Roasted Salted Almonds 200g', category: 'Snacks', price: 220, image_url: "/images/products/Roasted_Salted_Almonds_200g.png" },
  { name: 'Premium Whole Cashews 200g', category: 'Snacks', price: 280, image_url: "/images/products/Premium_Whole_Cashews_200g.png" },
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
