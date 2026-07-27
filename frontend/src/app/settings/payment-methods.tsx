'use client';

import { useState } from 'react';
import { ChevronLeft, CreditCard, Plus, Trash2, Check, Smartphone } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  label: string;
  detail: string;
  isDefault: boolean;
}

export function PaymentMethods({ onBack }: { onBack: () => void }) {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'upi', label: 'Google Pay', detail: 'user@oksbi', isDefault: true },
    { id: '2', type: 'card', label: 'HDFC Debit Card', detail: '•••• •••• •••• 4521', isDefault: false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<'card' | 'upi' | 'wallet'>('upi');
  const [newLabel, setNewLabel] = useState('');
  const [newDetail, setNewDetail] = useState('');

  const setDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
  };

  const deleteMethod = (id: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
  };

  const addMethod = () => {
    if (!newLabel.trim() || !newDetail.trim()) return;
    setMethods(prev => [...prev, {
      id: Date.now().toString(),
      type: newType,
      label: newLabel,
      detail: newDetail,
      isDefault: false,
    }]);
    setNewLabel('');
    setNewDetail('');
    setShowAdd(false);
  };

  const typeIcon = (type: string) => {
    if (type === 'upi') return <Smartphone size={18} />;
    return <CreditCard size={18} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white px-6 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Payment Methods</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        {methods.map(method => (
          <div key={method.id} className={`bg-white p-5 rounded-3xl border-2 transition-all ${method.isDefault ? 'border-primary shadow-md shadow-primary/10' : 'border-neutral-100'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.isDefault ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-500'}`}>
                  {typeIcon(method.type)}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{method.label}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{method.detail}</p>
                  {method.isDefault && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase mt-1 inline-block">Default</span>}
                </div>
              </div>
              <button onClick={() => deleteMethod(method.id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            {!method.isDefault && (
              <button onClick={() => setDefault(method.id)} className="text-xs font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 mt-3">
                <Check size={14} /> Set as Default
              </button>
            )}
          </div>
        ))}

        {showAdd ? (
          <div className="bg-white p-5 rounded-3xl border-2 border-dashed border-primary/30 space-y-4">
            <h3 className="font-bold text-neutral-900">Add Payment Method</h3>
            <div className="flex gap-2">
              {(['upi', 'card', 'wallet'] as const).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all uppercase ${newType === t ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600'}`}
                >{t}</button>
              ))}
            </div>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              placeholder={newType === 'upi' ? 'App name (e.g. PhonePe)' : 'Card name (e.g. SBI Visa)'}
              className="w-full p-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            <input value={newDetail} onChange={e => setNewDetail(e.target.value)}
              placeholder={newType === 'upi' ? 'UPI ID (e.g. user@ybl)' : 'Card number last 4 digits'}
              className="w-full p-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-neutral-100 text-neutral-600 font-bold text-sm">Cancel</button>
              <button onClick={addMethod} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20">Save</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 font-bold flex items-center justify-center gap-2 hover:border-primary/30 hover:text-primary transition-colors">
            <Plus size={18} /> Add Payment Method
          </button>
        )}
      </div>
    </div>
  );
}
