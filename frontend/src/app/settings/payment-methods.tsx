'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, Plus, Trash2, Check, Smartphone, Wallet, Landmark, Banknote } from 'lucide-react';
import { useAuth } from '@/lib/providers';

interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'wallet' | 'netbanking' | 'cod';
  label: string;
  detail: string;
  isDefault: boolean;
  iconStr?: string;
}

export function PaymentMethods({ onBack }: { onBack: () => void }) {
  const { t } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'upi', label: 'Google Pay', detail: 'sai@oksbi', isDefault: true, iconStr: '🔵' },
    { id: '2', type: 'upi', label: 'PhonePe', detail: 'sai@ybl', isDefault: false, iconStr: '🟣' },
    { id: '3', type: 'upi', label: 'Paytm UPI', detail: 'sai@paytm', isDefault: false, iconStr: '🔷' },
    { id: '4', type: 'upi', label: 'BHIM UPI', detail: 'sai@upi', isDefault: false, iconStr: '🇮🇳' },
    { id: '5', type: 'card', label: 'HDFC Bank Visa Card', detail: '•••• •••• •••• 4521', isDefault: false },
    { id: '6', type: 'cod', label: 'Cash / Pay on Delivery', detail: 'Pay cash or UPI to delivery agent', isDefault: false, iconStr: '💵' },
  ]);
  
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<'upi' | 'card' | 'wallet' | 'netbanking'>('upi');
  const [newLabel, setNewLabel] = useState('');
  const [newDetail, setNewDetail] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grocery_saved_payment_methods');
      if (stored) {
        try { setMethods(JSON.parse(stored)); } catch (e) {}
      }
    }
  }, []);

  const saveMethods = (updated: PaymentMethod[]) => {
    setMethods(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('grocery_saved_payment_methods', JSON.stringify(updated));
    }
  };

  const setDefault = (id: string) => {
    saveMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
  };

  const deleteMethod = (id: string) => {
    saveMethods(methods.filter(m => m.id !== id));
  };

  const addMethod = () => {
    if (!newLabel.trim() || !newDetail.trim()) return;
    const newObj: PaymentMethod = {
      id: Date.now().toString(),
      type: newType,
      label: newLabel,
      detail: newDetail,
      isDefault: methods.length === 0,
    };
    saveMethods([...methods, newObj]);
    setNewLabel('');
    setNewDetail('');
    setShowAdd(false);
  };

  const typeIcon = (method: PaymentMethod) => {
    if (method.iconStr) return <span className="text-xl">{method.iconStr}</span>;
    if (method.type === 'upi') return <Smartphone size={18} />;
    if (method.type === 'wallet') return <Wallet size={18} />;
    if (method.type === 'netbanking') return <Landmark size={18} />;
    return <CreditCard size={18} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20 transition-colors">
      <div className="bg-white dark:bg-neutral-900 px-6 py-5 flex items-center gap-4 sticky top-0 z-10 border-b dark:border-neutral-800 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900 dark:text-white">{t('payment_methods')}</h1>
      </div>

      <div className="px-6 py-6 space-y-4 max-w-lg mx-auto w-full">
        {methods.map(method => (
          <div key={method.id} className={`bg-white dark:bg-neutral-900 p-5 rounded-3xl border-2 transition-all ${method.isDefault ? 'border-emerald-600 shadow-md shadow-emerald-600/10' : 'border-neutral-100 dark:border-neutral-800'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.isDefault ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                  {typeIcon(method)}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">{method.label}</h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{method.detail}</p>
                  {method.isDefault && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full uppercase mt-1 inline-block">Default</span>}
                </div>
              </div>
              <button onClick={() => deleteMethod(method.id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            {!method.isDefault && (
              <button onClick={() => setDefault(method.id)} className="text-xs font-bold text-emerald-600 hover:underline transition-colors flex items-center gap-1 mt-3">
                <Check size={14} /> Set as Default
              </button>
            )}
          </div>
        ))}

        {showAdd ? (
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border-2 border-dashed border-emerald-500/30 space-y-4">
            <h3 className="font-bold text-neutral-900 dark:text-white">Add Payment Option</h3>
            <div className="flex gap-2">
              {(['upi', 'card', 'wallet', 'netbanking'] as const).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all uppercase ${newType === t ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}
                >{t}</button>
              ))}
            </div>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              placeholder={newType === 'upi' ? 'App Name (PhonePe, Paytm, GPay, BHIM)' : 'Card or Bank Name (e.g. SBI Visa)'}
              className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm outline-none focus:border-emerald-500" />
            <input value={newDetail} onChange={e => setNewDetail(e.target.value)}
              placeholder={newType === 'upi' ? 'UPI ID (e.g. name@ybl)' : 'Card Number / Account Detail'}
              className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm outline-none focus:border-emerald-500" />
            
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold text-sm">Cancel</button>
              <button onClick={addMethod} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20">Save Method</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 font-bold flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
            <Plus size={18} /> Add Payment Method
          </button>
        )}
      </div>
    </div>
  );
}
