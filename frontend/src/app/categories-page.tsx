'use client';

import { ArrowLeft, Sparkles, Apple, Carrot, Beef, Milk, Cookie, Wheat, Droplet, Flame } from 'lucide-react';

interface CategoriesPageProps {
  onSelectCategory: (categoryId: string) => void;
  onBack?: () => void;
}

export function CategoriesPage({ onSelectCategory, onBack }: CategoriesPageProps) {
  const categories = [
    { id: 'For You', name: 'For You', icon: <Sparkles size={24} className="text-purple-500" />, bg: 'bg-purple-100' },
    { id: 'Top Deals', name: 'Top Deals', icon: <Flame size={24} className="text-orange-500" />, bg: 'bg-orange-100' },
    { id: 'Fruits', name: 'Fruits', icon: <Apple size={24} className="text-red-500" />, bg: 'bg-red-100' },
    { id: 'Vegetables', name: 'Vegetables', icon: <Carrot size={24} className="text-orange-500" />, bg: 'bg-orange-100' },
    { id: 'Dairy', name: 'Dairy', icon: <Milk size={24} className="text-blue-500" />, bg: 'bg-blue-100' },
    { id: 'Bakery', name: 'Bakery', icon: <Wheat size={24} className="text-amber-500" />, bg: 'bg-amber-100' },
    { id: 'Meat', name: 'Non-veg & Meat', icon: <Beef size={24} className="text-rose-500" />, bg: 'bg-rose-100' },
    { id: 'Oils', name: 'Oils', icon: <Droplet size={24} className="text-yellow-500" />, bg: 'bg-yellow-100' },
    { id: 'Grains', name: 'Grains', icon: <Wheat size={24} className="text-emerald-500" />, bg: 'bg-emerald-100' },
    { id: 'Snacks', name: 'Snacks', icon: <Cookie size={24} className="text-amber-600" />, bg: 'bg-amber-100' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-neutral-100 shadow-sm">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-neutral-100">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-xl font-black">Categories</h1>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.bg}`}>
                {cat.icon}
              </div>
              <span className="font-bold text-neutral-700 text-sm text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
