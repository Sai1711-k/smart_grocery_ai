'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth, useCart } from '@/lib/providers';
import { ArrowLeft, Sparkles, AlertCircle, ShoppingCart, TrendingDown, Target, X, Plus, Minus, Trash2, ShieldCheck, Zap, BookOpen, Clock } from 'lucide-react';
import { getValidImageUrl } from '@/lib/utils';

interface DietItem {
  id: string;
  name: string;
  price: number;
  category: string;
  diet: string[];
  baseQty: number;
  recommendedQty: number;
  cals: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  img: string;
  image_url: string;
}

const GOALS = [
  { 
    id: 'balanced', 
    label: 'Balanced', 
    icon: '🎯', 
    macros: { p: 45, c: 30, f: 25 }, 
    title: 'Balanced Energy & Wellness',
    desc: 'Optimal daily energy, essential vitamins, and wholesome nutrition for the entire family.',
    mealPlan: {
      breakfast: '100% Multigrain Bread Toast + Full Cream Milk / Tea',
      lunch: 'India Gate Basmati Rice + Tata Sampann Toor Dal + Fresh Spinach',
      snack: 'Fresh Robusta Banana or Red Delicious Apple',
      dinner: 'Fresh Malai Paneer Curry + Wheat Chapati / Rice'
    }
  },
  { 
    id: 'high-protein', 
    label: 'High Protein', 
    icon: '💪', 
    macros: { p: 60, c: 20, f: 20 }, 
    title: 'Muscle Growth & Active Recovery',
    desc: 'Maximum protein density to support lean muscle gain, strength workouts, and fast recovery.',
    mealPlan: {
      breakfast: '4 Boiled Brown Eggs + Greek Plain Yogurt',
      lunch: '250g Fresh Chicken Breast / Rohu Fish + Quinoa Bowl',
      snack: 'Roasted Salted Almonds + Paneer Slices',
      dinner: 'Fresh Mutton Keema / Paneer Sautéed with Spinach'
    }
  },
  { 
    id: 'keto', 
    label: 'Keto / Low Carb', 
    icon: '🥑', 
    macros: { p: 25, c: 5, f: 70 }, 
    title: 'Ketogenic Fat Burning Diet',
    desc: 'Ultra-low carb and high healthy fat intake to stimulate body fat burning and steady mental energy.',
    mealPlan: {
      breakfast: 'Brown Eggs Scrambled in Amul Salted Butter & Cheese',
      lunch: 'Fresh Chicken Breast / Malai Paneer Sautéed in Pure Cow Ghee',
      snack: ' Mozzarella Cheese Slices + Premium Whole Cashews',
      dinner: 'Pan-Seared Rohu Fish / Paneer with Broccoli in Olive Oil'
    }
  },
  { 
    id: 'vegan', 
    label: '100% Plant Vegan', 
    icon: '🌱', 
    macros: { p: 35, c: 45, f: 20 }, 
    title: 'Ethical Plant Power & High Fiber',
    desc: 'Pure 100% plant-based nutrients packed with natural antioxidant-rich fruits, greens, and grains.',
    mealPlan: {
      breakfast: 'Rolled Oats Porridge with Alphonso Mango & Bananas',
      lunch: 'Moong Dal / Toor Dal + Basmati Rice + Organic Carrots',
      snack: 'Organic Green Tea + Roasted Almonds',
      dinner: 'Steamed Broccoli & Spinach Quinoa Bowl in Sunflower Oil'
    }
  },
  { 
    id: 'weight-loss', 
    label: 'Weight Loss', 
    icon: '🔥', 
    macros: { p: 50, c: 25, f: 25 }, 
    title: 'Caloric Deficit & Maximum Satiety',
    desc: 'High-volume, nutrient-dense foods engineered to keep you full while burning body fat.',
    mealPlan: {
      breakfast: 'Organic Green Tea + 2 Boiled Eggs / Rolled Oats',
      lunch: 'Grilled Chicken Breast / Tofu + Green Broccoli & Cucumber Salad',
      snack: 'Sweet Watermelon Slice or Red Apple',
      dinner: 'Light Moong Dal Soup + Fresh Spinach Sauté'
    }
  },
];

