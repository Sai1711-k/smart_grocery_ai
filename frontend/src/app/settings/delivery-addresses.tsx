'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, MapPin, Trash2, Check, Home, Briefcase, Navigation, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/providers';

interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  address: string;
  isDefault: boolean;
}

export function DeliveryAddresses({ onBack }: { onBack: () => void }) {
  const { t } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'Home', type: 'home', address: '123, Green Valley Apartments, MG Road, Bangalore - 560001', isDefault: true },
    { id: '2', label: 'Work', type: 'work', address: 'Tech Park, 4th Floor, Whitefield, Bangalore - 560066', isDefault: false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState<'home' | 'work' | 'other'>('home');
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grocery_saved_addresses');
      if (stored) {
        try { setAddresses(JSON.parse(stored)); } catch (e) {}
      }
    }
  }, []);

  const saveAddressesToStorage = (newAddrs: Address[]) => {
    setAddresses(newAddrs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('grocery_saved_addresses', JSON.stringify(newAddrs));
    }
  };

  const setDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    saveAddressesToStorage(updated);
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    saveAddressesToStorage(updated);
  };

  const addAddress = () => {
    if (!newLabel.trim() || !newAddress.trim()) return;
    const newObj: Address = {
      id: Date.now().toString(),
      label: newLabel,
      type: newType,
      address: newAddress,
      isDefault: addresses.length === 0,
    };
    const updated = [...addresses, newObj];
    saveAddressesToStorage(updated);
    setNewLabel('');
    setNewAddress('');
    setShowAdd(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`);
          const data = await res.json();
          const addr = data.address || {};
          const fullAddr = [
            addr.building || addr.house_number,
            addr.road || addr.street,
            addr.suburb || addr.neighbourhood,
            addr.city || addr.town || addr.village,
            addr.state,
            addr.postcode
          ].filter(Boolean).join(', ');
          
          setNewAddress(fullAddr || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          if (!newLabel) setNewLabel('Current Location');
        } catch (err) {
          alert('Could not resolve address details. Please type address manually.');
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        alert('Location access denied or timed out.');
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20 transition-colors">
      <div className="bg-white dark:bg-neutral-900 px-6 py-5 flex items-center gap-4 sticky top-0 z-10 border-b dark:border-neutral-800 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900 dark:text-white">{t('delivery_address')}</h1>
      </div>

      <div className="px-6 py-6 space-y-4 max-w-lg mx-auto w-full">
        {addresses.map(addr => (
          <div key={addr.id} className={`bg-white dark:bg-neutral-900 p-5 rounded-3xl border-2 transition-all ${addr.isDefault ? 'border-emerald-600 shadow-md shadow-emerald-600/10' : 'border-neutral-100 dark:border-neutral-800'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${addr.isDefault ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                  {addr.type === 'home' ? <Home size={18} /> : addr.type === 'work' ? <Briefcase size={18} /> : <MapPin size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">{addr.label}</h3>
                  {addr.isDefault && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full uppercase">Default</span>}
                </div>
              </div>
              <button onClick={() => deleteAddress(addr.id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">{addr.address}</p>
            {!addr.isDefault && (
              <button onClick={() => setDefault(addr.id)} className="text-xs font-bold text-emerald-600 hover:underline transition-colors flex items-center gap-1">
                <Check size={14} /> Set as Default
              </button>
            )}
          </div>
        ))}

        {showAdd ? (
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border-2 border-dashed border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white">Add New Address</h3>
              <button 
                onClick={handleDetectLocation} 
                disabled={isDetecting}
                className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-100 transition-all"
              >
                {isDetecting ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                {isDetecting ? 'Detecting...' : 'Use Current Location'}
              </button>
            </div>

            <div className="flex gap-2">
              {(['home', 'work', 'other'] as const).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${newType === t ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}
                >{t}</button>
              ))}
            </div>

            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label (e.g. Mom's Apartment)"
              className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500" />
            <textarea value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Full street address, area, pincode..."
              className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 h-24 resize-none" />
            
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold text-sm">Cancel</button>
              <button onClick={addAddress} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20">Save Address</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 font-bold flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
            <Plus size={18} /> Add New Address
          </button>
        )}
      </div>
    </div>
  );
}
