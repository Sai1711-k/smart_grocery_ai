'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// --- Cart Types & Context ---
export interface CartItem {
  id: string; // product id
  provider_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string, provider_id: string) => Promise<void>;
  updateQuantity: (id: string, provider_id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Auth Types & Context ---
export interface UserPreferences {
  dietary: string[];
  familySize: number;
  monthlyBudget: number;
  selectedStore: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setAuthSession: (session: Session, user: User) => void;
  preferences: UserPreferences | null;
  updatePreferences: (prefs: UserPreferences) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Providers Component ---
export function AppProviders({ children }: { children: ReactNode }) {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grocery_preferences');
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const updatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('grocery_preferences', JSON.stringify(newPrefs));
    }
  };

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Initialize Auth – check Supabase session AND local fallback
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      } else if (typeof window !== 'undefined') {
        // Fallback: check locally stored session from our custom backend
        const storedUser = localStorage.getItem('grocery_user');
        const storedSession = localStorage.getItem('grocery_session');
        if (storedUser && storedSession) {
          try {
            setUser(JSON.parse(storedUser));
            setSession(JSON.parse(storedSession));
          } catch (e) {
            console.error(e);
          }
        }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cart Methods
  // Cart Methods using Backend Sync
  useEffect(() => {
    if (session) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      .then(async r => {
        if (!r.ok) return null;
        const ct = r.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) return null;
        return r.json();
      })
      .then(d => { if (d && d.success) setCartItems(d.data); })
      .catch(() => {});
    } else {
      setCartItems([]);
    }
  }, [session]);

  const addToCart = async (product: Omit<CartItem, 'quantity'>) => {
    // Optimistic update
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.provider_id === product.provider_id);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.provider_id === product.provider_id) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    if (session) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ product_id: product.id, provider_id: product.provider_id, quantity: (cartItems.find(i => i.id === product.id && i.provider_id === product.provider_id)?.quantity || 0) + 1 })
      });
    }
  };

  const removeFromCart = async (id: string, provider_id: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.provider_id === provider_id)));
    if (session) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ product_id: id, provider_id, quantity: 0 })
      });
    }
  };

  const updateQuantity = async (id: string, provider_id: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(id, provider_id);
    }
    setCartItems(prev => prev.map(item => (item.id === id && item.provider_id === provider_id) ? { ...item, quantity } : item));
    if (session) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ product_id: id, provider_id, quantity })
      });
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (session) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Helper to set session and user after custom backend login
  const setAuthSession = (newSession: Session, newUser: User) => {
    setUser(newUser);
    setSession(newSession);
    if (typeof window !== 'undefined') {
      localStorage.setItem('grocery_user', JSON.stringify(newUser));
      localStorage.setItem('grocery_session', JSON.stringify(newSession));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('grocery_user');
      localStorage.removeItem('grocery_session');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading: authLoading, signOut: handleSignOut, setAuthSession, preferences, updatePreferences }}>
      <CartContext.Provider value={{ items: cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
        {children}
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

// --- Custom Hooks ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AppProviders');
  return context;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within AppProviders');
  return context;
};
