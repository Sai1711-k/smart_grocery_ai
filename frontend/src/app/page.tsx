'use client';

import { useState } from 'react';
import { Home, ShoppingBag, ClipboardList, User, HeartPulse, Sparkles, IndianRupee, LayoutGrid } from 'lucide-react';
import { OrderHistoryPrototype } from './(dashboard)/orders-prototype';
import { HomeFeedPrototype } from './home-feed';
import { CartPage } from './cart-page';
import { AddressPage } from './address-page';
import { PaymentPage } from './payment-page';
import { ProfilePage } from './profile-page';
import { PantryPage } from './pantry-page';
import { AuthFlow } from './auth-flow';
import { SalesRecap } from './sales-recap';
import { StockAlerts } from './stock-alerts';
import { DeliveryAddresses } from './settings/delivery-addresses';
import { PaymentMethods } from './settings/payment-methods';
import { NotificationsSettings } from './settings/notifications';
import { AppSettings } from './settings/app-settings';
import { HelpSupport } from './settings/help-support';
import { useAuth, useCart } from '@/lib/providers';
import { ChatBot } from './chatbot';
import { SmartPlanner } from './smart-planner';
import { BudgetDashboard } from './budget-dashboard';
import { HealthBudgetSettings } from './settings/health-budget';
import { CategoriesPage } from './categories-page';

export default function Page() {
  const { user, loading } = useAuth();
  const { cartCount, cartTotal, clearCart } = useCart();
  const [view, setView] = useState('home');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [trackOrderId, setTrackOrderId] = useState<string | null>(null);
  const [homeCategory, setHomeCategory] = useState<string | null>(null);

  if (loading) {
    return <div className="min-h-screen bg-primary flex items-center justify-center text-white text-4xl">🛒</div>;
  }

  if (!user) {
    return <AuthFlow onComplete={() => setView('home')} />;
  }

  // Helper to render the active screen
  const renderScreen = () => {
    switch (view) {
      case 'home':
        return <HomeFeedPrototype onOpenAlerts={() => setView('alerts')} initialCategory={homeCategory} />;
      case 'categories':
        return <CategoriesPage onSelectCategory={(cat) => { setHomeCategory(cat === 'For You' ? null : cat); setView('home'); }} />;
      case 'cart':
        return <CartPage onCheckout={() => setView('address')} />;
      case 'address':
        return <AddressPage onBack={() => setView('cart')} onContinue={(addr) => { setDeliveryAddress(addr); setView('payment'); }} />;
      case 'payment':
        return <PaymentPage totalAmount={cartTotal} deliveryAddress={deliveryAddress} onBack={() => setView('address')} onSuccess={(orderId) => { clearCart(); if(orderId) setTrackOrderId(orderId); setView('history'); }} />;
      case 'history':
        return <OrderHistoryPrototype initialOrderId={trackOrderId} onBack={() => setTrackOrderId(null)} />;
      case 'recap':
        return <SalesRecap />;
      case 'alerts':
        return <StockAlerts onBack={() => setView('home')} />;
      case 'profile':
        return <ProfilePage onNavigate={(v) => setView(v)} />;
      case 'pantry':
        return <PantryPage onBack={() => setView('profile')} />;
      case 'health-budget':
        return <HealthBudgetSettings onBack={() => setView('home')} />;
      case 'smart-planner':
        return <SmartPlanner onBack={() => setView('home')} />;
      case 'budget-dashboard':
        return <BudgetDashboard onBack={() => setView('home')} />;
      case 'settings-addresses':
        return <DeliveryAddresses onBack={() => setView('profile')} />;
      case 'settings-payments':
        return <PaymentMethods onBack={() => setView('profile')} />;
      case 'settings-notifications':
        return <NotificationsSettings onBack={() => setView('profile')} />;
      case 'settings-app':
        return <AppSettings onBack={() => setView('profile')} />;
      case 'settings-help':
        return <HelpSupport onBack={() => setView('profile')} />;
      default:
        return <HomeFeedPrototype onOpenAlerts={() => setView('alerts')} />;
    }
  };

  // Determine which nav item is active
  const getActiveNav = () => {
    if (view === 'profile' || view.startsWith('settings')) return 'profile';
    if (view === 'health-budget') return 'profile';
    if (view === 'smart-planner') return 'profile';
    if (view === 'budget-dashboard') return 'profile';
    if (view === 'pantry') return 'profile';
    if (view === 'history') return 'history';
    if (view === 'categories') return 'categories';
    return view;
  };
  const activeNav = getActiveNav();

  return (
    <>
      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 pb-20">
        {renderScreen()}
      </div>

      {/* Bottom Navigation Bar */}
      {!['address', 'payment'].includes(view) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 h-16 z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.06)]">
          <div className="max-w-3xl mx-auto flex justify-around items-center h-full">
            <NavItem
              icon={<Home size={20} />}
              label="Home"
              isActive={activeNav === 'home'}
              onClick={() => { setHomeCategory(null); setView('home'); }}
            />
            <NavItem
              icon={<LayoutGrid size={20} />}
              label="Categories"
              isActive={activeNav === 'categories'}
              onClick={() => setView('categories')}
            />
            <NavItem
              icon={
                <div className="relative">
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
              }
              label="Cart"
              isActive={activeNav === 'cart'}
              onClick={() => setView('cart')}
            />
            <NavItem
              icon={<ClipboardList size={20} />}
              label="Orders"
              isActive={activeNav === 'history'}
              onClick={() => setView('history')}
            />
            <NavItem
              icon={<User size={20} />}
              label="Profile"
              isActive={activeNav === 'profile'}
              onClick={() => setView('profile')}
            />
          </div>
        </nav>
      )}

      {/* Global AI Chatbot */}
      <ChatBot />
    </>
  );
}

// Sub-component for nav items
function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-3 h-full transition-all relative ${isActive ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
    >
      {/* Active indicator dot */}
      {isActive && (
        <div className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
      )}
      <div className={`mb-0.5 transition-all ${isActive ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] ${isActive ? 'font-black' : 'font-semibold'}`}>{label}</span>
    </button>
  );
}
