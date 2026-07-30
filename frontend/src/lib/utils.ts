const EXACT_ITEM_IMAGES: Record<string, string> = {
  // 🍎 Fruits
  'red delicious apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop',
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop',
  'fresh robusta banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop',
  'alphonso mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop',
  'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop',
  'nagpur oranges': 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop',
  'orange': 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop',
  'black seedless grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop',
  'grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop',
  'fresh strawberries': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop',
  'strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop',
  'sweet watermelon': 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74476?w=500&auto=format&fit=crop',
  'watermelon': 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74476?w=500&auto=format&fit=crop',

  // 🥦 Vegetables
  'fresh hybrid tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop',
  'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop',
  'new crop potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
  'red onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop',
  'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop',
  'organic carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop',
  'fresh spinach bunch': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop',
  'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop',
  'green broccoli': 'https://images.unsplash.com/photo-1447175008436-08417090ea77?w=500&auto=format&fit=crop',
  'broccoli': 'https://images.unsplash.com/photo-1447175008436-08417090ea77?w=500&auto=format&fit=crop',
  'fresh cucumber': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&auto=format&fit=crop',
  'cucumber': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&auto=format&fit=crop',

  // 🥛 Dairy
  'full cream milk 1l': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop',
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop',
  'amul salted butter': 'https://images.unsplash.com/photo-1584278860011-678e36e68948?w=500&auto=format&fit=crop',
  'butter': 'https://images.unsplash.com/photo-1584278860011-678e36e68948?w=500&auto=format&fit=crop',
  'amul processed cheese slices': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop',
  'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop',
  'fresh malai paneer 200g': 'https://images.unsplash.com/photo-1631452180519-c014fe946cea?w=500&auto=format&fit=crop',
  'paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946cea?w=500&auto=format&fit=crop',
  'greek plain yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop',
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop',

  // 🍞 Bakery
  'classic white bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
  'white bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
  'healthy brown bread': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&auto=format&fit=crop',
  'brown bread': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&auto=format&fit=crop',
  '100% multigrain bread': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop',
  'multigrain bread': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop',
  'french butter croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop',
  'butter croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop',
  'rich chocolate muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop',
  'chocolate muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop',
  'blueberry muffin': 'https://images.unsplash.com/photo-1598215439218-f79b4ed1cb16?w=500&auto=format&fit=crop',

  // 🥩 Meat
  'fresh chicken breast 500g': 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=500&auto=format&fit=crop',
  'chicken breast': 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=500&auto=format&fit=crop',
  'chicken curry cut 1kg': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop',
  'chicken curry cut': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop',
  'fresh mutton keema 500g': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop',
  'mutton keema': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop',
  'fresh rohu fish 1kg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop',

  // 🫒 Oils & Fats
  'fortune sunflower oil 1l': 'https://images.unsplash.com/photo-1610725663801-1490960e24d7?w=500&auto=format&fit=crop',
  'sunflower oil': 'https://images.unsplash.com/photo-1610725663801-1490960e24d7?w=500&auto=format&fit=crop',
  'borges extra virgin olive oil 500ml': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop',
  'olive oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop',
  'dabur kachi ghani mustard oil 1l': 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500&auto=format&fit=crop',
  'mustard oil': 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500&auto=format&fit=crop',
  'parachute pure coconut oil 500ml': 'https://images.unsplash.com/photo-1611078502570-0720b00511de?w=500&auto=format&fit=crop',
  'coconut oil': 'https://images.unsplash.com/photo-1611078502570-0720b00511de?w=500&auto=format&fit=crop',
  'pure cow ghee 500g': 'https://images.unsplash.com/photo-1630145265430-6b6a032dc1df?w=500&auto=format&fit=crop',
  'cow ghee': 'https://images.unsplash.com/photo-1630145265430-6b6a032dc1df?w=500&auto=format&fit=crop',

  // 🍚 Grains & Rice
  'india gate basmati rice 1kg': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop',
  'basmati rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop',
  'sona masoori rice 5kg': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop',
  'aashirvaad shudh chakki atta 5kg': 'https://images.unsplash.com/photo-1508338712271-40539c95ae47?w=500&auto=format&fit=crop',
  'whole wheat atta': 'https://images.unsplash.com/photo-1508338712271-40539c95ae47?w=500&auto=format&fit=crop',
  'tata sampann toor dal 1kg': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop',
  'toor dal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop',

  // ☕ Beverages
  'tropicana 100% orange juice 1l': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop',
  'orange juice': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop',
  'nescafe cold coffee 250ml': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop',
  'cold coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop',
  'tata tea gold 500g': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop',
  'tata tea': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop',
  'red bull energy drink 250ml': 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&auto=format&fit=crop',
  'red bull': 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&auto=format&fit=crop',
  'coca-cola original 750ml': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop',
  'coca cola': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop',
  'organic green tea 25 bags': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop',

  // 🍪 Snacks & Biscuits
  'kurkure masala munch': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop',
  'kurkure green chutney style': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop',
  'lays classic salted chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop',
  'lays classic salted': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop',
  'lays india magic masala': 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop',
  'lays american style cream & onion': 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=500&auto=format&fit=crop',
  'lays spanish tomato tango': 'https://images.unsplash.com/photo-1566478978921-654b0e8c81ef?w=500&auto=format&fit=crop',
  'oreo chocolate cream biscuits': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop',
  'oreo biscuits': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop',
  'britannia jimjam biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop',
  'jimjam cream biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop',
  'parle-g gold biscuits': 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop',
  'britannia good day butter cookies': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop',
  'sunfeast dark fantasy choco fills': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop',
  'bingo mad angles very peri peri': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop',
  'doritos nacho cheese tortilla chips': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop',
  'pringles sour cream & onion': 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop',
  'cheetos cheese puffs': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop',
  'britannia bourbon chocolate biscuits': 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=500&auto=format&fit=crop',
  'parle hide & seek choco chip': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
  'haldiram aloo bhujia 200g': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop',
  'haldiram aloo bhujia': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop',
  'haldiram khatta meetha mixture': 'https://images.unsplash.com/photo-1601050690187-013098522301?w=500&auto=format&fit=crop',
  'act ii golden butter popcorn': 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&auto=format&fit=crop',
  'snickers peanut chocolate bar': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=500&auto=format&fit=crop',
  'cadbury dairy milk silk chocolate': 'https://images.unsplash.com/photo-1548813293-c906666fc29b?w=500&auto=format&fit=crop',
  'kitkat 4-finger chocolate wafers': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop',
  'roasted salted almonds 200g': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop',
  'premium whole cashews 200g': 'https://images.unsplash.com/photo-1536591375315-198956582373?w=500&auto=format&fit=crop',
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
  meat: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop',
  oils: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop',
  grains: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop',
  snacks: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop',
};

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

  // 4. Category fallback
  const cleanCat = (category || '').toLowerCase().trim();
  if (cleanCat && CATEGORY_FALLBACKS[cleanCat]) {
    return CATEGORY_FALLBACKS[cleanCat];
  }

  return CATEGORY_FALLBACKS.default;
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
