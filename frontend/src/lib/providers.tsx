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

// --- Auth & App Settings Types ---
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
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    home: 'Home', categories: 'Categories', cart: 'Cart', pantry: 'Pantry', profile: 'Profile',
    health_budget: 'Health & Budget', ai_planner: 'AI Diet Planner', delivery_address: 'Delivery Address',
    payment_methods: 'Payment Methods', notifications: 'Notifications', app_settings: 'App Settings',
    dark_mode: 'Dark Mode', language: 'Language', order_history: 'Order History', reorder: 'Re-order',
    admin_dashboard: 'Admin Dashboard', welcome_fresh: 'Fresh groceries in 10 minutes'
  },
  Hindi: {
    home: 'होम', categories: 'श्रेणियां', cart: 'कार्ट', pantry: 'रसोई', profile: 'प्रोफ़ाइल',
    health_budget: 'स्वास्थ्य और बजट', ai_planner: 'एआई डाइट प्लानर', delivery_address: 'डिलिवरी पता',
    payment_methods: 'भुगतान के तरीके', notifications: 'सूचनाएं', app_settings: 'ऐप सेटिंग्स',
    dark_mode: 'डार्क मोड', language: 'भाषा', order_history: 'ऑर्डर इतिहास', reorder: 'पुनः ऑर्डर करें',
    admin_dashboard: 'एडमिन डैशबोर्ड', welcome_fresh: '10 मिनट में ताज़ा सामान'
  },
  Telugu: {
    home: 'హోమ్', categories: 'వర్గాలు', cart: 'కార్ట్', pantry: 'అమరిక', profile: 'ప్రొఫైల్',
    health_budget: 'ఆరోగ్యం & బడ్జెట్', ai_planner: 'AI డైట్ ప్లానర్', delivery_address: 'డెలివరీ చిరునామా',
    payment_methods: 'చెల్లింపు విధానాలు', notifications: 'నోటిఫికేషన్లు', app_settings: 'యాప్ సెట్టింగ్‌లు',
    dark_mode: 'డార్క్ మోడ్', language: 'భాష', order_history: 'ఆర్డర్ చరిత్ర', reorder: 'మళ్లీ ఆర్డర్ చేయండి',
    admin_dashboard: 'అడ్మిన్ డాష్‌బోర్డ్', welcome_fresh: '10 నిమిషాల్లో తాజా గ్రాసరీలు'
  },
  Tamil: {
    home: 'முகப்பு', categories: 'வகைகள்', cart: 'கூடை', pantry: 'சமையலறை', profile: 'சுயவிவரம்',
    health_budget: 'சுகாதாரம் & பட்ஜெட்', ai_planner: 'AI டயட் பிளானர்', delivery_address: 'டெலிவரி முகவரி',
    payment_methods: 'பணம் செலுத்தும் முறைகள்', notifications: 'அறிவிப்புகள்', app_settings: 'பயன்பாட்டு அமைப்புகள்',
    dark_mode: 'டார்க் மோட்', language: 'மொழி', order_history: 'ஆர்டர் வரலாறு', reorder: 'மீண்டும் ஆர்டர் செய்க',
    admin_dashboard: 'நிர்வாகப் பலகை', welcome_fresh: '10 நிமிடங்களில் புதிய பொருட்கள்'
  },
  Kannada: {
    home: 'ಮುಖ್ಯ ಪುಟ', categories: 'ವರ್ಗಗಳು', cart: 'ಕಾರ್ಟ್', pantry: 'ಅಡುಗೆಮನೆ', profile: 'ಪ್ರೊಫೈಲ್',
    health_budget: 'ಆರೋಗ್ಯ ಮತ್ತು ಬಜೆಟ್', ai_planner: 'ಎಐ ಡಯಟ್ ಪ್ಲಾನರ್', delivery_address: 'ಡೆಲಿವರಿ ವಿಳಾಸ',
    payment_methods: 'ಪಾವತಿ ವಿಧಾನಗಳು', notifications: 'ಸೂಚನೆಗಳು', app_settings: 'ಆಪ್ ಸಂಯೋಜನೆಗಳು',
    dark_mode: 'ಡಾರ್ಕ್ ಮೋಡ್', language: 'ಭಾಷೆ', order_history: 'ಆರ್ಡರ್ ಇತಿಹಾಸ', reorder: 'ಮತ್ತೆ ಆರ್ಡರ್ ಮಾಡಿ',
    admin_dashboard: 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', welcome_fresh: '10 ನಿಮಿಷಗಳಲ್ಲಿ ತಾಜಾ ಗ್ರೋಸರಿಗಳು'
  },
  Malayalam: {
    home: 'ഹോം', categories: 'വിഭാഗങ്ങൾ', cart: 'കാർട്ട്', pantry: 'അടുക്കള', profile: 'പ്രൊഫൈൽ',
    health_budget: 'ആരോഗ്യവും ബജറ്റും', ai_planner: 'എഐ ഡയറ്റ് പ്ലാനർ', delivery_address: 'ഡെലിവറി വിലാസം',
    payment_methods: 'പേയ്മെന്റ് രീതികൾ', notifications: 'അറിയിപ്പുകൾ', app_settings: 'ആപ്പ് ക്രമീകരണങ്ങൾ',
    dark_mode: 'ഡാർക്ക് മോഡ്', language: 'ഭാഷ', order_history: 'ഓർഡർ ചരിത്രം', reorder: 'വീണ്ടും ഓർഡർ ചെയ്യുക',
    admin_dashboard: 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്', welcome_fresh: '10 മിനിറ്റിൽ ഫ്രഷ് ഗ്രോസറികൾ'
  },
  Spanish: {
    home: 'Inicio', categories: 'Categorías', cart: 'Carrito', pantry: 'Despensa', profile: 'Perfil',
    health_budget: 'Salud y Presupuesto', ai_planner: 'Planificador de Dieta IA', delivery_address: 'Dirección de Entrega',
    payment_methods: 'Métodos de Pago', notifications: 'Notificaciones', app_settings: 'Ajustes de la App',
    dark_mode: 'Modo Oscuro', language: 'Idioma', order_history: 'Historial de Pedidos', reorder: 'Volver a Pedir',
    admin_dashboard: 'Panel de Administración', welcome_fresh: 'Comestibles frescos en 10 minutos'
  }
};

