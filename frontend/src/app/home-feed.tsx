'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronRight, Tag, Zap, Gift } from 'lucide-react';
import { useCart, useAuth } from '@/lib/providers';
import { getValidImageUrl, generateFoodSvgDataUri } from '@/lib/utils';
import { StockAlertBell } from './stock-alerts';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string;
  category: string;
  health_score: number;
  stock_quantity: number;
  provider_id: string;
  provider_name: string;
}

export function HomeFeedPrototype({ onOpenAlerts, initialCategory = null }: { onOpenAlerts?: () => void, initialCategory?: string | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [activeAddressText, setActiveAddressText] = useState('Chettipedu, Thandalam, Chennai, PIN: 602105');
  const { addToCart } = useCart();
  const { user, preferences } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grocery_active_address');
      if (stored) setActiveAddressText(stored);
    }
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        return res.json();
      })
      .then(result => {
        if (result.success) {
          setProducts(result.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = [
    { emoji: '🔥', label: 'Top Deals' },
    { emoji: '🥦', label: 'Vegetables' },
    { emoji: '🍎', label: 'Fruits' },
    { emoji: '🥛', label: 'Dairy' },
    { emoji: '🍞', label: 'Bakery' },
    { emoji: '🥩', label: 'Meat' },
    { emoji: '🫒', label: 'Oils' },
    { emoji: '🍚', label: 'Grains' },
    { emoji: '🍪', label: 'Snacks' },
    { emoji: '☕', label: 'Beverages' },
  ];

  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});

  const filtered = products.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = !selectedCategory;
    if (selectedCategory) {
      const targetCat = selectedCategory.toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();

      if (targetCat === 'top deals') {
        matchesCategory = p.price < 100 || p.health_score > 90;
      } else if (targetCat === 'for you') {
        matchesCategory = p.health_score >= 80;
      } else if (targetCat.includes('beverag') || targetCat.includes('drink')) {
        matchesCategory = pCat.includes('beverag') || pCat.includes('drink') || pName.includes('juice') || pName.includes('coffee') || pName.includes('tea') || pName.includes('bull') || pName.includes('cola') || pName.includes('water');
      } else if (targetCat.includes('oil')) {
        matchesCategory = pCat.includes('oil') || pName.includes('oil') || pName.includes('ghee');
      } else if (targetCat.includes('snack')) {
        matchesCategory = pCat.includes('snack') || pName.includes('biscuit') || pName.includes('chips') || pName.includes('kurkure') || pName.includes('lays') || pName.includes('oreo') || pName.includes('cookie') || pName.includes('popcorn') || pName.includes('chocolate') || pName.includes('bhujia');
      } else if (targetCat.includes('grain') || targetCat.includes('rice')) {
        matchesCategory = pCat.includes('grain') || pCat.includes('rice') || pName.includes('rice') || pName.includes('atta') || pName.includes('dal');
      } else if (targetCat.includes('meat') || targetCat.includes('non-veg')) {
        matchesCategory = pCat.includes('meat') || pName.includes('chicken') || pName.includes('mutton') || pName.includes('fish');
      } else {
        matchesCategory = pCat.includes(targetCat) || targetCat.includes(pCat);
      }
    }
    return matchesSearch && matchesCategory;
  });

  const displayedProducts = searchQuery ? filtered : (selectedCategory ? filtered : filtered);

  const handleAddToCart = async (product: Product) => {
    if (product.stock_quantity <= 0) return;
    setAddingIds(prev => ({ ...prev, [product.id]: true }));
    try {
      await addToCart({
        id: product.id,
        provider_id: product.provider_id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || '',
      });
    } finally {
      setTimeout(() => setAddingIds(prev => ({ ...prev, [product.id]: false })), 600);
    }
  };

  // Helper to get personalized badges for each product card
  const getProductBadges = (product: Product) => {
    const badges: React.ReactNode[] = [];
    const nameLower = product.name.toLowerCase();
    const catLower = product.category.toLowerCase();

    if (!preferences) return badges;

    // 1. Allergy Alerts
    if (preferences.dietary.includes('dairy-free') && (catLower === 'dairy' || nameLower.includes('milk') || nameLower.includes('yogurt'))) {
      badges.push(
        <span key="allergy-dairy" className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-100 shrink-0">
          ⚠️ Contains Dairy
        </span>
      );
    }
    if (preferences.dietary.includes('gluten-free') && (catLower === 'bakery' || nameLower.includes('bread') || nameLower.includes('wheat'))) {
      badges.push(
        <span key="allergy-gluten" className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-100 shrink-0">
          ⚠️ Contains Gluten
        </span>
      );
    }

    // 2. Dietary Preference Matches
    if (preferences.dietary.includes('organic') && (nameLower.includes('organic') || nameLower.includes('spinach') || nameLower.includes('banana') || nameLower.includes('tomato'))) {
      badges.push(
        <span key="pref-organic" className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
          🥦 Organic
        </span>
      );
    }
    if ((preferences.dietary.includes('vegan') || preferences.dietary.includes('vegetarian')) && catLower === 'meat') {
      badges.push(
        <span key="pref-meat-warn" className="bg-amber-50 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-100 shrink-0">
          ⚠️ Contains Meat
        </span>
      );
    } else if (preferences.dietary.includes('vegan') && (catLower === 'vegetables' || catLower === 'fruits' || catLower === 'grains')) {
      badges.push(
        <span key="pref-vegan-match" className="bg-green-50 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
          🌱 Vegan Choice
        </span>
      );
    }

    return badges;
  };

  // Stock status badge
  const getStockBadge = (product: Product) => {
    if (product.stock_quantity === 0) {
      return (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full z-10 uppercase tracking-wider shadow-lg shadow-red-500/30">
          Out of Stock
        </div>
      );
    }
    if (product.stock_quantity <= 5) {
      return (
        <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full z-10 uppercase tracking-wider shadow-lg shadow-amber-500/30 animate-pulse">
          Only {product.stock_quantity} left
        </div>
      );
    }
    return null;
  };

  // Hero Banner slides
  const heroSlides = [
    {
      bg: 'from-emerald-600 to-teal-700',
      icon: <Zap size={28} className="text-yellow-300" />,
      badge: '⚡ Flash Deal',
      title: 'Up to 40% Off',
      subtitle: 'On fresh vegetables today',
      cta: 'Shop Now',
      emoji: '🥦',
    },
    {
      bg: 'from-violet-600 to-purple-700',
      icon: <Gift size={28} className="text-pink-300" />,
      badge: '🎁 Special Offer',
      title: 'Free Delivery',
      subtitle: 'On all orders above ₹200',
      cta: 'Order Now',
      emoji: '🚀',
    },
    {
      bg: 'from-sky-600 to-blue-700',
      icon: <Tag size={28} className="text-cyan-300" />,
      badge: '🏷️ New Items',
      title: 'Fresh Arrivals',
      subtitle: 'Organic & seasonal produce',
      cta: 'Explore',
      emoji: '🍎',
    },
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  // Auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <div className="px-6 lg:px-12 pt-8 pb-6 rounded-b-[44px] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl relative z-10 overflow-hidden">
        {/* Decorative glow blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20 shrink-0">
                <MapPin size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Delivering to</span>
                <span className="text-sm font-bold truncate max-w-[220px]">
                  {activeAddressText}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <StockAlertBell onClick={() => onOpenAlerts?.()} />
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-neutral-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-neutral-900 shadow-md outline-none font-medium placeholder:text-neutral-400 focus:ring-4 focus:ring-white/20 transition-all border border-transparent"
              placeholder="Search fresh groceries..."
            />
          </div>
        </div>
      </div>

      {/* ── Hero Promotional Banner ── */}
      <div className="px-6 lg:px-12 pt-5">
        <div className="max-w-7xl mx-auto">
          <div
            onClick={() => {
              const targetCat = heroIndex === 0 ? 'Vegetables' : heroIndex === 1 ? 'Top Deals' : 'Fruits';
              setSelectedCategory(targetCat);
              document.getElementById('product-feed')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`relative bg-gradient-to-r ${heroSlides[heroIndex].bg} rounded-3xl p-5 text-white overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">{heroSlides[heroIndex].badge}</span>
                <h2 className="text-2xl font-black mt-2 leading-tight">{heroSlides[heroIndex].title}</h2>
                <p className="text-white/80 text-xs mt-1 font-medium">{heroSlides[heroIndex].subtitle}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetCat = heroIndex === 0 ? 'Vegetables' : heroIndex === 1 ? 'Top Deals' : 'Fruits';
                    setSelectedCategory(targetCat);
                    document.getElementById('product-feed')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-3 flex items-center gap-1.5 text-xs font-black bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
                >
                  {heroSlides[heroIndex].cta} <ChevronRight size={14} />
                </button>
              </div>
              <div className="text-6xl ml-4 select-none">{heroSlides[heroIndex].emoji}</div>
            </div>
            {/* Dots */}
            <div className="flex gap-1.5 mt-4 relative z-10" onClick={e => e.stopPropagation()}>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'bg-white w-5' : 'bg-white/40 w-1.5'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-neutral-950">Categories</h2>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs text-primary font-black uppercase tracking-wider"
          >
            {selectedCategory ? 'Clear Filter' : 'See All'}
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => setSelectedCategory(selectedCategory === cat.label ? null : cat.label)}
              className={`flex flex-col items-center gap-2 shrink-0 cursor-pointer transition-all ${selectedCategory === cat.label ? 'scale-105' : ''}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-all ${
                selectedCategory === cat.label
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-white border-neutral-100 hover:border-primary/20'
              }`}>
                {cat.emoji}
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${selectedCategory === cat.label ? 'text-primary font-black' : 'text-neutral-500'}`}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>
        </div> {/* end max-w-7xl */}
      </div>

      {/* Popular Products */}
      <div id="product-feed" className="px-6 lg:px-12 pb-8 scroll-mt-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-neutral-950">
            {selectedCategory ? selectedCategory : 'All Products'}
          </h2>
          <span className="text-xs font-bold text-neutral-400">
            {searchQuery ? filtered.length : displayedProducts.length} items
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-neutral-800">No products found</p>
            <p className="text-xs text-neutral-400 mt-1">Try expanding your filters or search keywords</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {displayedProducts.map(product => {
              const badges = getProductBadges(product);
              const isOutOfStock = product.stock_quantity === 0;
              return (
                <div key={product.id} className={`bg-white rounded-3xl p-4 shadow-sm border border-neutral-100 hover:border-primary/20 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group ${isOutOfStock ? 'opacity-75' : ''}`}>
                  {/* Stock Badge */}
                  {getStockBadge(product)}

                  {/* Health Score Tag */}
                  {product.health_score && (
                    <div className="absolute top-2 right-2 bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-100 z-10">
                      💚 {product.health_score}
                    </div>
                  )}

                  {/* Image container - Full Frame High Clarity Card */}
                  <div className={`w-full aspect-square bg-white rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden p-0.5 border border-neutral-100/80 shadow-2xs ${isOutOfStock ? 'grayscale opacity-60' : ''}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getValidImageUrl(product.image_url, product.name, product.category)}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = generateFoodSvgDataUri(product.name, product.category);
                      }}
                      className="object-cover w-full h-full rounded-xl transition-transform duration-500 group-hover:scale-105"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-xs rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xs font-black bg-black/60 px-3 py-1.5 rounded-full shadow-md">Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Badge Row (Allergies / Prefs) */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {badges}
                    </div>
                  )}

                  <h3 className="font-bold text-neutral-900 text-sm leading-tight mb-1 truncate">{product.name}</h3>
                  <p className="text-neutral-400 text-[10px] mb-1 font-semibold uppercase tracking-wider text-primary">By {product.provider_name}</p>
                  <p className="text-neutral-400 text-xs mb-3 font-semibold">{product.unit}</p>

                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <span className="text-base font-black text-primary">₹{product.price}</span>
                      <span className="text-[10px] text-neutral-400 ml-1">/{product.unit}</span>
                    </div>
                    {isOutOfStock ? <div className="px-2 py-1 bg-neutral-100 rounded-lg text-[10px] font-bold text-neutral-400">
                        Out of Stock
                      </div> : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          addingIds[product.id] 
                            ? 'bg-green-500 text-white shadow-md shadow-green-500/30' 
                            : 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {addingIds[product.id] ? <span className="text-sm font-bold">✓</span> : <span className="text-lg font-bold">+</span>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div> {/* end max-w-7xl */}
      </div>
    </div>
  );
}
