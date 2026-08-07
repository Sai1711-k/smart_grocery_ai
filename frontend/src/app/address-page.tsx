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

const DEFAULT_HOME_ADDRESS: Address = {
  id: '1',
  label: 'Home',
  icon: 'home',
  fullAddress: 'Chettipedu, Thandalam, Chennai',
  landmark: 'Near Rajalakshmi Engineering College',
  pincode: '602105',
  isDefault: true,
};

const ICON_MAP = {
  home: Home,
  work: Briefcase,
  other: Heart,
};

export function AddressPage({ onBack, onContinue }: { onBack: () => void; onContinue: (address: string) => void }) {
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grocery_saved_addresses');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return [DEFAULT_HOME_ADDRESS];
  });

  const [selectedId, setSelectedId] = useState<string>(addresses[0]?.id || '1');
  const [showAddNew, setShowAddNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAddressText, setEditAddressText] = useState('');
  const [editLandmarkText, setEditLandmarkText] = useState('');
  const [editPincodeText, setEditPincodeText] = useState('');

  const [locating, setLocating] = useState(false);
  const [liveAddress, setLiveAddress] = useState('');
  
  // --- New Address Form ---
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddress, setNewAddress] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newIcon, setNewIcon] = useState<'home' | 'work' | 'other'>('home');

  // Sync saved addresses to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('grocery_saved_addresses', JSON.stringify(addresses));
    }
  }, [addresses]);

  const executeLiveLocationFetch = () => {
    setLocating(true);
    setLiveAddress('');
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Save real user GPS coordinates for Order Tracking Map
          localStorage.setItem('grocery_user_coords', JSON.stringify({ lat: latitude, lng: longitude }));

          // Multi-provider Reverse Geocoding (Nominatim OpenStreetMap)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`)
            .then(res => res.json())
            .then(data => {
              const displayName = (data?.display_name || '').toLowerCase();
              
              // Exact Locality Override for Chettipedu / Thandalam / NH48 corridor
              const isThandalamZone = 
                (latitude >= 12.96 && latitude <= 13.06 && longitude >= 79.95 && longitude <= 80.08) ||
                displayName.includes('chembarambakkam') ||
                displayName.includes('thandalam') ||
                displayName.includes('chettipedu') ||
                displayName.includes('600124') ||
                displayName.includes('602105');

              if (isThandalamZone) {
                const exactAddressStr = 'Chettipedu, Thandalam, Chennai, PIN: 602105';
                setLiveAddress(exactAddressStr);
                localStorage.setItem('grocery_active_address', exactAddressStr);
                setNewPincode('602105');
              } else if (data && data.address) {
                const a = data.address;
                const parts: string[] = [];
                if (a.suburb || a.village || a.neighbourhood) parts.push(a.suburb || a.village || a.neighbourhood);
                if (a.road || a.pedestrian || a.locality) parts.push(a.road || a.pedestrian || a.locality);
                if (a.town || a.city || a.county || a.district) parts.push(a.town || a.city || a.county || a.district);
                if (a.state) parts.push(a.state);
                
                const pincode = a.postcode || '602105';
                const formattedAddress = parts.filter(Boolean).join(', ');
                const finalAddr = formattedAddress || data.display_name?.split(', ').slice(0, 4).join(', ') || 'Chettipedu, Thandalam, Chennai';
                const fullLocStr = `${finalAddr}, PIN: ${pincode}`;
                
                setLiveAddress(fullLocStr);
                localStorage.setItem('grocery_active_address', fullLocStr);
                if (pincode) setNewPincode(pincode);
              } else {
                const fallbackStr = 'Chettipedu, Thandalam, Chennai, PIN: 602105';
                setLiveAddress(fallbackStr);
                localStorage.setItem('grocery_active_address', fallbackStr);
              }
              setLocating(false);
            })
            .catch(() => {
              const fallbackStr = 'Chettipedu, Thandalam, Chennai, PIN: 602105';
              setLiveAddress(fallbackStr);
              localStorage.setItem('grocery_active_address', fallbackStr);
              setLocating(false);
            });
        },
        (err) => {
          console.log('GPS Geolocation prompt or permission denied:', err.message);
          const defaultLoc = 'Chettipedu, Thandalam, Chennai, PIN: 602105';
          setLiveAddress(defaultLoc);
          localStorage.setItem('grocery_active_address', defaultLoc);
          localStorage.setItem('grocery_user_coords', JSON.stringify({ lat: 13.0035, lng: 80.0033 }));
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      const defaultLoc = 'Chettipedu, Thandalam, Chennai, PIN: 602105';
      setLiveAddress(defaultLoc);
      localStorage.setItem('grocery_active_address', defaultLoc);
      localStorage.setItem('grocery_user_coords', JSON.stringify({ lat: 13.0035, lng: 80.0033 }));
      setLocating(false);
    }
  };

  const handleStartEdit = (addr: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(addr.id);
    setEditAddressText(addr.fullAddress);
    setEditLandmarkText(addr.landmark || '');
    setEditPincodeText(addr.pincode);
  };

  const handleSaveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddresses(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          fullAddress: editAddressText,
          landmark: editLandmarkText || undefined,
          pincode: editPincodeText || '602105'
        };
      }
      return a;
    }));
    setEditingId(null);
  };

  const handleUseLiveLocation = () => {
    executeLiveLocationFetch();
  };

  const handleSaveNewAddress = () => {
    if (!newAddress.trim()) return;
    const newAddrObj: Address = {
      id: Date.now().toString(),
      label: newLabel || 'Home',
      icon: newIcon,
      fullAddress: newAddress,
      landmark: newLandmark || undefined,
      pincode: newPincode || '602105',
      isDefault: addresses.length === 0,
    };
    setAddresses(prev => [...prev, newAddrObj]);
    setSelectedId(newAddrObj.id);
    setShowAddNew(false);
    setNewAddress('');
    setNewLandmark('');
    setNewPincode('');
  };

  const handleContinue = () => {
    let chosenAddress = '';
    if (liveAddress) {
      chosenAddress = liveAddress;
    } else if (showAddNew && newAddress) {
      chosenAddress = `${newAddress}${newLandmark ? `, ${newLandmark}` : ''}, PIN: ${newPincode || '602105'}`;
    } else {
      const selected = addresses.find(a => a.id === selectedId);
      if (selected) {
        chosenAddress = `${selected.fullAddress}${selected.landmark ? `, ${selected.landmark}` : ''}, PIN: ${selected.pincode}`;
      } else if (addresses[0]) {
        chosenAddress = `${addresses[0].fullAddress}, PIN: ${addresses[0].pincode}`;
      } else {
        chosenAddress = 'Chettipedu, Thandalam, Chennai, PIN: 602105';
      }
    }
    localStorage.setItem('grocery_active_address', chosenAddress);
    onContinue(chosenAddress);
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
            const isEditingThis = editingId === addr.id;

            return (
              <div
                key={addr.id}
                onClick={() => {
                  if (!isEditingThis) {
                    setSelectedId(addr.id);
                    setLiveAddress('');
                    setShowAddNew(false);
                  }
                }}
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${isSelected ? 'text-emerald-800' : 'text-neutral-900'}`}>{addr.label}</h3>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">DEFAULT</span>
                        )}
                      </div>

                      {/* Edit Address Button */}
                      {!isEditingThis ? (
                        <button
                          onClick={(e) => handleStartEdit(addr, e)}
                          className="text-emerald-600 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          className="text-neutral-400 hover:text-red-500 text-xs font-bold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {!isEditingThis ? (
                      <>
                        <p className="text-sm text-neutral-600 leading-relaxed">{addr.fullAddress}</p>
                        {addr.landmark && (
                          <p className="text-xs text-neutral-400 mt-1">📍 {addr.landmark}</p>
                        )}
                        <p className="text-xs text-neutral-400 mt-0.5">PIN: {addr.pincode}</p>
                      </>
                    ) : (
                      <div className="space-y-3 pt-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editAddressText}
                          onChange={(e) => setEditAddressText(e.target.value)}
                          placeholder="Full Street Address"
                          className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editLandmarkText}
                            onChange={(e) => setEditLandmarkText(e.target.value)}
                            placeholder="Landmark"
                            className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <input
                            type="text"
                            value={editPincodeText}
                            onChange={(e) => setEditPincodeText(e.target.value)}
                            placeholder="Pincode"
                            className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <button
                          onClick={(e) => handleSaveEdit(addr.id, e)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <Check size={14} />
                          <span>Save Address Changes</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isSelected && !isEditingThis && (
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
                placeholder="Pincode (e.g. 602105)"
                value={newPincode}
                onChange={e => setNewPincode(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              onClick={handleSaveNewAddress}
              disabled={!newAddress.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                newAddress.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Check size={18} />
              <span>Save &amp; Use Address</span>
            </button>
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

    </div>
  );
}
