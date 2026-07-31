const EXACT_ITEM_IMAGES: Record<string, string> = {
  // 🍎 Fruits
  'red delicious apple': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg',
  'apple': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg',
  'fresh robusta banana': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg',
  'banana': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg',
  'alphonso mango': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Haden_mango_aa.jpg',
  'mango': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Haden_mango_aa.jpg',
  'nagpur oranges': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg',
  'orange': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg',
  'black seedless grapes': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Kyoho-grape.jpg',
  'grapes': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Kyoho-grape.jpg',
  'fresh strawberries': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Strawberries.jpg',
  'strawberry': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Strawberries.jpg',
  'sweet watermelon': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Watermelon-slice.jpg',
  'watermelon': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Watermelon-slice.jpg',

  // 🥦 Vegetables
  'fresh hybrid tomato': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg',
  'tomato': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg',
  'new crop potato': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patatas.jpg',
  'potato': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patatas.jpg',
  'red onion': 'https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG',
  'onion': 'https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG',
  'organic carrot': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Vegetable-Carrots.jpg',
  'carrot': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Vegetable-Carrots.jpg',
  'fresh spinach bunch': 'https://upload.wikimedia.org/wikipedia/commons/3/38/Spinach_leaves.jpg',
  'spinach': 'https://upload.wikimedia.org/wikipedia/commons/3/38/Spinach_leaves.jpg',
  'green broccoli': 'https://upload.wikimedia.org/wikipedia/commons/0/03/Broccoli_and_cross_section_edit.jpg',
  'broccoli': 'https://upload.wikimedia.org/wikipedia/commons/0/03/Broccoli_and_cross_section_edit.jpg',
  'fresh cucumber': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Cucumbers_anim.gif',
  'cucumber': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Cucumbers_anim.gif',

  // 🥛 Dairy
  'full cream milk 1l': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Glass_of_Milk_%283367496550%29.jpg',
  'milk': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Glass_of_Milk_%283367496550%29.jpg',
  'toned milk': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Glass_of_Milk_%283367496550%29.jpg',
  'amul salted butter': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_piemontesi_butter.jpg',
  'salted butter': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_piemontesi_butter.jpg',
  'butter': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_piemontesi_butter.jpg',
  'amul processed cheese slices': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Cheddar_cheese_3.jpg',
  'cheddar cheese': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Cheddar_cheese_3.jpg',
  'mozzarella cheese': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Cheddar_cheese_3.jpg',
  'cheese': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Cheddar_cheese_3.jpg',
  'fresh malai paneer 200g': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Paneer_cubes.jpg',
  'paneer 200g': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Paneer_cubes.jpg',
  'paneer': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Paneer_cubes.jpg',
  'fresh curd': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yogurt_in_a_bowl.jpg',
  'greek plain yogurt': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yogurt_in_a_bowl.jpg',
  'greek yogurt': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yogurt_in_a_bowl.jpg',
  'yogurt': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yogurt_in_a_bowl.jpg',
  'brown eggs (6 pack)': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_egg_2009-06-04.jpg',
  'eggs': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_egg_2009-06-04.jpg',

  // 🍞 Bakery
  'classic white bread': 'https://upload.wikimedia.org/wikipedia/commons/7/71/Sliced_bread.jpg',
  'white bread': 'https://upload.wikimedia.org/wikipedia/commons/7/71/Sliced_bread.jpg',
  'healthy brown bread': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Whole_wheat_bread.jpg',
  'brown bread': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Whole_wheat_bread.jpg',
  '100% multigrain bread': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Whole_wheat_bread.jpg',
  'multigrain bread': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Whole_wheat_bread.jpg',
  'french butter croissant': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Croissant_01.jpg',
  'butter croissant': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Croissant_01.jpg',
  'rich chocolate muffin': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Muffin_chocolate.jpg',
  'chocolate muffin': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Muffin_chocolate.jpg',
  'blueberry muffin': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Blueberry_muffins_cropped.jpg',

  // 🥩 Meat
  'fresh chicken breast 500g': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Raw_chicken_breast.jpg',
  'chicken breast': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Raw_chicken_breast.jpg',
  'chicken curry cut 1kg': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Raw_chicken_breast.jpg',
  'chicken curry cut': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Raw_chicken_breast.jpg',
  'fresh mutton keema 500g': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Minced_meat.jpg',
  'mutton keema': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Minced_meat.jpg',
  'fresh rohu fish 1kg': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Fish_market_fish.jpg',

  // 🫒 Oils & Fats
  'fortune sunflower oil 1l': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sunflower_oil_and_sunflower.jpg',
  'sunflower oil': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sunflower_oil_and_sunflower.jpg',
  'borges extra virgin olive oil 500ml': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Olive_oil_bottle.jpg',
  'olive oil': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Olive_oil_bottle.jpg',
  'dabur kachi ghani mustard oil 1l': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sunflower_oil_and_sunflower.jpg',
  'mustard oil': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sunflower_oil_and_sunflower.jpg',
  'parachute pure coconut oil 500ml': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Coconut_oil.jpg',
  'coconut oil': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Coconut_oil.jpg',
  'pure cow ghee 500g': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Ghee_in_a_jar.jpg',
  'pure cow ghee': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Ghee_in_a_jar.jpg',
  'cow ghee': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Ghee_in_a_jar.jpg',
  'ghee': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Ghee_in_a_jar.jpg',

  // 🍚 Grains & Rice
  'india gate basmati rice 1kg': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Basmati_Rice_raw.jpg',
  'basmati rice': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Basmati_Rice_raw.jpg',
  'sona masoori rice 5kg': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Basmati_Rice_raw.jpg',
  'aashirvaad shudh chakki atta 5kg': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Wheat_flour.jpg',
  'whole wheat atta': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Wheat_flour.jpg',
  'tata sampann toor dal 1kg': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Toor_dal.jpg',
  'toor dal': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Toor_dal.jpg',

  // ☕ Beverages
  'tropicana 100% orange juice 1l': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Orange_juice_1.jpg',
  'orange juice': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Orange_juice_1.jpg',
  'nescafe cold coffee 250ml': 'https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG',
  'cold coffee': 'https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG',
  'tata tea gold 500g': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Black_tea_cup.jpg',
  'tata tea': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Black_tea_cup.jpg',
  'red bull energy drink 250ml': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Red_Bull_can.jpg',
  'red bull': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Red_Bull_can.jpg',
  'coca-cola original 750ml': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Coca-Cola_Can.jpg',
  'coca cola': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Coca-Cola_Can.jpg',
  'organic green tea 25 bags': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Black_tea_cup.jpg',

  // 🍪 Snacks & Biscuits
  'kurkure masala munch': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'kurkure green chutney style': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'lays classic salted chips': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'lays classic salted': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'lays india magic masala': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'lays american style cream & onion': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'lays spanish tomato tango': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'oreo chocolate cream biscuits': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Oreo-Two-Cookies.jpg',
  'oreo biscuits': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Oreo-Two-Cookies.jpg',
  'britannia jimjam biscuits': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Jam_biscuits.jpg',
  'jimjam cream biscuits': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Jam_biscuits.jpg',
  'parle-g gold biscuits': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Butter_cookies.jpg',
  'britannia good day butter cookies': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Butter_cookies.jpg',
  'sunfeast dark fantasy choco fills': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chocolate_chip_cookies.jpg',
  'bingo mad angles very peri peri': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'doritos nacho cheese tortilla chips': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'pringles sour cream & onion': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'cheetos cheese puffs': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'britannia bourbon chocolate biscuits': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chocolate_chip_cookies.jpg',
  'parle hide & seek choco chip': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chocolate_chip_cookies.jpg',
  'haldiram aloo bhujia 200g': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'haldiram aloo bhujia': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'haldiram khatta meetha mixture': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg',
  'act ii golden butter popcorn': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Popcorn_in_bowl.jpg',
  'snickers peanut chocolate bar': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Snickers_broken.jpg',
  'cadbury dairy milk silk chocolate': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Snickers_broken.jpg',
  'kitkat 4-finger chocolate wafers': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Snickers_broken.jpg',
  'roasted salted almonds 200g': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Almonds.jpg',
  'premium whole cashews 200g': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Cashew_nuts.jpg',
};

