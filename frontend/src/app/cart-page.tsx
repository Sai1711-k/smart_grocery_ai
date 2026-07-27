'use client';

import { useCart } from '@/lib/providers';
import { ChevronLeft, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { getValidImageUrl } from '@/lib/utils';

export function CartPage({ onCheckout }: { onCheckout: () => void }) {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  const deliveryFee = 40;
  const tax = Math.round(cartTotal * 0.05);
  const total = cartTotal + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 px-6 pt-24 items-center">
        <div className="w-40 h-40 bg-neutral-100 rounded-full flex items-center justify-center text-6xl mb-6">🛒</div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
        <p className="text-neutral-400 text-center">Looks like you haven't added any groceries to your cart yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-32">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold text-neutral-900">My Cart</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 flex gap-4 relative overflow-hidden">
            <div className="w-24 h-24 bg-neutral-50 rounded-2xl shrink-0 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getValidImageUrl(item.image_url, item.name)} alt={item.name} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-neutral-900 text-sm w-3/4">{item.name}</h3>
                  <button onClick={() => removeFromCart(item.id, item.provider_id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-primary font-black mt-1">₹{item.price}</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateQuantity(item.id, item.provider_id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-200"
                >-</button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.provider_id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold hover:bg-primary-hover shadow-md shadow-primary/20"
                >+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Checkout Bar */}
      <div className="fixed bottom-[64px] left-0 right-0 max-w-[428px] mx-auto bg-white p-6 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-neutral-100">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-neutral-500 font-medium">Total Price</span>
          <span className="text-2xl font-black text-primary">₹{total}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary-hover shadow-lg shadow-primary/30 transition-transform active:scale-95"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
