'use client';

import { ArrowLeft, Sparkles, Apple, Carrot, Beef, Milk, Cookie, Wheat, Droplet, Flame, Coffee, ShoppingBasket } from 'lucide-react';

interface CategoriesPageProps {
  onSelectCategory: (categoryId: string) => void;
  onBack?: () => void;
}

const CATEGORIES = [
  {
    id: 'For You',
    name: 'For You',
    icon: <Sparkles size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-500/30',
    cardBg: 'bg-purple-50/80 hover:bg-purple-100/80 border-purple-200/80 text-purple-950',
    emoji: '✨',
  },
  {
    id: 'Top Deals',
    name: 'Top Deals',
    icon: <Flame size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30',
    cardBg: 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-200/80 text-orange-950',
    emoji: '🔥',
  },
  {
    id: 'Fruits',
    name: 'Fruits',
    icon: <Apple size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30',
    cardBg: 'bg-rose-50/80 hover:bg-rose-100/80 border-rose-200/80 text-rose-950',
    emoji: '🍎',
  },
  {
    id: 'Vegetables',
    name: 'Vegetables',
    icon: <Carrot size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30',
    cardBg: 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200/80 text-emerald-950',
    emoji: '🥦',
  },
  {
    id: 'Dairy',
    name: 'Dairy',
    icon: <Milk size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600 shadow-sky-500/30',
    cardBg: 'bg-sky-50/80 hover:bg-sky-100/80 border-sky-200/80 text-sky-950',
    emoji: '🥛',
  },
  {
    id: 'Bakery',
    name: 'Bakery',
    icon: <Wheat size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-amber-500/30',
    cardBg: 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200/80 text-amber-950',
    emoji: '🍞',
  },
  {
    id: 'Meat',
    name: 'Non-Veg & Meat',
    icon: <Beef size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30',
    cardBg: 'bg-pink-50/80 hover:bg-pink-100/80 border-pink-200/80 text-pink-950',
    emoji: '🥩',
  },
  {
    id: 'Oils',
    name: 'Oils & Fats',
    icon: <Droplet size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-500/30',
    cardBg: 'bg-yellow-50/80 hover:bg-yellow-100/80 border-yellow-200/80 text-yellow-950',
    emoji: '🫒',
  },
  {
    id: 'Grains',
    name: 'Grains & Rice',
    icon: <ShoppingBasket size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-500/30',
    cardBg: 'bg-teal-50/80 hover:bg-teal-100/80 border-teal-200/80 text-teal-950',
    emoji: '🍚',
  },
  {
    id: 'Snacks',
    name: 'Snacks & Biscuits',
    icon: <Cookie size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-orange-500/30',
    cardBg: 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-200/80 text-orange-950',
    emoji: '🍪',
  },
  {
    id: 'Beverages',
    name: 'Beverages',
    icon: <Coffee size={28} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-amber-700 to-stone-800 shadow-stone-500/30',
    cardBg: 'bg-stone-100/80 hover:bg-stone-200/80 border-stone-300/80 text-stone-950',
    emoji: '☕',
  },
];

export function CategoriesPage({ onSelectCategory, onBack }: CategoriesPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 pt-10 pb-8 flex items-center gap-4 shadow-lg relative overflow-hidden rounded-b-[40px]">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white">
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-black text-white">Explore Categories</h1>
          <p className="text-white/80 text-xs font-semibold mt-0.5">Find fresh items sorted by category</p>
        </div>
      </div>

      <div className="p-5 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative rounded-3xl border-2 flex flex-col items-center justify-center gap-3.5 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-95 overflow-hidden group ${cat.cardBg}`}
            >
              {/* Icon Box */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${cat.iconBg} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              
              {/* Category Name */}
              <span className="font-black text-sm text-center tracking-tight leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