const INITIAL_CATALOG: DietItem[] = [
  // 🧀 Dairy & Eggs
  { id: 'ai1', name: 'Fresh Malai Paneer 200g', price: 90, category: 'Dairy', diet: ['high-protein', 'keto', 'balanced', 'weight-loss'], baseQty: 2, recommendedQty: 2, cals: 265, proteinG: 18, carbsG: 3, fatsG: 20, img: '🧀', image_url: '/images/products/Fresh_Malai_Paneer_200g.png' },
  { id: 'ai2', name: 'Brown Eggs (6 Pack)', price: 60, category: 'Dairy', diet: ['high-protein', 'keto', 'balanced', 'weight-loss'], baseQty: 2, recommendedQty: 2, cals: 70, proteinG: 6, carbsG: 0.5, fatsG: 5, img: '🥚', image_url: '/images/products/Brown_Eggs_6_Pack.png' },
  { id: 'ai7', name: 'Full Cream Milk 1L', price: 66, category: 'Dairy', diet: ['high-protein', 'balanced'], baseQty: 3, recommendedQty: 3, cals: 620, proteinG: 32, carbsG: 48, fatsG: 35, img: '🥛', image_url: '/images/products/Full_Cream_Milk_1L.png' },
  { id: 'ai14', name: 'Greek Plain Yogurt', price: 80, category: 'Dairy', diet: ['high-protein', 'keto', 'weight-loss', 'balanced'], baseQty: 2, recommendedQty: 2, cals: 100, proteinG: 10, carbsG: 4, fatsG: 5, img: '🥣', image_url: '/images/products/Greek_Plain_Yogurt.png' },
  { id: 'ai21', name: 'Mozzarella Cheese', price: 200, category: 'Dairy', diet: ['keto', 'high-protein', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 300, proteinG: 22, carbsG: 2, fatsG: 22, img: '🧀', image_url: '/images/products/Mozzarella_Cheese.png' },
  { id: 'ai26', name: 'Toned Milk', price: 54, category: 'Dairy', diet: ['balanced', 'weight-loss'], baseQty: 2, recommendedQty: 2, cals: 470, proteinG: 24, carbsG: 38, fatsG: 24, img: '🥛', image_url: '/images/products/Toned_Milk.png' },
  { id: 'ai28', name: 'Amul Salted Butter', price: 55, category: 'Dairy', diet: ['keto', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 717, proteinG: 0.8, carbsG: 0.1, fatsG: 81, img: '🧈', image_url: '/images/products/Amul_Salted_Butter.png' },

  // 🥬 Vegetables & Fruits
  { id: 'ai3', name: 'Fresh Spinach Bunch', price: 20, category: 'Vegetables', diet: ['vegan', 'keto', 'high-protein', 'balanced', 'weight-loss'], baseQty: 3, recommendedQty: 3, cals: 23, proteinG: 2.9, carbsG: 3.6, fatsG: 0.4, img: '🥬', image_url: '/images/products/Fresh_Spinach_Bunch.png' },
  { id: 'ai4', name: 'Alphonso Mango', price: 200, category: 'Fruits', diet: ['vegan', 'balanced'], baseQty: 2, recommendedQty: 2, cals: 135, proteinG: 1.1, carbsG: 35, fatsG: 0.6, img: '🥭', image_url: '/images/products/Alphonso_Mango.png' },
  { id: 'ai10', name: 'Red Delicious Apple', price: 150, category: 'Fruits', diet: ['vegan', 'balanced', 'weight-loss'], baseQty: 2, recommendedQty: 2, cals: 95, proteinG: 0.5, carbsG: 25, fatsG: 0.3, img: '🍎', image_url: '/images/products/Red_Delicious_Apple.png' },
  { id: 'ai17', name: 'Green Broccoli', price: 150, category: 'Vegetables', diet: ['vegan', 'keto', 'high-protein', 'weight-loss', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 55, proteinG: 3.7, carbsG: 11, fatsG: 0.6, img: '🥦', image_url: '/images/products/Green_Broccoli.png' },
  { id: 'ai18', name: 'Organic Carrot', price: 50, category: 'Vegetables', diet: ['vegan', 'balanced', 'weight-loss'], baseQty: 2, recommendedQty: 2, cals: 41, proteinG: 0.9, carbsG: 10, fatsG: 0.2, img: '🥕', image_url: '/images/products/Organic_Carrot.png' },
  { id: 'ai19', name: 'Fresh Robusta Banana', price: 60, category: 'Fruits', diet: ['vegan', 'balanced', 'high-protein'], baseQty: 2, recommendedQty: 2, cals: 105, proteinG: 1.3, carbsG: 27, fatsG: 0.3, img: '🍌', image_url: '/images/products/Fresh_Robusta_Banana.png' },
  { id: 'ai20', name: 'Sweet Watermelon', price: 80, category: 'Fruits', diet: ['vegan', 'weight-loss', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 85, proteinG: 1.7, carbsG: 21, fatsG: 0.4, img: '🍉', image_url: '/images/products/Sweet_Watermelon.png' },
  { id: 'ai29', name: 'Fresh Cucumber', price: 30, category: 'Vegetables', diet: ['vegan', 'keto', 'weight-loss', 'balanced'], baseQty: 2, recommendedQty: 2, cals: 16, proteinG: 0.7, carbsG: 3.6, fatsG: 0.1, img: '🥒', image_url: '/images/products/Fresh_Cucumber.png' },

  // 🌾 Grains & Pulses
  { id: 'ai5', name: 'Tata Sampann Toor Dal 1kg', price: 160, category: 'Grains', diet: ['vegan', 'high-protein', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 343, proteinG: 22, carbsG: 62, fatsG: 1.7, img: '🥣', image_url: '/images/products/Tata_Sampann_Toor_Dal_1kg.png' },
  { id: 'ai6', name: 'India Gate Basmati Rice 1kg', price: 120, category: 'Grains', diet: ['vegan', 'balanced'], baseQty: 2, recommendedQty: 2, cals: 350, proteinG: 7.1, carbsG: 78, fatsG: 0.6, img: '🍚', image_url: '/images/products/India_Gate_Basmati_Rice_1kg.png' },
  { id: 'ai12', name: '100% Multigrain Bread', price: 60, category: 'Bakery', diet: ['vegan', 'high-protein', 'balanced', 'weight-loss'], baseQty: 2, recommendedQty: 2, cals: 250, proteinG: 13, carbsG: 41, fatsG: 4.2, img: '🍞', image_url: '/images/products/100_Multigrain_Bread.png' },
  { id: 'ai13', name: 'Rolled Oats 1kg', price: 180, category: 'Grains', diet: ['vegan', 'high-protein', 'weight-loss', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 389, proteinG: 16.9, carbsG: 66, fatsG: 6.9, img: '🥣', image_url: '/images/products/Rolled_Oats_1kg.png' },
  { id: 'ai22', name: 'Quinoa 500g', price: 320, category: 'Grains', diet: ['vegan', 'high-protein', 'weight-loss', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 368, proteinG: 14.1, carbsG: 64, fatsG: 6.1, img: '🌾', image_url: '/images/products/Quinoa_500g.png' },
  { id: 'ai23', name: 'Moong Dal 1kg', price: 130, category: 'Grains', diet: ['vegan', 'high-protein', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 347, proteinG: 24, carbsG: 63, fatsG: 1.2, img: '🥣', image_url: '/images/products/Moong_Dal_1kg.png' },

  // 🥩 Meat & Fish
  { id: 'ai8', name: 'Fresh Chicken Breast 500g', price: 280, category: 'Meat', diet: ['high-protein', 'keto', 'weight-loss', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 165, proteinG: 31, carbsG: 0, fatsG: 3.6, img: '🥩', image_url: '/images/products/Fresh_Chicken_Breast_500g.png' },
  { id: 'ai24', name: 'Fresh Mutton Keema 500g', price: 650, category: 'Meat', diet: ['high-protein', 'keto', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 250, proteinG: 26, carbsG: 0, fatsG: 16, img: '🥩', image_url: '/images/products/Fresh_Mutton_Keema_500g.png' },
  { id: 'ai25', name: 'Fresh Rohu Fish 1kg', price: 300, category: 'Meat', diet: ['high-protein', 'keto', 'weight-loss', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 180, proteinG: 28, carbsG: 0, fatsG: 7, img: '🐟', image_url: '/images/products/Fresh_Rohu_Fish_1kg.png' },

  // 🫒 Oils & Healthy Fats & Beverages
  { id: 'ai11', name: 'Fortune Sunflower Oil 1L', price: 140, category: 'Oils', diet: ['vegan', 'keto', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 884, proteinG: 0, carbsG: 0, fatsG: 100, img: '🫒', image_url: '/images/products/Fortune_Sunflower_Oil_1L.png' },
  { id: 'ai15', name: 'Roasted Salted Almonds 200g', price: 220, category: 'Snacks', diet: ['vegan', 'keto', 'high-protein', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 579, proteinG: 21, carbsG: 22, fatsG: 50, img: '🥜', image_url: '/images/products/Roasted_Salted_Almonds_200g.png' },
  { id: 'ai27', name: 'Organic Green Tea 25 Bags', price: 180, category: 'Beverages', diet: ['vegan', 'weight-loss', 'balanced', 'keto'], baseQty: 1, recommendedQty: 1, cals: 2, proteinG: 0, carbsG: 0.5, fatsG: 0, img: '🍵', image_url: '/images/products/Organic_Green_Tea_25_Bags.png' },
  { id: 'ai30', name: 'Pure Cow Ghee 500g', price: 350, category: 'Oils', diet: ['keto', 'high-protein', 'balanced'], baseQty: 1, recommendedQty: 1, cals: 899, proteinG: 0, carbsG: 0, fatsG: 99.5, img: '🫒', image_url: '/images/products/Pure_Cow_Ghee_500g.png' },
];

export function SmartPlanner({ onBack }: { onBack: () => void }) {
  const { preferences } = useAuth();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const familySize = preferences?.familySize || 1;
  const monthlyBudget = preferences?.monthlyBudget || 15000;
  const weeklyBudget = monthlyBudget / 4;

  const [activeGoal, setActiveGoal] = useState<string>('balanced');
  const [bundleItems, setBundleItems] = useState<DietItem[]>([]);

  // Strict goal filtering engine
  useEffect(() => {
    const scaleFactor = familySize > 4 ? familySize * 0.8 : familySize;
    const filtered = INITIAL_CATALOG.filter(item => {
      if (activeGoal === 'balanced') return item.diet.includes('balanced');
      return item.diet.includes(activeGoal);
    }).map(item => ({
      ...item,
      recommendedQty: Math.max(1, Math.ceil(item.baseQty * scaleFactor))
    }));

    setBundleItems(filtered);
    setAdded(false);
  }, [activeGoal, familySize]);

  // Dynamic calculations
  const currentGoalMeta = GOALS.find(g => g.id === activeGoal) || GOALS[0];
  const totalCost = useMemo(() => bundleItems.reduce((acc, item) => acc + (item.price * item.recommendedQty), 0), [bundleItems]);
  const totalCals = useMemo(() => bundleItems.reduce((acc, item) => acc + (item.cals * item.recommendedQty), 0), [bundleItems]);
  const overBudget = totalCost > weeklyBudget;

  const handleQtyChange = (id: string, delta: number) => {
    setBundleItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.recommendedQty + delta);
        return { ...item, recommendedQty: nextQty };
      }
      return item;
    }).filter(item => item.recommendedQty > 0));
    setAdded(false);
  };

  const handleAddAllToCart = async () => {
    setIsAdding(true);
    for (const item of bundleItems) {
      if (item.recommendedQty > 0) {
        for (let i = 0; i < item.recommendedQty; i++) {
          await addToCart({
            id: item.id,
            provider_id: 'ai-smart-planner',
            name: item.name,
            price: item.price,
            image_url: getValidImageUrl(item.image_url, item.name, item.category)
          });
        }
      }
    }
    setIsAdding(false);
    setAdded(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-28">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 pt-12 pb-8 rounded-b-[40px] shadow-xl flex flex-col items-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
        <button 
          onClick={onBack} 
          className="absolute top-12 left-4 p-2.5 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-3xl mb-3 border border-white/30 shadow-inner animate-bounce duration-1000">
          {currentGoalMeta.icon}
        </div>
        <h1 className="text-2.5xl font-black tracking-tight text-center">AI Smart Diet Bundle</h1>
        <p className="text-white/80 text-xs mt-1 font-medium bg-black/20 px-4 py-1 rounded-full backdrop-blur-md">
          Personalized for {familySize} {familySize > 1 ? 'people' : 'person'} • {currentGoalMeta.label.toUpperCase()}
        </p>

        {/* Dynamic Goal Selector Bar */}
        <div className="flex gap-2 mt-6 overflow-x-auto max-w-full px-2 no-scrollbar">
          {GOALS.map(goal => (
            <button
              key={goal.id}
              onClick={() => setActiveGoal(goal.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all active:scale-95 ${
                activeGoal === goal.id
                  ? 'bg-white text-indigo-900 shadow-xl scale-105 ring-2 ring-white/50'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/10'
              }`}
            >
              <span className="text-base">{goal.icon}</span>
              <span>{goal.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 -mt-3 relative z-10">
        
        {/* Active Goal Overview Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-neutral-900 text-base flex items-center gap-2">
              <span>{currentGoalMeta.icon}</span>
              {currentGoalMeta.title}
            </h2>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {bundleItems.length} Products
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            {currentGoalMeta.desc}
          </p>
        </div>

        {/* Budget Alert Card */}
        <div className={`p-4.5 rounded-3xl border shadow-sm flex items-start gap-4 transition-all ${
          overBudget ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <div className={`p-2.5 rounded-2xl ${overBudget ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {overBudget ? <AlertCircle size={22} /> : <TrendingDown size={22} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className={`font-black text-sm ${overBudget ? 'text-red-950' : 'text-emerald-950'}`}>
                Weekly Estimate: ₹{totalCost.toLocaleString('en-IN')}
              </h3>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                overBudget ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {overBudget ? 'Over Limit' : 'Within Budget'}
              </span>
            </div>
            <p className={`text-xs mt-1 leading-snug font-medium ${overBudget ? 'text-red-700' : 'text-emerald-700'}`}>
              {overBudget 
                ? `Exceeds your weekly limit of ₹${weeklyBudget.toLocaleString('en-IN')}. Adjust quantities below.`
                : `Perfect! Fits comfortably inside your weekly allowance of ₹${weeklyBudget.toLocaleString('en-IN')}.`}
            </p>
          </div>
        </div>

        {/* AI Macro Target Breakdown */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-indigo-600" />
              <h3 className="font-bold text-neutral-800 text-sm">Target Weekly Macro Allocation</h3>
            </div>
            <span className="text-xs font-extrabold text-neutral-400">~{totalCals} kcal/wk</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-blue-50/80 rounded-2xl p-3 text-center border border-blue-100/60">
              <span className="block text-xl font-black text-blue-600">{currentGoalMeta.macros.p}%</span>
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Protein</span>
            </div>
            <div className="bg-amber-50/80 rounded-2xl p-3 text-center border border-amber-100/60">
              <span className="block text-xl font-black text-amber-600">{currentGoalMeta.macros.c}%</span>
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Carbs</span>
            </div>
            <div className="bg-rose-50/80 rounded-2xl p-3 text-center border border-rose-100/60">
              <span className="block text-xl font-black text-rose-600">{currentGoalMeta.macros.f}%</span>
              <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">Healthy Fats</span>
            </div>
          </div>
        </div>

        {/* AI Daily Meal Plan Breakdown */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-indigo-600" />
            <h3 className="font-bold text-neutral-800 text-sm">Recommended Daily Meal Structure</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/60">
              <span className="font-black text-indigo-900 block mb-0.5">🌅 Breakfast</span>
              <p className="text-indigo-700 font-medium">{currentGoalMeta.mealPlan.breakfast}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/60">
              <span className="font-black text-emerald-900 block mb-0.5">☀️ Lunch</span>
              <p className="text-emerald-700 font-medium">{currentGoalMeta.mealPlan.lunch}</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100/60">
              <span className="font-black text-amber-900 block mb-0.5">🍎 Evening Snack</span>
              <p className="text-amber-700 font-medium">{currentGoalMeta.mealPlan.snack}</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100/60">
              <span className="font-black text-purple-900 block mb-0.5">🌙 Dinner</span>
              <p className="text-purple-700 font-medium">{currentGoalMeta.mealPlan.dinner}</p>
            </div>
          </div>
        </div>

        {/* Recommended Product Items */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-black text-neutral-900 text-base flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              {currentGoalMeta.label} Recommended Basket ({bundleItems.length})
            </h2>
          </div>

          <div className="space-y-3">
            {bundleItems.map(item => (
              <div 
                key={item.id} 
                className="bg-white p-3.5 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-3.5 transition-all hover:border-indigo-100"
              >
                <div className="w-16 h-16 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={getValidImageUrl(item.image_url, item.name, item.category)} 
                    alt={item.name}
                    className="w-full h-full object-contain p-1 rounded-xl"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-neutral-900 text-sm truncate">{item.name}</h4>
                  <p className="text-[11px] text-neutral-400 font-medium">₹{item.price} • {item.cals} kcal</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      P: {item.proteinG}g
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      C: {item.carbsG}g
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-neutral-50 p-1.5 rounded-xl border border-neutral-100 shrink-0">
                  <button 
                    onClick={() => handleQtyChange(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-neutral-600 hover:text-neutral-900 border border-neutral-200 active:scale-95 shadow-xs"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-black text-sm w-5 text-center text-neutral-800">
                    {item.recommendedQty}
                  </span>
                  <button 
                    onClick={() => handleQtyChange(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 active:scale-95 shadow-xs"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating Add All to Cart Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-neutral-100 shadow-2xl z-30">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">Total AI Basket</span>
            <span className="text-xl font-black text-neutral-950">₹{totalCost.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={handleAddAllToCart}
            disabled={isAdding || bundleItems.length === 0}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              added 
                ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/30 hover:opacity-95'
            }`}
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : added ? (
              <>
                <ShieldCheck size={18} />
                Added {currentGoalMeta.label} Bundle to Cart!
              </>
            ) : (
              <>
                <Zap size={18} />
                Add {currentGoalMeta.label} Bundle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
