'use client';

import { useState, useEffect } from 'react';
import { useAuth, UserPreferences } from '@/lib/providers';
import { ArrowLeft, Check, Users, IndianRupee, HeartPulse, Sparkles, Save } from 'lucide-react';

const DIETS = [
  { id: 'balanced', label: 'Balanced', icon: '🥗', desc: 'No restrictions' },
  { id: 'keto', label: 'Keto', icon: '🥑', desc: 'Low carb, high fat' },
  { id: 'vegan', label: 'Vegan', icon: '🌱', desc: 'No animal products' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾', desc: 'No wheat/gluten' },
  { id: 'high-protein', label: 'High Protein', icon: '🥚', desc: 'Muscle building' },
];

export function HealthBudgetSettings({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (view: string) => void }) {
  const { preferences, updatePreferences, t } = useAuth();
  
  const [dietary, setDietary] = useState<string[]>([]);
  const [familySize, setFamilySize] = useState<number>(1);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(15000);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (preferences) {
      setDietary(preferences.dietary || ['balanced']);
      setFamilySize(preferences.familySize || 1);
      setMonthlyBudget(preferences.monthlyBudget || 15000);
    }
  }, [preferences]);

  const toggleDiet = (id: string) => {
    setDietary(prev => {
      if (id === 'balanced') return ['balanced'];
      const filtered = prev.filter(d => d !== 'balanced');
      if (filtered.includes(id)) return filtered.filter(d => d !== id);
      return [...filtered, id];
    });
  };

  const handleSave = () => {
    updatePreferences({
      ...preferences,
      dietary: dietary.length > 0 ? dietary : ['balanced'],
      familySize: familySize || 1,
      monthlyBudget: monthlyBudget || 1000,
      selectedStore: preferences?.selectedStore || 'Whole Foods'
    } as UserPreferences);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onBack();
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 px-4 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-neutral-100 dark:border-neutral-800 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-neutral-700 dark:text-neutral-200" />
        </button>
        <h1 className="text-lg font-bold text-neutral-800 dark:text-white">{t('health_budget')}</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto w-full">
        
        {/* Family Size Section */}
        <section className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Family Size</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">How many people are you feeding?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setFamilySize(Math.max(1, familySize - 1))}
              className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
            >-</button>
            <div className="flex-1 text-center">
              <input 
                type="number" 
                min="1" 
                max="100"
                value={familySize}
                onChange={(e) => setFamilySize(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full text-center text-4xl font-black text-emerald-600 dark:text-emerald-400 bg-transparent outline-none"
              />
              <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500 mt-1 block">Members</span>
            </div>
            <button 
              onClick={() => setFamilySize(Math.min(100, familySize + 1))}
              className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
            >+</button>
          </div>
          
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={familySize} 
            onChange={(e) => setFamilySize(parseInt(e.target.value))}
            className="w-full mt-6 accent-emerald-600" 
          />
        </section>

        {/* Budget Section */}
        <section className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Monthly Budget</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Set your grocery spending limit</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-neutral-400">₹</div>
            <input 
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(parseInt(e.target.value) || 0)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 rounded-2xl py-4 pl-12 pr-4 text-2xl font-black text-neutral-800 dark:text-white focus:border-emerald-500 outline-none"
              placeholder="15000"
            />
          </div>
          <div className="flex justify-between mt-3 text-xs font-medium text-neutral-400 dark:text-neutral-500">
            <span>Recommended for {familySize}:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">~₹{familySize * 4500}</span>
          </div>
        </section>

        {/* Dietary Preferences Section */}
        <section className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-100 dark:bg-rose-900/40 p-2.5 rounded-xl text-rose-600 dark:text-rose-400">
              <HeartPulse size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Diet &amp; Lifestyle</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Curated AI recommendations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {DIETS.map(diet => {
              const isSelected = dietary.includes(diet.id);
              return (
                <button 
                  key={diet.id}
                  onClick={() => toggleDiet(diet.id)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col gap-2 relative overflow-hidden ${
                    isSelected 
                      ? 'border-emerald-600 bg-emerald-500/10 shadow-md scale-[1.02]' 
                      : 'border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:border-neutral-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                  <div className="text-2xl">{diet.icon}</div>
                  <div>
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-white'}`}>
                      {diet.label}
                    </h3>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-1">{diet.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              isSaved ? 'bg-emerald-600 text-white scale-95' : 'bg-neutral-900 dark:bg-emerald-600 text-white hover:bg-black shadow-xl shadow-neutral-900/10'
            }`}
          >
            {isSaved ? (
              <><Check size={20} /> Preferences Saved</>
            ) : (
              <><Save size={20} /> Save Health &amp; Budget Profile</>
            )}
          </button>

          {onNavigate && (
            <button 
              onClick={() => onNavigate('smart-planner')}
              className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:opacity-90 transition-all"
            >
              <Sparkles size={20} />
              Open AI Diet Planner
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
