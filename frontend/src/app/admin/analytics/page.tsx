'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers';
import { getValidImageUrl } from '@/lib/utils';
import { AlertTriangle, TrendingUp, IndianRupee, Package, ArrowUpRight } from 'lucide-react';

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

  if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

  return (
    <div className="p-6 md:p-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900">Analytics & Alerts</h1>
        <p className="text-neutral-500 font-medium mt-1">Track sales performance and monitor low inventory.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <IndianRupee size={24} />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Revenue</p>
          <h2 className="text-4xl font-black text-neutral-900 mt-1">₹{salesData?.summary?.totalRevenue || 0}</h2>
          <p className="text-emerald-600 text-sm font-bold mt-2 flex items-center gap-1"><ArrowUpRight size={16}/> From recent confirmed orders</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Items Sold</p>
          <h2 className="text-4xl font-black text-neutral-900 mt-1">{salesData?.summary?.totalItemsSold || 0}</h2>
          <p className="text-blue-600 text-sm font-bold mt-2 flex items-center gap-1"><ArrowUpRight size={16}/> Products purchased</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
            <Package size={24} />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Orders</p>
          <h2 className="text-4xl font-black text-neutral-900 mt-1">{salesData?.summary?.totalOrders || 0}</h2>
          <p className="text-orange-600 text-sm font-bold mt-2 flex items-center gap-1"><ArrowUpRight size={16}/> Unique checkouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Recap Table */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-black text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary" /> Top Selling Products
          </h3>
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="p-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-black text-neutral-500 uppercase tracking-wider text-right">Units Sold</th>
                  <th className="p-4 text-xs font-black text-neutral-500 uppercase tracking-wider text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData?.topProducts?.length > 0 ? (
                  salesData.topProducts.map((product: any, idx: number) => (
                    <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getValidImageUrl(product.image_url, product.name)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-neutral-900">{product.name}</span>
                      </td>
                      <td className="p-4 text-right font-black text-neutral-700">{product.quantity_sold}</td>
                      <td className="p-4 text-right font-black text-emerald-600">₹{product.revenue}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-neutral-500 font-medium">No sales data available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts Panel */}
        <div>
          <h3 className="text-xl font-black text-neutral-900 mb-4 flex items-center gap-2 text-red-600">
            <AlertTriangle /> Urgent Stock Alerts
          </h3>
          <div className="space-y-3">
            {alerts?.length > 0 ? (
              alerts.map((alert: any) => {
                const isOutOfStock = alert.stock_quantity === 0;
                return (
                  <div key={alert.id} className={`p-4 rounded-2xl border-2 flex items-start gap-4 ${
                    isOutOfStock ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl shrink-0 overflow-hidden ${isOutOfStock ? 'bg-red-100' : 'bg-orange-100'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getValidImageUrl(alert.image_url, alert.name)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                          isOutOfStock ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                        }`}>
                          {alert.status}
                        </span>
                        <span className="text-xs font-bold text-neutral-500">{alert.provider_name}</span>
                      </div>
                      <h4 className="font-bold text-neutral-900 text-sm">{alert.product_name}</h4>
                      <p className={`text-sm font-bold mt-1 ${isOutOfStock ? 'text-red-700' : 'text-orange-700'}`}>
                        Current Stock: {alert.stock_quantity}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp size={24} />
                </div>
                <h4 className="font-bold text-emerald-900">All inventory is healthy!</h4>
                <p className="text-sm text-emerald-700 mt-1">No items are running low right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
