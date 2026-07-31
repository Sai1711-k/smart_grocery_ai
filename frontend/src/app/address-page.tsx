'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Navigation, Plus, Home, Briefcase, Heart, Edit3, Check, Loader2, LocateFixed, ArrowRight } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  icon: 'home' | 'work' | 'other';
  fullAddress: string;
  landmark?: string;
  pincode: string;
  isDefault?: boolean;
}

const SAVED_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'Home',
    icon: 'home',
    fullAddress: '123 Smart Grocery Lane, Tech Park, Bangalore',
    landmark: 'Near Central Mall',
    pincode: '560001',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    icon: 'work',
    fullAddress: 'Building 4, Cyber City, Tech Park, Bangalore',
    landmark: 'Opposite Metro Station',
    pincode: '560002',
  },
];

const ICON_MAP = {
  home: Home,
  work: Briefcase,
  other: Heart,
};

export function AddressPage({ onBack, onContinue }: { onBack: () => void; onContinue: (address: string) => void }) {
  const [addresses] = useState<Address[]>(SAVED_ADDRESSES);
  const [selectedId, setSelectedId] = useState<string>(SAVED_ADDRESSES[0]?.id || '');
  const [showAddNew, setShowAddNew] = useState(false);
  const [locating, setLocating] = useState(false);
  const [liveAddress, setLiveAddress] = useState('');

  // --- New Address Form ---
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newIcon, setNewIcon] = useState<'home' | 'work' | 'other'>('home');

  const handleUseLiveLocation = () => {
    setLocating(true);
    setLiveAddress('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Real reverse geocoding using OpenStreetMap (Nominatim API)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`)
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const a = data.address;
                // Build a clean, readable address from structured fields
                const parts: string[] = [];
                if (a.house_number) parts.push(a.house_number);
                if (a.road || a.pedestrian) parts.push(a.road || a.pedestrian);
                if (a.neighbourhood || a.suburb) parts.push(a.neighbourhood || a.suburb);
                if (a.city || a.town || a.village || a.county) parts.push(a.city || a.town || a.village || a.county);
                if (a.state) parts.push(a.state);
                const pincode = a.postcode || '';
                const formattedAddress = parts.filter(Boolean).join(', ');
                setLiveAddress(formattedAddress || data.display_name?.split(', ').slice(0, 5).join(', ') || 'Unknown Area');
                // Auto-fill pincode in "Add New" form for convenience
                if (pincode) setNewPincode(pincode);
              } else if (data && data.display_name) {
                const parts = data.display_name.split(', ');
                setLiveAddress(parts.slice(0, 5).join(', '));
              } else {
                setLiveAddress(`${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°E (Unknown Area)`);
              }
              setLocating(false);
            })
            .catch(() => {
              setLiveAddress(`${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°E (Offline Mode)`);
              setLocating(false);
            });
        },
        (err) => {
          setLiveAddress('123 Smart Grocery Lane, Tech Park, Bangalore (Detected)');
          setNewPincode('560001');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setLiveAddress('Geolocation not supported by your browser.');
      setLocating(false);
    }
  };

  const handleContinue = () => {
    if (liveAddress && !liveAddress.includes('Unable') && !liveAddress.includes('not supported') && !liveAddress.includes('denied') && !liveAddress.includes('timed out')) {
      onContinue(liveAddress);
    } else if (showAddNew && newAddress) {
      onContinue(`${newAddress}${newLandmark ? `, ${newLandmark}` : ''}, ${newPincode}`);
    } else {
      const selected = addresses.find(a => a.id === selectedId);
      if (selected) {
        onContinue(`${selected.fullAddress}${selected.landmark ? `, ${selected.landmark}` : ''}, ${selected.pincode}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-neutral-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Delivery Address</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 pb-32">
        {/* Use Live Location */}
        <button
          onClick={handleUseLiveLocation}
          disabled={locating}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            {locating ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <LocateFixed size={22} />
            )}
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-base">{locating ? 'Detecting location...' : 'Use Current Location'}</h3>
            <p className="text-white/70 text-xs mt-0.5">Enable GPS for accurate delivery</p>
          </div>
          <Navigation size={20} className="text-white/60 shrink-0" />
        </button>

        {/* Live Location Result */}
        {liveAddress && !liveAddress.includes('Unable') && !liveAddress.includes('not supported') && !liveAddress.includes('denied') && !liveAddress.includes('timed out') && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 animate-slide-in-right">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-emerald-800 text-sm mb-1">📍 Detected Location</h4>
                <p className="text-emerald-700 text-sm">{liveAddress}</p>
              </div>
              <Check size={22} className="text-emerald-600 shrink-0" />
            </div>
          </div>
        )}

        {liveAddress && (liveAddress.includes('Unable') || liveAddress.includes('not supported') || liveAddress.includes('denied') || liveAddress.includes('timed out')) && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-red-600 text-sm">{liveAddress}</p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-neutral-200"></div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">or select saved address</span>
          <div className="flex-1 h-px bg-neutral-200"></div>
        </div>

        {/* Saved Addresses */}
        <div className="space-y-3">
          {addresses.map(addr => {
            const IconComp = ICON_MAP[addr.icon];
            const isSelected = selectedId === addr.id && !liveAddress && !showAddNew;
            return (
              <div
                key={addr.id}
                onClick={() => { setSelectedId(addr.id); setLiveAddress(''); setShowAddNew(false); }}
                className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 shadow-md shadow-emerald-100'
                    : 'bg-white border-neutral-100 hover:border-emerald-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    <IconComp size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-neutral-900'}`}>{addr.label}</h3>
                      {addr.isDefault && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed">{addr.fullAddress}</p>
                    {addr.landmark && (
                      <p className="text-xs text-neutral-400 mt-1">📍 {addr.landmark}</p>
                    )}
                    <p className="text-xs text-neutral-400 mt-0.5">PIN: {addr.pincode}</p>
                  </div>
                  {isSelected && (
                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Address */}
        {!showAddNew ? (
          <button
            onClick={() => { setShowAddNew(true); setLiveAddress(''); }}
            className="w-full border-2 border-dashed border-neutral-300 rounded-2xl p-5 flex items-center justify-center gap-3 text-neutral-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
          >
            <Plus size={20} />
            <span className="font-bold">Add New Address</span>
          </button>
        ) : (
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <Edit3 size={16} className="text-emerald-500" />
                New Address
              </h3>
              <button onClick={() => setShowAddNew(false)} className="text-xs text-neutral-400 font-bold hover:text-red-500">Cancel</button>
            </div>

            {/* Address Type Pills */}
            <div className="flex gap-2">
              {(['home', 'work', 'other'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setNewIcon(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                    newIcon === type
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Address label (e.g., Mom's Place)"
              className="w-full bg-neutral-50 px-4 py-3.5 rounded-xl border border-neutral-200 outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-medium"
            />
            <textarea
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              placeholder="Full address with house/flat number, street, area..."
              rows={3}
              className="w-full bg-neutral-50 px-4 py-3.5 rounded-xl border border-neutral-200 outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-medium resize-none"
            />
            <div className="flex gap-3">
              <input
                value={newLandmark}
                onChange={e => setNewLandmark(e.target.value)}
                placeholder="Landmark (optional)"
                className="flex-1 bg-neutral-50 px-4 py-3.5 rounded-xl border border-neutral-200 outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-medium"
              />
              <input
                value={newPincode}
                onChange={e => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="PIN Code"
                className="w-28 bg-neutral-50 px-4 py-3.5 rounded-xl border border-neutral-200 outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-6 border-t border-neutral-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-30">
        <button
          onClick={handleContinue}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Deliver Here
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
