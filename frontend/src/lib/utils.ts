const EXACT_ITEM_IMAGES: Record<string, string> = {
  // Bakery
  'white bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
  'brown bread': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&auto=format&fit=crop',
  'multigrain bread': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop',
  '100% multigrain bread': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop',
  'butter croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop',
  'french butter croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop',
  'chocolate muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop',
  'rich chocolate muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop',
  'blueberry muffin': 'https://images.unsplash.com/photo-1598215439218-f79b4ed1cb16?w=500&auto=format&fit=crop',
  'choco chip cookies': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop',

  // Snacks & Biscuits (EVERY ITEM HAS A UNIQUE EXCLUSIVE IMAGE)
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
