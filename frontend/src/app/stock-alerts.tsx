'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertOctagon, Package, ChevronLeft, Bell, RefreshCw, X } from 'lucide-react';
import { getValidImageUrl } from '@/lib/utils';

interface StockAlert {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image_url: string;
  stock_quantity: number;
  level: 'critical' | 'warning';
  message: string;
}

interface CategoryAlert {
  category: string;
  outOfStock: number;
  lowStock: number;
  message: string;
}

interface AlertsData {
  criticalAlerts: StockAlert[];
  warningAlerts: StockAlert[];
  categorySummary: CategoryAlert[];
  totalCritical: number;
  totalWarning: number;
  totalAlerts: number;
}

// Toast notification component
function AlertToast({ alert, onDismiss }: { alert: StockAlert; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-slide-in-right ${
      alert.level === 'critical'
        ? 'bg-red-950/90 border-red-500/30 shadow-red-900/30'
        : 'bg-amber-950/90 border-amber-500/30 shadow-amber-900/30'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        alert.level === 'critical' ? 'bg-red-500/20' : 'bg-amber-500/20'
      }`}>
        {alert.level === 'critical'
          ? <AlertOctagon size={20} className="text-red-400" />
          : <AlertTriangle size={20} className="text-amber-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold truncate ${
          alert.level === 'critical' ? 'text-red-300' : 'text-amber-300'
        }`}>{alert.message}</p>
        <p className="text-[10px] text-white/40 mt-0.5">{alert.category}</p>
      </div>
      <button onClick={onDismiss} className="text-white/30 hover:text-white/60 shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

export function StockAlerts({ onBack }: { onBack?: () => void }) {
  const [data, setData] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<StockAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const fetchAlerts = () => {
    setLoading(true);
    fetch('/api/stock-alerts')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) throw new Error('Not JSON');
        return res.json();
      })
      .then(result => {
        if (result.success) {
          setData(result.data);
          // Show toast for first 3 critical alerts
          const topToasts = result.data.criticalAlerts.slice(0, 3);
          setToasts(topToasts);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-neutral-400">
        <p>Failed to load alerts</p>
      </div>
    );
  }

  const allAlerts = activeFilter === 'all'
    ? [...data.criticalAlerts, ...data.warningAlerts]
    : activeFilter === 'critical'
    ? data.criticalAlerts
    : data.warningAlerts;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-28 relative">
      {/* Toast Notifications Overlay */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 w-[320px] max-w-[calc(100vw-2rem)]">
        {toasts.map(toast => (
          <AlertToast key={toast.id} alert={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>

      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        {onBack ? (
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition">
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="w-10"></div>
        )}
        <h1 className="text-lg font-bold text-neutral-900">Stock Alerts</h1>
        <button onClick={fetchAlerts} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Summary Banner */}
      <div className="px-6 py-4">
        <div className="flex gap-3">
          <div className="flex-1 bg-red-50 border border-red-100 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-100/50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center mb-2">
              <AlertOctagon size={18} className="text-red-500" />
            </div>
            <p className="text-2xl font-black text-red-600">{data.totalCritical}</p>
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Out of Stock</p>
          </div>
          <div className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100/50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{data.totalWarning}</p>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Low Stock</p>
          </div>
        </div>
      </div>

      {/* Category Warnings */}
      {data.categorySummary.length > 0 && (
        <div className="px-6 mb-4">
          <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Category Alerts</h3>
            <div className="space-y-2">
              {data.categorySummary.map(cat => (
                <div key={cat.category} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    cat.outOfStock > 0 ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'
                  }`}>
                    {cat.outOfStock > 0 ? <AlertOctagon size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-800">{cat.category}</p>
                    <p className="text-[11px] text-neutral-400">{cat.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-6 mb-4">
        <div className="flex bg-white rounded-2xl p-1 border border-neutral-100 shadow-sm">
          {(['all', 'critical', 'warning'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${
                activeFilter === filter
                  ? filter === 'critical'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : filter === 'warning'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {filter === 'all' ? `All (${data.totalAlerts})` : filter === 'critical' ? `Critical (${data.totalCritical})` : `Warning (${data.totalWarning})`}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="px-6 space-y-3">
        {allAlerts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-bold text-neutral-800">All clear!</p>
            <p className="text-xs text-neutral-400 mt-1">No stock alerts in this category</p>
          </div>
        ) : (
          allAlerts.map(alert => (
            <div key={alert.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all hover:shadow-md ${
              alert.level === 'critical' ? 'border-red-100 hover:border-red-200' : 'border-amber-100 hover:border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                {/* Product Image */}
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 overflow-hidden shrink-0 border border-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getValidImageUrl(alert.image_url, alert.name)} alt={alert.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      alert.level === 'critical'
                        ? 'bg-red-50 text-red-500 border border-red-100'
                        : 'bg-amber-50 text-amber-500 border border-amber-100'
                    }`}>
                      {alert.level === 'critical' ? '🔴 Out of Stock' : `⚠️ ${alert.stock_quantity} left`}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 truncate">{alert.name}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{alert.category} • ₹{alert.price}/{alert.unit}</p>
                </div>

                <button className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  alert.level === 'critical'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}>
                  Restock
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Notification Bell with Alert Count (reusable)
export function StockAlertBell({ onClick }: { onClick: () => void }) {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    fetch('/api/stock-alerts')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) throw new Error('Not JSON');
        return res.json();
      })
      .then(result => {
        if (result.success) setAlertCount(result.data.totalAlerts);
      })
      .catch(() => {});
  }, []);

  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative border border-white/10 transition-transform active:scale-95"
    >
      <Bell size={20} />
      {alertCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-primary px-1 animate-pulse">
          {alertCount}
        </span>
      )}
    </button>
  );
}
