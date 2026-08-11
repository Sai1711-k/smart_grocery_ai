'use client';

import { useState, useEffect } from 'react';
import { useAuth, UserPreferences } from '@/lib/providers';
import { ArrowLeft, IndianRupee, TrendingUp, PieChart, AlertTriangle, Calendar, Award, Edit3, Check, X } from 'lucide-react';

export function BudgetDashboard({ onBack }: { onBack: () => void }) {
  const { preferences, updatePreferences, session } = useAuth();
  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetValue, setEditBudgetValue] = useState(0);

  const monthlyBudget = preferences?.monthlyBudget || 15000;

  useEffect(() => {
    async function fetchSpend() {
      try {
        const res = await fetch('/api/orders/history', {
          headers: {
            'Authorization': `Bearer ${session?.access_token || 'mock-user-token'}`
          }
        });
        if (!res.ok) return;
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) return;
        const json = await res.json();
        
        if (json.success && json.data) {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const thisMonthOrders = json.data.filter((o: any) => {
            const d = new Date(o.created_at);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          });

          const total = thisMonthOrders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
          setSpentThisMonth(total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSpend();
  }, [session]);

  const percentage = Math.min(100, (spentThisMonth / monthlyBudget) * 100);
  const isDanger = percentage > 90;
  const isWarning = percentage > 75 && percentage <= 90;

  const barColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-green-500';
  const remaining = monthlyBudget - spentThisMonth;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-neutral-100 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-neutral-700" />
        </button>
        <h1 className="text-lg font-bold text-neutral-800">Monthly Tracker</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto w-full">

        {/* Main Budget Card */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-neutral-100 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-60"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-2 text-neutral-500 font-medium text-sm">
              <Calendar size={16} />
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            {isEditingBudget ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">₹</span>
                  <input 
                    type="number" 
                    value={editBudgetValue} 
                    onChange={(e) => setEditBudgetValue(parseInt(e.target.value) || 0)}
                    className="w-28 pl-6 pr-2 py-1 text-xs font-bold border-2 border-primary rounded-full outline-none bg-primary/5"
                    autoFocus
                  />
                </div>
                <button onClick={() => {
                  updatePreferences({ ...preferences, monthlyBudget: editBudgetValue } as UserPreferences);
                  setIsEditingBudget(false);
                }} className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center"><Check size={14} /></button>
                <button onClick={() => setIsEditingBudget(false)} className="w-7 h-7 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center"><X size={14} /></button>
              </div>
            ) : (
              <button 
                onClick={() => { setEditBudgetValue(monthlyBudget); setIsEditingBudget(true); }}
                className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-200 transition-colors"
              >
                Budget: ₹{monthlyBudget.toLocaleString('en-IN')}
                <Edit3 size={12} />
              </button>
            )}
          </div>

          <div className="relative z-10">
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-1">Spent so far</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-neutral-800">
                ₹{spentThisMonth.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-8 relative z-10">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className={isDanger ? 'text-red-500' : 'text-neutral-500'}>
                {percentage.toFixed(0)}% used
              </span>
              <span className="text-neutral-400">
                {remaining >= 0 ? `₹${remaining.toLocaleString('en-IN')} left` : `₹${Math.abs(remaining).toLocaleString('en-IN')} over`}
              </span>
            </div>
            <div className="h-4 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {isDanger && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-900 text-sm">Budget Limit Approaching</h3>
              <p className="text-xs text-red-700 mt-1">You are very close to exceeding your monthly allowance. Try using the Smart Planner to find cheaper healthy alternatives.</p>
            </div>
          </div>
        )}

        {/* AI Purchasing Analysis */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={20} className="text-primary" />
            <h2 className="font-bold text-neutral-800">Purchasing Analysis</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">🥦</div>
                <div>
                  <p className="font-bold text-neutral-800 text-sm">Fresh Produce</p>
                  <p className="text-xs text-neutral-500">Vegetables & Fruits</p>
                </div>
              </div>
              <span className="font-black text-neutral-800">42%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">🥩</div>
                <div>
                  <p className="font-bold text-neutral-800 text-sm">Proteins</p>
                  <p className="text-xs text-neutral-500">Meats & Alternatives</p>
                </div>
              </div>
              <span className="font-black text-neutral-800">35%</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">🍪</div>
                <div>
                  <p className="font-bold text-neutral-800 text-sm">Snacks & Treats</p>
                  <p className="text-xs text-neutral-500">Processed foods</p>
                </div>
              </div>
              <span className="font-black text-neutral-800">23%</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
            <Award className="text-primary shrink-0" size={24} />
            <p className="text-xs text-neutral-700 leading-relaxed">
              <strong>AI Insight:</strong> You are doing great on fresh produce! However, 23% on snacks is slightly high for a <span className="font-bold">{preferences?.dietary?.[0] || 'balanced'}</span> diet. Consider swapping chips for nuts.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
