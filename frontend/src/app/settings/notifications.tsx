'use client';

import { useState } from 'react';
import { ChevronLeft, Bell, BellOff, Package, Tag, AlertTriangle, TrendingUp } from 'lucide-react';

interface NotifSetting {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
}

export function NotificationsSettings({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: 'orders', icon: <Package size={20} />, label: 'Order Updates', description: 'Get notified about order status changes', enabled: true },
    { id: 'deals', icon: <Tag size={20} />, label: 'Deals & Offers', description: 'Special discounts and promotions', enabled: true },
    { id: 'stock', icon: <AlertTriangle size={20} />, label: 'Stock Alerts', description: 'When items are back in stock', enabled: true },
    { id: 'price', icon: <TrendingUp size={20} />, label: 'Price Drops', description: 'Price changes on your favorites', enabled: false },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const allEnabled = settings.every(s => s.enabled);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white px-6 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Notifications</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Master Toggle */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${allEnabled ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-400'}`}>
              {allEnabled ? <Bell size={22} /> : <BellOff size={22} />}
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">All Notifications</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{allEnabled ? 'All enabled' : 'Some disabled'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const newState = !allEnabled;
              setSettings(prev => prev.map(s => ({ ...s, enabled: newState })));
            }}
            className={`w-12 h-7 rounded-full transition-all relative ${allEnabled ? 'bg-primary' : 'bg-neutral-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${allEnabled ? 'left-6' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Individual Settings */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          {settings.map((setting, idx) => (
            <div key={setting.id} className={`p-5 flex items-center justify-between ${idx < settings.length - 1 ? 'border-b border-neutral-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${setting.enabled ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-400'}`}>
                  {setting.icon}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">{setting.label}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{setting.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className={`w-11 h-6 rounded-full transition-all relative ${setting.enabled ? 'bg-primary' : 'bg-neutral-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${setting.enabled ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
