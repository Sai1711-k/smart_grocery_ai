'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers';
import { getValidImageUrl } from '@/lib/utils';
import { AlertTriangle, TrendingUp, IndianRupee, Package, ArrowUpRight, BarChart3, ShieldCheck, Activity } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminAnalyticsPage() {
  const { session } = useAuth();

  const [salesData, setSalesData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${session?.access_token}` };
      const [salesRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/analytics/sales`, { headers }),
        fetch(`${API_BASE}/admin/analytics/alerts`, { headers })
      ]);
      const sData = salesRes.ok && salesRes.headers.get('content-type')?.includes('application/json') ? await salesRes.json() : null;
      const aData = alertsRes.ok && alertsRes.headers.get('content-type')?.includes('application/json') ? await alertsRes.json() : null;
      if (sData && sData.success) setSalesData(sData.data);
      if (aData && aData.success) setAlerts(aData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: `₹${salesData?.summary?.totalRevenue || 0}`,
      subtitle: 'From confirmed orders',
      icon: <IndianRupee size={20} />,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      accent: 'emerald',
    },
    {
      label: 'Items Sold',
      value: salesData?.summary?.totalItemsSold || 0,
      subtitle: 'Products purchased',
      icon: <TrendingUp size={20} />,
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-400',
      accent: 'sky',
    },
    {
      label: 'Total Orders',
      value: salesData?.summary?.totalOrders || 0,
      subtitle: 'Unique checkouts',
      icon: <Package size={20} />,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      accent: 'violet',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <Activity size={28} className="text-emerald-400" />
            Analytics & Insights
          </h1>
          <p className="text-neutral-500 text-sm font-medium mt-1">Track sales performance and inventory health</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpiCards.map((card, idx) => (
            <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  {card.icon}
                </div>
                <span className={`${card.iconColor} text-xs font-bold flex items-center gap-1`}>
                  <ArrowUpRight size={14} />
                </span>
              </div>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{card.label}</p>
              <h2 className="text-3xl font-black text-white mt-1">{card.value}</h2>
              <p className={`${card.iconColor} text-xs font-medium mt-1.5`}>{card.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Selling Products Table */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-emerald-400" />
              Top Selling Products
            </h3>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider">#</th>
                    <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider">Product</th>
                    <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider text-right">Sold</th>
                    <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData?.topProducts?.length > 0 ? (
                    salesData.topProducts.map((product: any, idx: number) => (
                      <tr key={idx} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${idx < 3 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-neutral-800 overflow-hidden shrink-0 ring-1 ring-neutral-700">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getValidImageUrl(product.image_url, product.name)}
                                alt=""
                                onError={(e) => { (e.target as HTMLImageElement).src = getValidImageUrl(null, product.name); }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-bold text-white text-sm">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-neutral-300 text-sm">{product.quantity_sold}</td>
                        <td className="px-5 py-3.5 text-right font-black text-emerald-400 text-sm">₹{product.revenue}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <BarChart3 size={36} className="text-neutral-700 mx-auto mb-3" />
                        <p className="text-neutral-500 font-bold">No sales data yet</p>
                        <p className="text-neutral-600 text-sm mt-1">Sales will appear here once orders are placed.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Alerts Panel */}
          <div>
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-400" />
              Stock Alerts
            </h3>
            <div className="space-y-3">
              {alerts?.length > 0 ? (
                alerts.map((alert: any) => {
                  const isOutOfStock = alert.stock_quantity === 0;
                  return (
                    <div key={alert.id} className={`p-4 rounded-2xl border transition-colors ${
                      isOutOfStock
                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                        : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl shrink-0 overflow-hidden ring-1 ${isOutOfStock ? 'ring-red-500/30' : 'ring-amber-500/30'}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getValidImageUrl(alert.image_url, alert.name)}
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).src = getValidImageUrl(null, alert.name); }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isOutOfStock ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm truncate">{alert.product_name}</h4>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs font-medium text-neutral-500">{alert.provider_name}</p>
                            <p className={`text-xs font-black ${isOutOfStock ? 'text-red-400' : 'text-amber-400'}`}>
                              Stock: {alert.stock_quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="font-bold text-emerald-400">All Clear!</h4>
                  <p className="text-sm text-neutral-500 mt-1">No low-stock alerts right now.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
