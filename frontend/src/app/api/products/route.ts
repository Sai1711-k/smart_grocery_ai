import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const fallbackProducts = [
  // 🍎 Fruits
  { name: 'Red Delicious Apple', category: 'Fruits', price: 150, image_url: '/images/products/01_red_delicious_apple.png' },
  { name: 'Fresh Robusta Banana', category: 'Fruits', price: 60, image_url: '/images/products/fresh_robusta_banana.png' },
  { name: 'Alphonso Mango', category: 'Fruits', price: 200, image_url: '/images/products/alphonso_mango.png' },
  { name: 'Nagpur Oranges', category: 'Fruits', price: 120, image_url: '/images/products/04_nagpur_oranges.png' },
  { name: 'Black Seedless Grapes', category: 'Fruits', price: 90, image_url: '/images/products/05_black_seedless_grapes.png' },
  { name: 'Fresh Strawberries', category: 'Fruits', price: 250, image_url: '/images/products/06_fresh_strawberries.png' },
  { name: 'Sweet Watermelon', category: 'Fruits', price: 80, image_url: '/images/products/07_sweet_watermelon.png' },

  // 🥦 Vegetables
  { name: 'Fresh Hybrid Tomato', category: 'Vegetables', price: 40, image_url: '/images/products/08_fresh_hybrid_tomato.png' },
  { name: 'New Crop Potato', category: 'Vegetables', price: 30, image_url: '/images/products/09_new_crop_potato.png' },
  { name: 'Red Onion', category: 'Vegetables', price: 35, image_url: '/images/products/10_red_onion.png' },
  { name: 'Organic Carrot', category: 'Vegetables', price: 50, image_url: '/images/products/11_organic_carrot.png' },
  { name: 'Fresh Spinach Bunch', category: 'Vegetables', price: 20, image_url: '/images/products/12_fresh_spinach_bunch.png' },
  { name: 'Green Broccoli', category: 'Vegetables', price: 150, image_url: '/images/products/13_green_broccoli.png' },
  { name: 'Fresh Cucumber', category: 'Vegetables', price: 30, image_url: '/images/products/14_fresh_cucumber.png' },

  // 🥛 Dairy
  { name: 'Full Cream Milk 1L', category: 'Dairy', price: 66, image_url: '/images/products/15_full_cream_milk_1l.png' },
  { name: 'Toned Milk', category: 'Dairy', price: 54, image_url: '/images/products/16_toned_milk.png' },
  { name: 'Amul Salted Butter', category: 'Dairy', price: 55, image_url: '/images/products/18_salted_butter.png' },
  { name: 'Salted Butter', category: 'Dairy', price: 55, image_url: '/images/products/18_salted_butter.png' },
  { name: 'Amul Processed Cheese Slices', category: 'Dairy', price: 150, image_url: '/images/products/19_amul_processed_cheese_slices.png' },
  { name: 'Cheddar Cheese', category: 'Dairy', price: 150, image_url: '/images/products/20_cheddar_cheese.png' },
  { name: 'Mozzarella Cheese', category: 'Dairy', price: 200, image_url: '/images/products/21_mozzarella_cheese.png' },
  { name: 'Fresh Malai Paneer 200g', category: 'Dairy', price: 90, image_url: '/images/products/23_paneer_200g.png' },
  { name: 'Paneer 200g', category: 'Dairy', price: 90, image_url: '/images/products/23_paneer_200g.png' },
  { name: 'Fresh Curd', category: 'Dairy', price: 40, image_url: '/images/products/24_fresh_curd.png' },
  { name: 'Greek Plain Yogurt', category: 'Dairy', price: 80, image_url: '/images/products/25_greek_plain_yogurt.png' },
  { name: 'Greek Yogurt', category: 'Dairy', price: 80, image_url: '/images/products/26_greek_yogurt.png' },
  { name: 'Brown Eggs (6 Pack)', category: 'Dairy', price: 60, image_url: '/images/products/27_brown_eggs_6_pack.png' },

  // 🍞 Bakery
  { name: 'Classic White Bread', category: 'Bakery', price: 40, image_url: '/images/products/29_white_bread.png' },
  { name: 'White Bread', category: 'Bakery', price: 40, image_url: '/images/products/29_white_bread.png' },
  { name: 'Healthy Brown Bread', category: 'Bakery', price: 50, image_url: '/images/products/31_brown_bread.png' },
  { name: 'Brown Bread', category: 'Bakery', price: 50, image_url: '/images/products/31_brown_bread.png' },
  { name: '100% Multigrain Bread', category: 'Bakery', price: 60, image_url: '/images/products/33_multigrain_bread.png' },
  { name: 'Multigrain Bread', category: 'Bakery', price: 60, image_url: '/images/products/33_multigrain_bread.png' },
  { name: 'French Butter Croissant', category: 'Bakery', price: 80, image_url: '/images/products/35_butter_croissant.png' },
  { name: 'Butter Croissant', category: 'Bakery', price: 80, image_url: '/images/products/35_butter_croissant.png' },
  { name: 'Rich Chocolate Muffin', category: 'Bakery', price: 60, image_url: '/images/products/37_chocolate_muffin.png' },
  { name: 'Chocolate Muffin', category: 'Bakery', price: 60, image_url: '/images/products/37_chocolate_muffin.png' },
  { name: 'Blueberry Muffin', category: 'Bakery', price: 70, image_url: '/images/products/38_blueberry_muffin.png' },
  { name: 'Burger Buns (4 Pcs)', category: 'Bakery', price: 40, image_url: '/images/products/39_burger_buns_4_pcs.png' },
  { name: 'Choco Chip Cookies', category: 'Bakery', price: 50, image_url: '/images/products/40_choco_chip_cookies.png' },
  { name: 'Oatmeal Cookies', category: 'Bakery', price: 45, image_url: '/images/products/41_oatmeal_cookies.png' },
  { name: 'Fruit Cake', category: 'Bakery', price: 90, image_url: '/images/products/42_fruit_cake.png' },

  // 🥩 Meat
  { name: 'Fresh Chicken Breast 500g', category: 'Meat', price: 280, image_url: '/images/products/43_fresh_chicken_breast_500g.png' },
  { name: 'Chicken Curry Cut 1kg', category: 'Meat', price: 450, image_url: '/images/products/44_chicken_curry_cut_1kg.png' },
  { name: 'Fresh Mutton Keema 500g', category: 'Meat', price: 650, image_url: '/images/products/45_fresh_mutton_keema_500g.png' },
  { name: 'Fresh Rohu Fish 1kg', category: 'Meat', price: 300, image_url: '/images/products/46_fresh_rohu_fish_1kg.png' },

  // 🫒 EDIBLE COOKING OILS & GHEE (NO COSMETICS / REAL FOOD PHOTOS)
  { name: 'Fortune Sunflower Oil 1L', category: 'Oils', price: 140, image_url: '/images/products/48_sunflower_oil_1l.png' },
  { name: 'Sunflower Oil 1L', category: 'Oils', price: 140, image_url: '/images/products/48_sunflower_oil_1l.png' },
  { name: 'Borges Extra Virgin Olive Oil 500ml', category: 'Oils', price: 450, image_url: '/images/products/49_borges_extra_virgin_olive_oil_500ml.png' },
  { name: 'Dabur Kachi Ghani Mustard Oil 1L', category: 'Oils', price: 160, image_url: '/images/products/50_dabur_kachi_ghani_mustard_oil_1l.png' },
  { name: 'Parachute Pure Coconut Oil 500ml', category: 'Oils', price: 200, image_url: '/images/products/52_coconut_oil_500ml.png' },
  { name: 'Coconut Oil 500ml', category: 'Oils', price: 200, image_url: '/images/products/52_coconut_oil_500ml.png' },
  { name: 'Groundnut Oil 1L', category: 'Oils', price: 180, image_url: '/images/products/53_groundnut_oil_1l.png' },
  { name: 'Sesame Oil 500ml', category: 'Oils', price: 250, image_url: '/images/products/54_sesame_oil_500ml.png' },
  { name: 'Pure Cow Ghee 500g', category: 'Oils', price: 350, image_url: '/images/products/55_pure_cow_ghee_500g.png' },

  // 🍚 Grains & Rice & Dal & Oats (ACCURATE RAW FOOD PHOTOS)
  { name: 'Quinoa 500g', category: 'Grains', price: 320, image_url: '/images/products/56_quinoa_500g.png' },
  { name: 'India Gate Basmati Rice 1kg', category: 'Grains', price: 120, image_url: '/images/products/57_india_gate_basmati_rice_1kg.png' },
  { name: 'Sona Masoori Rice 5kg', category: 'Grains', price: 300, image_url: '/images/products/58_sona_masoori_rice_5kg.png' },
  { name: 'Aashirvaad Shudh Chakki Atta 5kg', category: 'Grains', price: 220, image_url: '/images/products/59_aashirvaad_shudh_chakki_atta_5kg.png' },
  { name: 'Whole Wheat Atta 5kg', category: 'Grains', price: 220, image_url: '/images/products/60_whole_wheat_atta_5kg.png' },
  { name: 'Tata Sampann Toor Dal 1kg', category: 'Grains', price: 160, image_url: '/images/products/62_toor_dal_1kg.png' },
  { name: 'Toor Dal 1kg', category: 'Grains', price: 160, image_url: '/images/products/62_toor_dal_1kg.png' },
  { name: 'Moong Dal 1kg', category: 'Grains', price: 130, image_url: '/images/products/63_moong_dal_1kg.png' },
  { name: 'Chana Dal 1kg', category: 'Grains', price: 90, image_url: '/images/products/64_chana_dal_1kg.png' },
  { name: 'Rolled Oats 1kg', category: 'Grains', price: 180, image_url: '/images/products/65_rolled_oats_1kg.png' },

  // ☕ Beverages
  { name: 'Tropicana 100% Orange Juice 1L', category: 'Beverages', price: 130, image_url: '/images/products/66_tropicana_100_orange_juice_1l.png' },
  { name: 'Nescafe Cold Coffee 250ml', category: 'Beverages', price: 65, image_url: '/images/products/67_nescafe_cold_coffee_250ml.png' },
  { name: 'Tata Tea Gold 500g', category: 'Beverages', price: 280, image_url: '/images/products/68_tata_tea_gold_500g.png' },
  { name: 'Red Bull Energy Drink 250ml', category: 'Beverages', price: 125, image_url: '/images/products/69_red_bull_energy_drink_250ml.png' },
  { name: 'Coca-Cola Original 750ml', category: 'Beverages', price: 45, image_url: '/images/products/70_coca_cola_original_750ml.png' },
  { name: 'Organic Green Tea 25 Bags', category: 'Beverages', price: 180, image_url: '/images/products/71_organic_green_tea_25_bags.png' },

  // 🍪 Snacks & Biscuits (EVERY BRAND HAS ITS OWN UNIQUE PHOTO)
  { name: 'Kurkure Masala Munch', category: 'Snacks', price: 20, image_url: '/images/products/72_kurkure_masala_munch.png' },
  { name: 'Kurkure Green Chutney Style', category: 'Snacks', price: 20, image_url: '/images/products/73_kurkure_green_chutney_style.png' },
  { name: 'Lays Classic Salted Chips', category: 'Snacks', price: 20, image_url: '/images/products/74_lays_classic_salted_chips.png' },
  { name: 'Lays India Magic Masala', category: 'Snacks', price: 20, image_url: '/images/products/75_lays_india_magic_masala.png' },
  { name: 'Lays American Style Cream & Onion', category: 'Snacks', price: 20, image_url: '/images/products/76_lays_american_style_cream_onion.png' },
  { name: 'Lays Spanish Tomato Tango', category: 'Snacks', price: 20, image_url: '/images/products/77_lays_spanish_tomato_tango.png' },
  { name: 'Oreo Chocolate Cream Biscuits', category: 'Snacks', price: 40, image_url: '/images/products/78_oreo_chocolate_cream_biscuits.png' },
  { name: 'Britannia JimJam Biscuits', category: 'Snacks', price: 35, image_url: '/images/products/79_britannia_jimjam_biscuits.png' },
  { name: 'Parle-G Gold Biscuits', category: 'Snacks', price: 20, image_url: '/images/products/80_parle_g_gold_biscuits.png' },
  { name: 'Britannia Good Day Butter Cookies', category: 'Snacks', price: 30, image_url: '/images/products/81_britannia_good_day_butter_cookies.png' },
  { name: 'Sunfeast Dark Fantasy Choco Fills', category: 'Snacks', price: 50, image_url: '/images/products/82_sunfeast_dark_fantasy_choco_fills.png' },
  { name: 'Bingo Mad Angles Very Peri Peri', category: 'Snacks', price: 20, image_url: '/images/products/83_bingo_mad_angles_very_peri_peri.png' },
  { name: 'Doritos Nacho Cheese Tortilla Chips', category: 'Snacks', price: 30, image_url: '/images/products/84_doritos_nacho_cheese_tortilla_chips.png' },
  { name: 'Pringles Sour Cream & Onion', category: 'Snacks', price: 110, image_url: '/images/products/85_pringles_sour_cream_onion.png' },
  { name: 'Cheetos Cheese Puffs', category: 'Snacks', price: 20, image_url: '/images/products/86_cheetos_cheese_puffs.png' },
  { name: 'Britannia Bourbon Chocolate Biscuits', category: 'Snacks', price: 30, image_url: '/images/products/87_britannia_bourbon_chocolate_biscuits.png' },
  { name: 'Parle Hide & Seek Choco Chip', category: 'Snacks', price: 40, image_url: '/images/products/88_parle_hide_seek_choco_chip.png' },
  { name: 'Haldiram Aloo Bhujia 200g', category: 'Snacks', price: 50, image_url: '/images/products/89_haldiram_aloo_bhujia_200g.png' },
  { name: 'Haldiram Khatta Meetha Mixture', category: 'Snacks', price: 55, image_url: '/images/products/90_haldiram_khatta_meetha_mixture.png' },
  { name: 'Act II Golden Butter Popcorn', category: 'Snacks', price: 25, image_url: '/images/products/91_act_ii_golden_butter_popcorn.png' },
  { name: 'Snickers Peanut Chocolate Bar', category: 'Snacks', price: 50, image_url: '/images/products/92_snickers_peanut_chocolate_bar.png' },
  { name: 'Cadbury Dairy Milk Silk Chocolate', category: 'Snacks', price: 90, image_url: '/images/products/93_cadbury_dairy_milk_silk_chocolate.png' },
  { name: 'KitKat 4-Finger Chocolate Wafers', category: 'Snacks', price: 40, image_url: '/images/products/94_kitkat_4_finger_chocolate_wafers.png' },
  { name: 'Roasted Salted Almonds 200g', category: 'Snacks', price: 220, image_url: '/images/products/95_roasted_salted_almonds_200g.png' },
  { name: 'Premium Whole Cashews 200g', category: 'Snacks', price: 280, image_url: '/images/products/96_premium_whole_cashews_200g.png' },
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
