const UNSPLASH_IMAGES: Record<string, string> = {
  // Vegetables
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop',
  tomatoes: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop',
  carrots: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop',
  broccoli: 'https://images.unsplash.com/photo-1447175008436-08417090ea77?w=500&auto=format&fit=crop',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
  potatoes: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop',
  onions: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop',
  cucumber: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&auto=format&fit=crop',
  vegetable: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop',

  // Fruits
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop',
  apples: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop',
  bananas: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop',
  orange: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop',
  oranges: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop',
  berry: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop',
  berries: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop',
  avocado: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop',

  // Dairy
  milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop',
  cheese: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop',
  butter: 'https://images.unsplash.com/photo-1584278860011-678e36e68948?w=500&auto=format&fit=crop',
  yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop',
  curd: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop',

  // Bakery
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
  bakery: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop',
  bun: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop',

  // Meat / Poultry
  chicken: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop',
  meat: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop',
  mutton: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop',
  egg: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop',
  eggs: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop',

  // Grains
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop',
  grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop',

  // Oils
  oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop',
  oils: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop',

  // Snacks
  cookie: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop',
  cookies: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop',
  chips: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop',
  snack: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop',
  snacks: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop',

  // Beverages
  coffee: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop',
  juice: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop',
  beverage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop',

  // Default
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop',
};

export function getValidImageUrl(url: string | null | undefined, fallbackName: string, category?: string): string {
  // If we have a direct unsplash URL or valid https URL that isn't loremflickr or placeholder
  if (url && url.startsWith('http') && !url.includes('loremflickr') && !url.includes('via.placeholder.com')) {
    return url;
  }

  const nameWords = (fallbackName || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/);

  const categoryWords = (category || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/);

  const allWords = [...nameWords, ...categoryWords];

  for (const word of allWords) {
    if (word && UNSPLASH_IMAGES[word]) {
      return UNSPLASH_IMAGES[word];
    }
  }

  return UNSPLASH_IMAGES.default;
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
