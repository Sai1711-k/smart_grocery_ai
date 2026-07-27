'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Users, UserPlus, BrainCircuit, AlertTriangle, Clock, ShoppingCart, Leaf, Flame, ShieldAlert, BadgeInfo } from 'lucide-react';

interface PantryPageProps {
  onBack: () => void;
}

interface PantryItem {
  id: string;
  name: string;
  totalQty: number; // e.g. 5 for 5kg
  unit: string;
  baseConsumptionPerPersonPerDay: number; // e.g. 0.2 kg per person
  daysSincePurchase: number;
  icon: string;
}

export function PantryPage({ onBack }: PantryPageProps) {
  // Household Setup
  const [familySize, setFamilySize] = useState<number>(3);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [diet, setDiet] = useState<string>('balanced');
  
  // Animation state for AI calculation
  const [isCalculating, setIsCalculating] = useState(false);

  // Trigger recalculation animation when household size changes
  useEffect(() => {
    setIsCalculating(true);
    const t = setTimeout(() => setIsCalculating(false), 600);
    return () => clearTimeout(t);
  }, [familySize, guestCount, diet]);

  // Mock Pantry Data (Things the user previously bought)
  const [pantryItems] = useState<PantryItem[]>([
    { id: '1', name: 'Premium Sona Masuri Rice', totalQty: 10, unit: 'kg', baseConsumptionPerPersonPerDay: 0.2, daysSincePurchase: 12, icon: '🍚' },
    { id: '2', name: 'Fresh Full Cream Milk', totalQty: 3, unit: 'L', baseConsumptionPerPersonPerDay: 0.3, daysSincePurchase: 2, icon: '🥛' },
    { id: '3', name: 'Farm Eggs', totalQty: 30, unit: 'pcs', baseConsumptionPerPersonPerDay: 1, daysSincePurchase: 5, icon: '🥚' },
    { id: '4', name: 'Whole Wheat Atta', totalQty: 5, unit: 'kg', baseConsumptionPerPersonPerDay: 0.15, daysSincePurchase: 10, icon: '🌾' },
    { id: '5', name: 'Toor Dal', totalQty: 2, unit: 'kg', baseConsumptionPerPersonPerDay: 0.05, daysSincePurchase: 8, icon: '🥣' },
  ]);

  const diets = [
    { id: 'balanced', label: 'Balanced', icon: <Flame size={16} /> },
    { id: 'keto', label: 'Keto / Low Carb', icon: <Leaf size={16} /> },
    { id: 'vegan', label: 'Vegan', icon: <Leaf size={16} /> },
  ];

  const totalPeople = familySize + guestCount;

  // AI Prediction Engine Math
  const predictions = useMemo(() => {
    return pantryItems.map(item => {
      // Adjust consumption based on diet
      let consumptionMultiplier = 1;
      if (diet === 'keto' && (item.name.includes('Rice') || item.name.includes('Atta'))) {
        consumptionMultiplier = 0.2; // Eat much less carbs
      }
      if (diet === 'vegan' && (item.name.includes('Milk') || item.name.includes('Eggs'))) {
        consumptionMultiplier = 0; // Don't eat at all
      }

      const dailyConsumption = item.baseConsumptionPerPersonPerDay * totalPeople * consumptionMultiplier;
      
      // Special case for vegan items
      if (dailyConsumption === 0) {
        return { ...item, daysLeft: 999, remainingQty: item.totalQty, status: 'ignored', dailyConsumption: 0 };
      }

      const amountConsumedSoFar = item.baseConsumptionPerPersonPerDay * familySize * item.daysSincePurchase; // Guests didn't eat past food
      const remainingQty = Math.max(0, item.totalQty - amountConsumedSoFar);
      
      const daysLeft = remainingQty / dailyConsumption;

      let status = 'good';
      if (daysLeft <= 0) status = 'empty';
      else if (daysLeft <= 2) status = 'critical';
      else if (daysLeft <= 5) status = 'warning';

      return { ...item, daysLeft, remainingQty, status, dailyConsumption };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [pantryItems, familySize, guestCount, diet]);

  const criticalItems = predictions.filter(p => p.status === 'critical' || p.status === 'empty');

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-primary px-6 pt-12 pb-24 rounded-b-[40px] shadow-sm relative z-10 text-white">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <BrainCircuit className="text-amber-300" />
              Smart Pantry AI
            </h1>
            <p className="text-primary-100 text-sm">Predicts when you run out of groceries</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 -mt-16 relative z-20">
        
        {/* Household Setup Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={16} /> Household Profile
          </h2>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-neutral-800">Family Size</label>
                <span className="text-xl font-black text-primary">{familySize}</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={familySize} onChange={e => setFamilySize(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-neutral-800 flex items-center gap-2">
                  <UserPlus size={16} className="text-amber-500"/> Guests Arriving?
                </label>
                <span className="text-xl font-black text-amber-500">+{guestCount}</span>
              </div>
              <input 
                type="range" min="0" max="10" 
                value={guestCount} onChange={e => setGuestCount(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              {guestCount > 0 && (
                <p className="text-xs text-amber-600 font-semibold mt-1 animate-pulse">
                  AI: Groceries will deplete {Math.round(((familySize + guestCount) / familySize - 1) * 100)}% faster!
                </p>
              )}
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-2">Dietary Preference</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {diets.map(d => (
                  <button 
                    key={d.id}
                    onClick={() => setDiet(d.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors shrink-0 ${
                      diet === d.id ? 'bg-primary text-white border-primary shadow-md' : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}
                  >
                    {d.icon} {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Critical Alerts */}
        {criticalItems.length > 0 && !isCalculating && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5 shadow-sm animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-black text-red-900">Action Required</h3>
                <p className="text-xs text-red-700 font-semibold">Stock running out very soon!</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {criticalItems.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-red-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-neutral-900 text-sm leading-tight">{item.name}</p>
                      <p className="text-xs text-red-600 font-bold mt-0.5">
                        {item.status === 'empty' ? 'Finished today' : `Runs out in ${Math.ceil(item.daysLeft)} days`}
                      </p>
                    </div>
                  </div>
                  <button className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition">
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Forecast List */}
        <div>
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={16} /> Live Depletion Forecast
          </h2>
          
          <div className={`space-y-3 transition-opacity duration-300 ${isCalculating ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
            {predictions.map(item => {
              if (item.status === 'ignored') return null;
              
              const percentLeft = Math.min(100, Math.max(0, (item.remainingQty / item.totalQty) * 100));
              let color = 'bg-emerald-500';
              let bg = 'bg-emerald-50';
              if (item.status === 'warning') { color = 'bg-amber-500'; bg = 'bg-amber-50'; }
              if (item.status === 'critical' || item.status === 'empty') { color = 'bg-red-500'; bg = 'bg-red-50'; }

              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center text-3xl shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-neutral-900 text-sm leading-tight">{item.name}</h3>
                      <span className={`text-xs font-black ${item.status === 'empty' ? 'text-red-500' : 'text-neutral-500'}`}>
                        {item.status === 'empty' ? '0 days' : `${Math.ceil(item.daysLeft)}d`}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-neutral-400 font-semibold mb-2">
                      Consuming {item.dailyConsumption.toFixed(1)}{item.unit} / day
                    </p>

                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentLeft}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {predictions.every(p => p.status === 'ignored') && (
              <div className="text-center py-10">
                <Leaf size={48} className="mx-auto text-emerald-200 mb-4" />
                <p className="text-neutral-500 font-medium">Your current diet excludes these items.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
