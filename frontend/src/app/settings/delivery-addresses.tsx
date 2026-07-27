'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, MapPin, Trash2, Check, Home, Briefcase } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  address: string;
  isDefault: boolean;
}

export function DeliveryAddresses({ onBack }: { onBack: () => void }) {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'Home', type: 'home', address: '123, Green Valley Apartments, MG Road, Bangalore - 560001', isDefault: true },
    { id: '2', label: 'Work', type: 'work', address: 'Tech Park, 4th Floor, Whitefield, Bangalore - 560066', isDefault: false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState<'home' | 'work' | 'other'>('home');

  const setDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const addAddress = () => {
    if (!newLabel.trim() || !newAddress.trim()) return;
    setAddresses(prev => [...prev, {
      id: Date.now().toString(),
      label: newLabel,
      type: newType,
      address: newAddress,
      isDefault: false,
    }]);
    setNewLabel('');
    setNewAddress('');
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white px-6 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Delivery Addresses</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        {addresses.map(addr => (
          <div key={addr.id} className={`bg-white p-5 rounded-3xl border-2 transition-all ${addr.isDefault ? 'border-primary shadow-md shadow-primary/10' : 'border-neutral-100'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${addr.isDefault ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-500'}`}>
                  {addr.type === 'home' ? <Home size={18} /> : addr.type === 'work' ? <Briefcase size={18} /> : <MapPin size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{addr.label}</h3>
                  {addr.isDefault && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Default</span>}
                </div>
              </div>
              <button onClick={() => deleteAddress(addr.id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{addr.address}</p>
            {!addr.isDefault && (
              <button onClick={() => setDefault(addr.id)} className="text-xs font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
                <Check size={14} /> Set as Default
              </button>
            )}
          </div>
        ))}

        {showAdd ? (
          <div className="bg-white p-5 rounded-3xl border-2 border-dashed border-primary/30 space-y-4">
            <h3 className="font-bold text-neutral-900">Add New Address</h3>
            <div className="flex gap-2">
              {(['home', 'work', 'other'] as const).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all capitalize ${newType === t ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600'}`}
                >{t}</button>
              ))}
            </div>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label (e.g. Mom's House)"
              className="w-full p-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            <textarea value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Full address..."
              className="w-full p-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary h-24 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-neutral-100 text-neutral-600 font-bold text-sm">Cancel</button>
              <button onClick={addAddress} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20">Save</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 font-bold flex items-center justify-center gap-2 hover:border-primary/30 hover:text-primary transition-colors">
            <Plus size={18} /> Add New Address
          </button>
        )}
      </div>
    </div>
  );
}
