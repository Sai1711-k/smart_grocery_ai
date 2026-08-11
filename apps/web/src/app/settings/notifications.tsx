'use client';

import { useState } from 'react';
import { ChevronLeft, Bell, BellOff, Package, Tag, AlertTriangle, TrendingUp, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/providers';

interface NotifSetting {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
}

export function NotificationsSettings({ onBack }: { onBack: () => void }) {
  const { t } = useAuth();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: 'orders', icon: <Package size={20} />, label: 'Order Updates', description: 'Real-time order status & live map tracking', enabled: true },
    { id: 'deals', icon: <Tag size={20} />, label: 'Deals & Offers', description: 'Exclusive discounts and flash sales', enabled: true },
    { id: 'stock', icon: <AlertTriangle size={20} />, label: 'Stock Alerts', description: 'When favorite items are back in stock', enabled: true },
    { id: 'price', icon: <TrendingUp size={20} />, label: 'Price Drops', description: 'Instant price drop alerts on saved items', enabled: true },
  ]);

  const liveFeed = [
    { id: 'n1', title: '🚚 Order Delivered', time: '10m ago', text: 'Your grocery bundle was delivered to your address.' },
    { id: 'n2', title: '⚡ Flash Sale 40% Off', time: '1h ago', text: 'Organic avocados and fresh berries are on discount!' },
    { id: 'n3', title: '🥑 Back in Stock', time: '3h ago', text: 'Haas Avocados (Pack of 3) are now available in inventory.' },
  ];

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const requestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(res => {
        if (res === 'granted') {
          setPermissionGranted(true);
        } else {
          alert('Notification permission was denied. You can enable it in your browser settings.');
        }
      });
    } else {
      setPermissionGranted(true);
    }
  };

  const allEnabled = settings.every(s => s.enabled);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20 transition-colors">
      <div className="bg-white dark:bg-neutral-900 px-6 py-5 flex items-center gap-4 sticky top-0 z-10 border-b dark:border-neutral-800 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900 dark:text-white">{t('notifications')}</h1>
      </div>

      <div className="px-6 py-6 space-y-5 max-w-lg mx-auto w-full">
        
        {/* Permission Request Prompt Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={24} />
              <h2 className="font-extrabold text-base">Enable Live App Permissions</h2>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              Allow location and notification access to get instant 10-minute order status tracking, driver arrival alerts, and daily offers!
            </p>
            <button
              onClick={requestPermission}
              className="mt-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              {permissionGranted ? <CheckCircle2 size={16} /> : <MapPin size={16} />}
              {permissionGranted ? 'Permissions Granted' : 'Allow Notifications & Location'}
            </button>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${allEnabled ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
              {allEnabled ? <Bell size={22} /> : <BellOff size={22} />}
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">All Notifications</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{allEnabled ? 'All alerts enabled' : 'Some alerts muted'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const newState = !allEnabled;
              setSettings(prev => prev.map(s => ({ ...s, enabled: newState })));
            }}
            className={`w-12 h-7 rounded-full transition-all relative ${allEnabled ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${allEnabled ? 'left-6' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Individual Settings */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
          {settings.map((setting, idx) => (
            <div key={setting.id} className={`p-5 flex items-center justify-between ${idx < settings.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${setting.enabled ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                  {setting.icon}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white text-sm">{setting.label}</h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{setting.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className={`w-11 h-6 rounded-full transition-all relative ${setting.enabled ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${setting.enabled ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>

        {/* Recent Notifications Feed */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-3">
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Recent Alerts</h3>
          <div className="space-y-3">
            {liveFeed.map(item => (
              <div key={item.id} className="p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{item.title}</h4>
                  <span className="text-[10px] text-neutral-400">{item.time}</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
