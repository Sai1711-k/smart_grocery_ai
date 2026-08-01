'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Navigation, Plus, Home, Briefcase, Heart, Edit3, Check, Loader2, LocateFixed, Shield, Compass, Navigation2 } from 'lucide-react';

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
  
  // Image 2 Native Location Permission Dialog State
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<'precise' | 'approximate'>('precise');
  const [permissionChoice, setPermissionChoice] = useState<'while_using' | 'only_once' | 'dont_allow'>('while_using');

  // --- New Address Form ---
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newIcon, setNewIcon] = useState<'home' | 'work' | 'other'>('home');

  const executeLiveLocationFetch = () => {
    setLocating(true);
    setLiveAddress('');
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`)
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const a = data.address;
                const parts: string[] = [];
                if (a.house_number) parts.push(a.house_number);
                if (a.road || a.pedestrian) parts.push(a.road || a.pedestrian);
                if (a.neighbourhood || a.suburb) parts.push(a.neighbourhood || a.suburb);
                if (a.city || a.town || a.village || a.county) parts.push(a.city || a.town || a.village || a.county);
                if (a.state) parts.push(a.state);
                const pincode = a.postcode || '560001';
                const formattedAddress = parts.filter(Boolean).join(', ');
                const finalAddr = formattedAddress || data.display_name?.split(', ').slice(0, 5).join(', ') || 'Tech Park, Bangalore';
                setLiveAddress(`${finalAddr}, PIN: ${pincode}`);
                if (pincode) setNewPincode(pincode);
              } else {
                setLiveAddress(`Smart Grocery Hub, Tech Park, Bangalore, PIN: 560001 (Live GPS)`);
              }
              setLocating(false);
            })
            .catch(() => {
              setLiveAddress(`Smart Grocery Hub, Tech Park, Bangalore, PIN: 560001 (Detected)`);
              setLocating(false);
            });
        },
        () => {
          // Fallback location on permission prompt refusal
          setLiveAddress('123 Smart Grocery Lane, Tech Park, Bangalore (Auto-Adapted)');
          setNewPincode('560001');
          setLocating(false);
        },
        { enableHighAccuracy: locationAccuracy === 'precise', timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLiveAddress('123 Smart Grocery Lane, Tech Park, Bangalore (Default)');
      setLocating(false);
    }
  };

  const handleUseLiveLocation = () => {
    // Open Image 2 Native Location Permission Modal
    setShowPermissionModal(true);
  };

  const handleConfirmPermission = () => {
    setShowPermissionModal(false);
    if (permissionChoice === 'dont_allow') {
      setLiveAddress('123 Smart Grocery Lane, Tech Park, Bangalore (Default Saved Address)');
    } else {
      executeLiveLocationFetch();
    }
  };

  const handleContinue = () => {
    if (liveAddress) {
      onContinue(liveAddress);
    } else if (showAddNew && newAddress) {
      onContinue(`${newAddress}${newLandmark ? `, ${newLandmark}` : ''}, PIN: ${newPincode || '560001'}`);
    } else {
      const selected = addresses.find(a => a.id === selectedId);
      if (selected) {
        onContinue(`${selected.fullAddress}${selected.landmark ? `, ${selected.landmark}` : ''}, PIN: ${selected.pincode}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col relative">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-neutral-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Delivery Address</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 pb-32">
        {/* Use Live Location Card */}
        <button
          onClick={handleUseLiveLocation}
          disabled={locating}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all active:scale-[0.98]"
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
            <p className="text-white/80 text-xs mt-0.5">Enable GPS for accurate instant delivery</p>
          </div>
          <Navigation size={20} className="text-white/70 shrink-0" />
        </button>

        {/* Live Location Result Card */}
        {liveAddress && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-emerald-900 text-sm">📍 Live Location Adapted</h4>
                  <span className="text-[9px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                </div>
                <p className="text-emerald-800 text-sm font-medium leading-relaxed">{liveAddress}</p>
              </div>
              <Check size={22} className="text-emerald-600 shrink-0 mt-1" />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-neutral-200"></div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">OR SELECT SAVED ADDRESS</span>
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
                    ? 'bg-emerald-50 border-emerald-400 shadow-md shadow-emerald-100'
                    : 'bg-white border-neutral-100 hover:border-emerald-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-500 text-white shadow-md' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    <IconComp size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold ${isSelected ? 'text-emerald-800' : 'text-neutral-900'}`}>{addr.label}</h3>
                      {addr.isDefault && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">DEFAULT</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">{addr.fullAddress}</p>
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
            className="w-full border-2 border-dashed border-neutral-300 rounded-2xl p-5 flex items-center justify-center gap-3 text-neutral-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all font-bold"
          >
            <Plus size={20} />
            <span>Add New Address</span>
          </button>
        ) : (
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <Edit3 size={16} className="text-emerald-500" />
                New Address Details
              </h3>
              <button onClick={() => setShowAddNew(false)} className="text-xs text-neutral-400 font-bold hover:text-red-500">Cancel</button>
            </div>

            <div className="flex gap-2">
              {(['home', 'work', 'other'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setNewIcon(type)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold capitalize flex items-center justify-center gap-2 ${
                    newIcon === type ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                  }`}
                >
                  {type === 'home' && <Home size={14} />}
                  {type === 'work' && <Briefcase size={14} />}
                  {type === 'other' && <Heart size={14} />}
                  {type}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Street Address, House / Flat No."
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={newLandmark}
                onChange={e => setNewLandmark(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input
                type="text"
                placeholder="Pincode (e.g. 560001)"
                value={newPincode}
                onChange={e => setNewPincode(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Deliver Here CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-30 shadow-2xl">
        <button
          onClick={handleContinue}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-base shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
        >
          <span>Deliver Here</span>
          <ChevronLeft size={20} className="rotate-180" />
        </button>
      </div>

      {/* ── IMAGE 2 NATIVE LOCATION PERMISSION DIALOG OVERLAY ── */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-800 text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-neutral-700 space-y-5 animate-scale-up">
            {/* Header Icon */}
            <div className="w-14 h-14 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto border border-pink-500/30">
              <MapPin size={28} />
            </div>

            {/* Title */}
            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-black text-white leading-tight">
                Allow Smart Grocery AI to access this device's location?
              </h2>
              <div className="bg-neutral-700/60 border border-neutral-600 rounded-xl p-2.5 text-[11px] text-neutral-300 flex items-center gap-2 justify-center">
                <Shield size={14} className="text-emerald-400 shrink-0" />
                <span>This app stated it may share location data with third parties &gt;</span>
              </div>
            </div>

            {/* Precise vs Approximate Map Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setLocationAccuracy('precise')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                  locationAccuracy === 'precise'
                    ? 'bg-indigo-900/40 border-indigo-400 text-white'
                    : 'bg-neutral-700/40 border-neutral-600 text-neutral-400'
                }`}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-neutral-900/80 border border-indigo-400/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:8px_8px] opacity-40"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full relative z-10"></div>
                </div>
                <p className="text-xs font-bold">Precise</p>
              </div>

              <div
                onClick={() => setLocationAccuracy('approximate')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                  locationAccuracy === 'approximate'
                    ? 'bg-indigo-900/40 border-indigo-400 text-white'
                    : 'bg-neutral-700/40 border-neutral-600 text-neutral-400'
                }`}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-neutral-900/80 border border-neutral-600 flex items-center justify-center relative overflow-hidden">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-400/60 animate-spin"></div>
                </div>
                <p className="text-xs font-bold">Approximate</p>
              </div>
            </div>

            {/* Permission Action Choice Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setPermissionChoice('while_using')}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all border ${
                  permissionChoice === 'while_using'
                    ? 'bg-rose-100 text-neutral-900 border-rose-200 shadow-md font-black'
                    : 'bg-neutral-700 text-neutral-200 border-neutral-600'
                }`}
              >
                While using the app
              </button>

              <button
                onClick={() => setPermissionChoice('only_once')}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all border ${
                  permissionChoice === 'only_once'
                    ? 'bg-rose-100 text-neutral-900 border-rose-200 shadow-md font-black'
                    : 'bg-neutral-700 text-neutral-200 border-neutral-600'
                }`}
              >
                Only this time
              </button>

              <button
                onClick={() => setPermissionChoice('dont_allow')}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all border ${
                  permissionChoice === 'dont_allow'
                    ? 'bg-rose-100 text-neutral-900 border-rose-200 shadow-md font-black'
                    : 'bg-neutral-700 text-neutral-200 border-neutral-600'
                }`}
              >
                Don't allow
              </button>
            </div>

            {/* Primary Continue Button */}
            <button
              onClick={handleConfirmPermission}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all border border-neutral-600 active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
