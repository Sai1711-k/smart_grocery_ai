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
    icon: <Sparkles size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    emoji: '✨',
  },
  {
    id: 'Top Deals',
    name: 'Top Deals',
    icon: <Flame size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-orange-500 to-red-500',
    emoji: '🔥',
  },
  {
    id: 'Fruits',
    name: 'Fruits',
    icon: <Apple size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-red-400 to-rose-500',
    emoji: '🍎',
  },
  {
    id: 'Vegetables',
    name: 'Vegetables',
    icon: <Carrot size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    emoji: '🥦',
  },
  {
    id: 'Dairy',
    name: 'Dairy',
    icon: <Milk size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-sky-400 to-blue-500',
    emoji: '🥛',
  },
  {
    id: 'Bakery',
    name: 'Bakery',
    icon: <Wheat size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    emoji: '🍞',
  },
  {
    id: 'Meat',
    name: 'Non-Veg & Meat',
    icon: <Beef size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    emoji: '🥩',
  },
  {
    id: 'Oils',
    name: 'Oils & Fats',
    icon: <Droplet size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    emoji: '🫒',
  },
  {
    id: 'Grains',
    name: 'Grains & Rice',
    icon: <ShoppingBasket size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    emoji: '🍚',
  },
  {
    id: 'Snacks',
    name: 'Snacks',
    icon: <Cookie size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-orange-400 to-amber-500',
    emoji: '🍪',
  },
  {
    id: 'Beverages',
    name: 'Beverages',
    icon: <Coffee size={26} className="text-white" />,
    bg: 'bg-gradient-to-br from-brown-500 to-amber-700',
    emoji: '☕',
  },
];

export function CategoriesPage({ onSelectCategory, onBack }: CategoriesPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 pt-10 pb-8 flex items-center gap-4 shadow-lg relative overflow-hidden rounded-b-[40px]">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white">
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-black text-white">Categories</h1>
          <p className="text-white/70 text-xs font-medium mt-0.5">Browse {CATEGORIES.length} categories</p>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-3 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 overflow-hidden group"
            >
              {/* Gradient icon background */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${cat.bg} shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                {cat.icon}
              </div>
              <span className="font-bold text-neutral-700 dark:text-neutral-200 text-sm text-center leading-tight">{cat.name}</span>
              {/* Hover glow */}
              <div className={`absolute inset-0 ${cat.bg} opacity-0 group-hover:opacity-5 transition-opacity rounded-3xl`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
