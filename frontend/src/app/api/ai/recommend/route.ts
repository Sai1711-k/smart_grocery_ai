import { NextResponse } from 'next/server';

const AI_DATABASE = [
  { id: '1', name: 'Fresh Malai Paneer 200g', price: 90, category: 'Dairy', diet: ['veg', 'high-protein', 'keto'], baseQty: 2, image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Paneer_cubes.jpg' },
  { id: '2', name: 'Brown Eggs (6 Pack)', price: 65, category: 'Dairy', diet: ['high-protein', 'keto'], baseQty: 2, image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_egg_2009-06-04.jpg' },
  { id: '3', name: 'Fresh Spinach Bunch', price: 30, category: 'Vegetables', diet: ['veg', 'vegan', 'keto', 'high-protein'], baseQty: 3, image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Spinach_leaves.jpg' },
  { id: '4', name: 'Alphonso Mango', price: 120, category: 'Fruits', diet: ['veg', 'vegan'], baseQty: 2, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Haden_mango_aa.jpg' },
  { id: '5', name: 'Tata Sampann Toor Dal 1kg', price: 160, category: 'Grains & Rice', diet: ['veg', 'vegan', 'high-protein'], baseQty: 1, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Toor_dal.jpg' },
  { id: '6', name: 'India Gate Basmati Rice 1kg', price: 140, category: 'Grains & Rice', diet: ['veg', 'vegan'], baseQty: 2, image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Basmati_Rice_raw.jpg' },
  { id: '7', name: 'Full Cream Milk 1L', price: 66, category: 'Dairy', diet: ['veg', 'high-protein'], baseQty: 3, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Glass_of_Milk_%283367496550%29.jpg' },
  { id: '8', name: 'Fresh Chicken Breast 500g', price: 280, category: 'Meat', diet: ['high-protein', 'keto'], baseQty: 1, image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Raw_chicken_breast.jpg' },
  { id: '9', name: 'Classic White Bread', price: 45, category: 'Bakery', diet: ['veg'], baseQty: 2, image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Sliced_bread.jpg' },
  { id: '10', name: 'Red Delicious Apple', price: 180, category: 'Fruits', diet: ['veg', 'vegan'], baseQty: 1, image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg' },
  { id: '11', name: 'Fortune Sunflower Oil 1L', price: 140, category: 'Oils & Fats', diet: ['veg', 'vegan', 'keto'], baseQty: 1, image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sunflower_oil_and_sunflower.jpg' },
  { id: '12', name: '100% Multigrain Bread', price: 60, category: 'Bakery', diet: ['veg', 'vegan'], baseQty: 2, image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Whole_wheat_bread.jpg' },
  { id: '13', name: 'French Butter Croissant', price: 80, category: 'Bakery', diet: ['veg'], baseQty: 2, image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Croissant_01.jpg' },
  { id: '14', name: 'Rich Chocolate Muffin', price: 60, category: 'Bakery', diet: ['veg'], baseQty: 2, image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Muffin_chocolate.jpg' }
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { diets = [], familySize = 2 } = body;

    const filtered = AI_DATABASE.filter(item => {
      if (diets.length === 0 || diets.includes('balanced')) return true;
      return item.diet.some(d => diets.includes(d));
    }).map(item => ({
      ...item,
      recommendedQty: Math.ceil(item.baseQty * (familySize > 4 ? familySize * 0.8 : familySize))
    }));

    return NextResponse.json({
      success: true,
      items: filtered,
      count: filtered.length
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
