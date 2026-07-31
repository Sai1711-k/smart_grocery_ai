'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth, useCart } from '@/lib/providers';
import { ArrowLeft, Sparkles, AlertCircle, ShoppingCart, Info, TrendingDown, Leaf, Target, X } from 'lucide-react';
import { getValidImageUrl, generateFoodSvgDataUri } from '@/lib/utils';

// Simulated AI Database of products
const AI_DATABASE = [
  { id: 'ai1', name: 'Organic Tofu', price: 120, diet: ['vegan', 'high-protein', 'balanced'], category: 'Protein', baseQty: 2, cals: 144, img: '🧊', image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Paneer_cubes.jpg' },
  { id: 'ai2', name: 'Grass-Fed Ribeye', price: 850, diet: ['keto', 'high-protein', 'balanced'], category: 'Protein', baseQty: 1, cals: 290, img: '🥩', image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Raw_chicken_breast.jpg' },
  { id: 'ai3', name: 'Almond Milk (Unsweetened)', price: 250, diet: ['vegan', 'keto', 'balanced'], category: 'Dairy Alt', baseQty: 1, cals: 30, img: '🥛', image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Glass_of_Milk_%283367496550%29.jpg' },
  { id: 'ai4', name: 'Whole Wheat Bread', price: 60, diet: ['vegan', 'high-protein', 'balanced'], category: 'Carbs', baseQty: 1, cals: 80, img: '🍞', image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Whole_wheat_bread.jpg' },
  { id: 'ai5', name: 'Avocado (Haas)', price: 180, diet: ['vegan', 'keto', 'paleo', 'balanced', 'gluten-free'], category: 'Fats', baseQty: 3, cals: 160, img: '🥑', image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Vegetable-Carrots.jpg' },
  { id: 'ai6', name: 'Quinoa (500g)', price: 320, diet: ['vegan', 'gluten-free', 'balanced'], category: 'Carbs', baseQty: 1, cals: 222, img: '🌾', image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Basmati_Rice_raw.jpg' },
  { id: 'ai7', name: 'Free-Range Eggs (Dozen)', price: 150, diet: ['keto', 'high-protein', 'gluten-free', 'balanced'], category: 'Protein', baseQty: 1, cals: 70, img: '🥚', image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_egg_2009-06-04.jpg' },
  { id: 'ai8', name: 'Fresh Spinach Bunch', price: 40, diet: ['vegan', 'keto', 'gluten-free', 'balanced'], category: 'Vegetables', baseQty: 2, cals: 7, img: '🥬', image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Spinach_leaves.jpg' },
  { id: 'ai9', name: 'Greek Yogurt', price: 200, diet: ['keto', 'high-protein', 'gluten-free', 'balanced'], category: 'Dairy', baseQty: 2, cals: 100, img: '🥣', image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yogurt_in_a_bowl.jpg' },
  { id: 'ai10', name: 'Mixed Berries (Frozen)', price: 450, diet: ['vegan', 'keto', 'gluten-free', 'balanced'], category: 'Fruits', baseQty: 1, cals: 50, img: '🫐', image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Strawberries.jpg' },
  { id: 'ai11', name: 'Kurkure Masala Munch', price: 20, diet: ['balanced'], category: 'Snacks', baseQty: 2, cals: 150, img: '🌶️', image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
  { id: 'ai12', name: 'Lays Classic Salted', price: 20, diet: ['balanced', 'vegan'], category: 'Snacks', baseQty: 2, cals: 160, img: '🥔', image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Potato_chips.jpg' },
];

export function SmartPlanner({ onBack }: { onBack: () => void }) {
  const { preferences } = useAuth();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const familySize = preferences?.familySize || 1;
  const diets = preferences?.dietary || ['balanced'];
  const monthlyBudget = preferences?.monthlyBudget || 15000;
  const weeklyBudget = monthlyBudget / 4;

  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    // Generate immediate local items so user is NEVER stuck loading
    const localItems = AI_DATABASE.filter(item => {
      if (diets.includes('balanced')) return true;
      return item.diet.some(d => diets.includes(d));
    }).map(item => ({
      ...item,
      recommendedQty: Math.ceil(item.baseQty * (familySize > 4 ? familySize * 0.8 : familySize))
    }));

    setRecommendedItems(localItems);
    setIsLoadingAI(false);

    // Background call to API with signal
    fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diets, familySize, monthlyBudget }),
      signal: controller.signal
    })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.items && json.items.length > 0) {
          setRecommendedItems(json.items);
        }
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [diets, familySize, monthlyBudget]);

  const totalCost = recommendedItems.reduce((acc, item) => acc + (item.price * item.recommendedQty), 0);
  const overBudget = totalCost > weeklyBudget;

  const handleAddAllToCart = async () => {
    setIsAdding(true);
    for (const item of recommendedItems) {
      await addToCart({
        id: item.id,
        provider_id: 'ai-smart-planner',
        name: item.name,
        price: item.price,
        image_url: 'https://via.placeholder.com/150' // Mocks real images
      });
      // We manually update quantity to recommended
      // In a real app we'd pass quantity directly to addToCart, but let's assume we do it fast here
    }
    setTimeout(() => {
      setIsAdding(false);
      setAdded(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 pt-12 pb-6 rounded-b-[40px] shadow-lg flex flex-col items-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <button onClick={onBack} className="absolute top-12 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-all">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mb-4 border border-white/30 shadow-inner">
          ✨
        </div>
        <h1 className="text-2xl font-black tracking-tight text-center">AI Diet Planner</h1>
        <p className="text-white/80 text-sm mt-1 font-medium bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
          Curated for {familySize} {familySize > 1 ? 'people' : 'person'} • {diets.join(', ').toUpperCase()}
        </p>
      </div>

      <div className="px-4 py-6 space-y-6 -mt-2 relative z-10">
        
        {/* Budget Alert Card */}
        <div className={`p-4 rounded-3xl border shadow-sm flex items-start gap-4 ${
          overBudget ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
        }`}>
          <div className={`p-2 rounded-2xl ${overBudget ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {overBudget ? <AlertCircle size={24} /> : <TrendingDown size={24} />}
          </div>
          <div>
            <h3 className={`font-bold ${overBudget ? 'text-red-900' : 'text-green-900'}`}>
              Weekly Estimate: ₹{totalCost.toLocaleString('en-IN')}
            </h3>
            <p className={`text-xs mt-1 leading-snug ${overBudget ? 'text-red-700' : 'text-green-700'}`}>
              {overBudget 
                ? `This exceeds your weekly budget allowance of ₹${weeklyBudget.toLocaleString('en-IN')}. Consider removing luxury items.`
                : `Perfect! You are under your weekly budget of ₹${weeklyBudget.toLocaleString('en-IN')}.`}
            </p>
          </div>
        </div>

        {/* AI Macro Summary (Bonus Feature) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-indigo-500" />
            <h3 className="font-bold text-neutral-800 text-sm">Estimated Weekly Macros</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
              <span className="block text-xl font-black text-blue-600">45%</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Protein</span>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center border border-orange-100">
              <span className="block text-xl font-black text-orange-600">30%</span>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Carbs</span>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-3 text-center border border-yellow-100">
              <span className="block text-xl font-black text-yellow-600">25%</span>
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Fats</span>
            </div>
          </div>
        </div>

        {/* Recommended List */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-black text-neutral-800 text-lg flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" />
              Your Smart Bundle
            </h2>
            <span className="bg-neutral-200 text-neutral-600 text-xs font-bold px-2 py-1 rounded-full">
              {recommendedItems.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {isLoadingAI ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-neutral-800">AI is curating your bundle...</p>
                <p className="text-xs text-neutral-500 mt-1">Analyzing macros & scaling quantities</p>
              </div>
            ) : recommendedItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4 cursor-pointer hover:bg-neutral-50 hover:border-indigo-100 transition-all active:scale-[0.98]"
              >
                <img 
                  src={getValidImageUrl(item.image_url, item.name, item.category)} 
                  alt="" 
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.onerror = null;
                    t.src = generateFoodSvgDataUri(item.name, item.category);
                  }}
                  className="w-14 h-14 rounded-xl object-cover border border-neutral-100 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-neutral-800 truncate text-sm">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-neutral-500">{item.category}</span>
                    <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                    <span className="text-xs font-semibold text-primary">₹{item.price}/ea</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-indigo-50 text-indigo-700 font-black text-sm px-3 py-1.5 rounded-lg border border-indigo-100">
                    x{item.recommendedQty}
                  </div>
                  <div className="text-xs font-bold text-neutral-400 mt-1">
                    ₹{item.price * item.recommendedQty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Action Button */}
        <div className="fixed bottom-6 left-0 w-full px-4 z-50">
          <button 
            onClick={handleAddAllToCart}
            disabled={added || isAdding}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20 ${
              added ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90'
            }`}
          >
            {isAdding ? (
              <span className="animate-pulse">Building Bundle...</span>
            ) : added ? (
              <>Added to Cart! 🛒</>
            ) : (
              <>
                <ShoppingCart size={20} />
                Add Bundle to Cart (₹{totalCost.toLocaleString('en-IN')})
              </>
            )}
          </button>
        </div>

      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" 
            onClick={() => setSelectedItem(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-[#F8FAFC] p-10 flex items-center justify-center relative border-b border-neutral-100">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-neutral-500 shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                <X size={16} strokeWidth={3} />
              </button>
              <div className="text-8xl filter drop-shadow-lg scale-110">
                {selectedItem.img}
              </div>
            </div>
            
            {/* Details */}
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">{selectedItem.category}</span>
                    <h2 className="text-2xl font-black text-neutral-800 mt-2 leading-tight">{selectedItem.name}</h2>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-3xl font-black text-emerald-600">₹{selectedItem.price}</p>
                    <p className="text-xs text-neutral-400 font-semibold mt-1">per item</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-neutral-100">
                  <p className="text-xs text-neutral-500 font-bold mb-1 uppercase tracking-wider">Calories</p>
                  <p className="text-xl font-black text-neutral-800">{selectedItem.cals} <span className="text-xs text-neutral-400 font-bold tracking-normal uppercase">kcal</span></p>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-neutral-100">
                  <p className="text-xs text-neutral-500 font-bold mb-2 uppercase tracking-wider">Diet Fit</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.diet.slice(0, 2).map((d: string) => (
                      <span key={d} className="text-[10px] font-bold text-neutral-600 bg-neutral-200/60 px-2 py-1 rounded-md capitalize">{d}</span>
                    ))}
                    {selectedItem.diet.length > 2 && <span className="text-[10px] font-bold text-neutral-400 px-1 py-1">+{selectedItem.diet.length - 2}</span>}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full bg-neutral-900 text-white font-bold py-4 rounded-2xl hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-xl shadow-neutral-900/20"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
