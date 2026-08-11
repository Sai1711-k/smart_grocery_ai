import { NextResponse } from 'next/server';

const AI_DATABASE = [
  { id: 'ai1', name: 'Fresh Malai Paneer 200g', price: 90, category: 'Dairy', diet: ['veg', 'high-protein', 'keto', 'balanced', 'weight-loss'], baseQty: 2, cals: 265, proteinG: 18, carbsG: 3, fatsG: 20, img: '🧀', image_url: '/images/products/22_Fresh%20Malai%20Paneer%20200g.png' },
  { id: 'ai2', name: 'Brown Eggs (6 Pack)', price: 60, category: 'Dairy', diet: ['high-protein', 'keto', 'balanced', 'weight-loss'], baseQty: 2, cals: 70, proteinG: 6, carbsG: 0.5, fatsG: 5, img: '🥚', image_url: '/images/products/27_Brown%20Eggs%20_6%20Pack_.png' },
  { id: 'ai3', name: 'Fresh Spinach Bunch', price: 20, category: 'Vegetables', diet: ['veg', 'vegan', 'keto', 'high-protein', 'balanced', 'weight-loss'], baseQty: 3, cals: 23, proteinG: 2.9, carbsG: 3.6, fatsG: 0.4, img: '🥬', image_url: '/images/products/12_Fresh%20Spinach%20Bunch.png' },
  { id: 'ai4', name: 'Alphonso Mango', price: 200, category: 'Fruits', diet: ['veg', 'vegan', 'balanced'], baseQty: 2, cals: 135, proteinG: 1.1, carbsG: 35, fatsG: 0.6, img: '🥭', image_url: '/images/products/03_Alphonso%20Mango.png' },
  { id: 'ai5', name: 'Tata Sampann Toor Dal 1kg', price: 160, category: 'Grains', diet: ['veg', 'vegan', 'high-protein', 'balanced'], baseQty: 1, cals: 343, proteinG: 22, carbsG: 62, fatsG: 1.7, img: '🥣', image_url: '/images/products/61_Tata%20Sampann%20Toor%20Dal%201kg.png' },
  { id: 'ai6', name: 'India Gate Basmati Rice 1kg', price: 120, category: 'Grains', diet: ['veg', 'vegan', 'balanced'], baseQty: 2, cals: 350, proteinG: 7.1, carbsG: 78, fatsG: 0.6, img: '🍚', image_url: '/images/products/57_India%20Gate%20Basmati%20Rice%201kg.png' },
  { id: 'ai7', name: 'Full Cream Milk 1L', price: 66, category: 'Dairy', diet: ['veg', 'high-protein', 'balanced'], baseQty: 3, cals: 620, proteinG: 32, carbsG: 48, fatsG: 35, img: '🥛', image_url: '/images/products/15_Full%20Cream%20Milk%201L.png' },
  { id: 'ai8', name: 'Fresh Chicken Breast 500g', price: 280, category: 'Meat', diet: ['high-protein', 'keto', 'weight-loss', 'balanced'], baseQty: 1, cals: 165, proteinG: 31, carbsG: 0, fatsG: 3.6, img: '🥩', image_url: '/images/products/43_Fresh%20Chicken%20Breast%20500g.png' },
  { id: 'ai9', name: 'Classic White Bread', price: 40, category: 'Bakery', diet: ['veg', 'balanced'], baseQty: 2, cals: 265, proteinG: 9, carbsG: 49, fatsG: 3.2, img: '🍞', image_url: '/images/products/28_Classic%20White%20Bread.png' },
  { id: 'ai10', name: 'Red Delicious Apple', price: 150, category: 'Fruits', diet: ['veg', 'vegan', 'balanced', 'weight-loss'], baseQty: 1, cals: 95, proteinG: 0.5, carbsG: 25, fatsG: 0.3, img: '🍎', image_url: '/images/products/01_Red%20Delicious%20Apple.png' },
  { id: 'ai11', name: 'Fortune Sunflower Oil 1L', price: 140, category: 'Oils', diet: ['veg', 'vegan', 'keto', 'balanced'], baseQty: 1, cals: 884, proteinG: 0, carbsG: 0, fatsG: 100, img: '🫒', image_url: '/images/products/47_Fortune%20Sunflower%20Oil%201L.png' },
  { id: 'ai12', name: '100% Multigrain Bread', price: 60, category: 'Bakery', diet: ['veg', 'vegan', 'high-protein', 'balanced', 'weight-loss'], baseQty: 2, cals: 250, proteinG: 13, carbsG: 41, fatsG: 4.2, img: '🍞', image_url: '/images/products/32_100_%20Multigrain%20Bread.png' },
  { id: 'ai13', name: 'Rolled Oats 1kg', price: 180, category: 'Grains', diet: ['veg', 'vegan', 'high-protein', 'weight-loss', 'balanced'], baseQty: 1, cals: 389, proteinG: 16.9, carbsG: 66, fatsG: 6.9, img: '🥣', image_url: '/images/products/65_Rolled%20Oats%201kg.png' },
  { id: 'ai14', name: 'Greek Plain Yogurt', price: 80, category: 'Dairy', diet: ['veg', 'high-protein', 'keto', 'weight-loss', 'balanced'], baseQty: 2, cals: 100, proteinG: 10, carbsG: 4, fatsG: 5, img: '🥣', image_url: '/images/products/25_Greek%20Plain%20Yogurt.png' },
  { id: 'ai15', name: 'Roasted Salted Almonds 200g', price: 220, category: 'Snacks', diet: ['veg', 'vegan', 'keto', 'high-protein', 'balanced'], baseQty: 1, cals: 579, proteinG: 21, carbsG: 22, fatsG: 50, img: '🥜', image_url: '/images/products/95_Roasted%20Salted%20Almonds%20200g.png' }
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { diets = ['balanced'], familySize = 1, activeGoal = 'balanced' } = body;

    const filtered = AI_DATABASE.filter(item => {
      if (diets.length === 0 || diets.includes('balanced') || activeGoal === 'balanced') return true;
      return item.diet.some(d => d === activeGoal || diets.includes(d));
    }).map(item => ({
      ...item,
      recommendedQty: Math.max(1, Math.ceil(item.baseQty * (familySize > 4 ? familySize * 0.8 : familySize)))
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
