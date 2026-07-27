'use client';

import { useState, useEffect } from 'react';
import { Package, DollarSign, Award, BarChart3, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '@/lib/providers';
import { getValidImageUrl } from '@/lib/utils';

interface OrderItem {
  product_name: string;
  product_image: string;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  total_amount: number;
  items: OrderItem[];
}

export function SalesRecap() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { session, preferences } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!session) return;
    fetch(`${API_BASE}/orders/history`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) setOrders(result.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate Stats
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalOrders = orders.length;
  let totalItems = 0;
  
  // Calculate favorite products
  const productCounts: Record<string, { qty: number; spent: number; image: string }> = {};
  orders.forEach(o => {
    o.items?.forEach(item => {
      totalItems += item.quantity;
      if (!productCounts[item.product_name]) {
        productCounts[item.product_name] = { qty: 0, spent: 0, image: item.product_image };
      }
      productCounts[item.product_name].qty += item.quantity;
      productCounts[item.product_name].spent += Number(item.total_price);
    });
  });

  const favoriteProducts = Object.entries(productCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-28 font-sans">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white shadow-sm rounded-b-[40px] mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900">Your Recap</h1>
            <p className="text-neutral-500 text-sm mt-1">Your Shopping Analytics & Preferences</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center border border-primary/20">
            <BarChart3 size={22} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Preferences Block */}
      {preferences && (
        <div className="px-6 mb-6">
          <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 shrink-0">
              <Heart size={24} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">Your Diet Profile</h3>
              <p className="text-sm text-neutral-500 mt-1 mb-2">Based on your settings, we prioritize these items:</p>
              <div className="flex flex-wrap gap-2">
                {preferences.dietary.length > 0 ? (
                  preferences.dietary.map(d => (
                    <span key={d} className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">No special diet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-primary" />
          </div>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Total Spent</p>
          <h2 className="text-xl font-black text-neutral-900">₹{totalSpent.toLocaleString()}</h2>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
            <ShoppingCart size={20} className="text-blue-500" />
          </div>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Orders</p>
          <h2 className="text-xl font-black text-neutral-900">{totalOrders}</h2>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
            <Package size={20} className="text-amber-500" />
          </div>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Items Bought</p>
          <h2 className="text-xl font-black text-neutral-900">{totalItems}</h2>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
            <Award size={20} className="text-purple-500" />
          </div>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Top Item</p>
          <h2 className="text-sm font-black text-neutral-900 truncate">
            {favoriteProducts.length > 0 ? favoriteProducts[0].name : 'None yet'}
          </h2>
        </div>
      </div>

      {/* Favorite Products List */}
      <div className="px-6 mb-6">
        <h3 className="font-black text-lg text-neutral-900 mb-4">Your Most Ordered Items</h3>
        
        {favoriteProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm text-center">
            <p className="text-4xl mb-3">🛒</p>
            <h4 className="font-bold text-neutral-900 mb-1">No orders yet</h4>
            <p className="text-sm text-neutral-400">Place an order to see your favorites here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteProducts.map((product, idx) => (
              <div key={product.name} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getValidImageUrl(product.image, product.name)} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-neutral-900 truncate">{product.name}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Bought {product.qty} times</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-primary">₹{product.spent}</p>
                </div>
                <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