// --- Providers Component ---
export function AppProviders({ children }: { children: ReactNode }) {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Settings State
  const [darkMode, setDarkModeState] = useState(false);
  const [language, setLanguageState] = useState('English');

  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPrefs = localStorage.getItem('grocery_preferences');
      if (storedPrefs) {
        try { setPreferences(JSON.parse(storedPrefs)); } catch (e) {}
      }
      const storedDark = localStorage.getItem('grocery_dark_mode');
      if (storedDark === 'true') {
        setDarkModeState(true);
        document.documentElement.classList.add('dark');
      } else {
        setDarkModeState(false);
        document.documentElement.classList.remove('dark');
      }
      const storedLang = localStorage.getItem('grocery_language');
      if (storedLang) {
        setLanguageState(storedLang);
      }
    }
  }, []);

  const setDarkMode = (dark: boolean) => {
    setDarkModeState(dark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('grocery_dark_mode', String(dark));
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('grocery_language', lang);
    }
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.English;
    return langDict[key] || TRANSLATIONS.English[key] || key;
  };

  const updatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('grocery_preferences', JSON.stringify(newPrefs));
    }
  };

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Initialize Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      } else if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('grocery_user');
        const storedSession = localStorage.getItem('grocery_session');
        if (storedUser && storedSession) {
          try {
            setUser(JSON.parse(storedUser));
            setSession(JSON.parse(storedSession));
          } catch (e) {}
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
      .then(d => {
        if (d && d.success) {
          // Normalize provider_id: backend may return null, frontend needs string
          setCartItems((d.data || []).map((item: any) => ({
            ...item,
            provider_id: item.provider_id || '',
          })));
        }
      })
      .catch(() => {});
    } else {
      setCartItems([]);
    }
  }, [session]);

  const addToCart = async (product: Omit<CartItem, 'quantity'>) => {
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
    <AuthContext.Provider value={{
      user, session, loading: authLoading, signOut: handleSignOut, setAuthSession,
      preferences, updatePreferences, darkMode, setDarkMode, language, setLanguage, t
    }}>
      <CartContext.Provider value={{ items: cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
        {children}
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

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