function generateFoodSvgDataUri(name: string, category?: string): string {
  const clean = (name || category || 'Fresh Grocery').toUpperCase();
  const bgColors = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];
  const bg = bgColors[Math.abs(clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % bgColors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
    <rect width="500" height="500" fill="${bg}" rx="32"/>
    <circle cx="250" cy="200" r="100" fill="#ffffff" opacity="0.2"/>
    <text x="250" y="220" font-family="system-ui, sans-serif" font-size="120" text-anchor="middle">🛒</text>
    <text x="250" y="330" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">${clean.slice(0, 22)}</text>
    <text x="250" y="370" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ffffff" opacity="0.8" text-anchor="middle">FRESHCART PREMIUM</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getValidImageUrl(url: string | null | undefined, fallbackName: string, category?: string): string {
  const cleanName = (fallbackName || '').toLowerCase().trim();

  // 1. Check exact item image dictionary first for 100% unique match!
  if (cleanName && EXACT_ITEM_IMAGES[cleanName]) {
    return EXACT_ITEM_IMAGES[cleanName];
  }

  // 2. Check if name contains any exact keyword key
  for (const [key, image] of Object.entries(EXACT_ITEM_IMAGES)) {
    if (cleanName.includes(key)) {
      return image;
    }
  }

  // 3. If provided URL is a valid non-placeholder http URL, use it
  if (url && url.startsWith('http') && !url.includes('loremflickr') && !url.includes('via.placeholder.com')) {
    return url;
  }

  // 4. Return dynamic food SVG Data URI if image is missing
  return generateFoodSvgDataUri(fallbackName, category);
}

export async function safeFetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}
