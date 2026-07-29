'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, MapPin, CreditCard, CheckCircle, Package, Truck, Box, FileText, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useCart, useAuth } from '@/lib/providers';
import { getValidImageUrl } from '@/lib/utils';

// ============================================
// Shared Types
// ============================================

interface OrderItem {
  id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  payment_method: string;
  status: string;
  created_at: string;
  delivered_at: string | null;
  items?: OrderItem[];
}

// ============================================
// 1. CHECKOUT PROTOTYPE (Mobile Redesign)
// ============================================

export function CheckoutPrototype({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);
  const { items: cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const deliveryFee = 40;
  const tax = Math.round(cartTotal * 0.05);
  const total = cartTotal + deliveryFee + tax;

  const orderItems: OrderItem[] = cartItems.map(item => ({
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  const addresses = [
    { label: 'Home', address: '123 Smart Grocery Lane, Tech Park' },
    { label: 'Office', address: 'Building 4, Cyber City, Tech Park' },
  ];
  const paymentMethods = ['UPI / QR', 'Credit / Debit Card', 'Cash on Delivery'];

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: user?.email?.split('@')[0] || 'Guest',
          customer_email: user?.email || '',
          user_id: user?.id,
          delivery_address: addresses[selectedAddress].address,
          payment_method: paymentMethods[selectedPayment],
          items: orderItems,
        }),
      });
      const result = await res.json();
      if (result.success) {
        clearCart();
        onSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 px-6 pt-24 items-center">
        <div className="w-40 h-40 bg-neutral-100 rounded-full flex items-center justify-center text-6xl mb-6">🛒</div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Cart is empty</h2>
        <p className="text-neutral-400 text-center">Add some items before checking out.</p>
        <button onClick={onBack} className="mt-6 bg-primary text-white px-8 py-3 rounded-2xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Checkout</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Delivery Address */}
        <div>
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Delivery Address</h2>
          <div className="space-y-3">
            {addresses.map((addr, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAddress(idx)}
                className={`p-4 rounded-3xl cursor-pointer transition flex items-center gap-4 ${selectedAddress === idx ? 'bg-primary-light border border-primary/20' : 'bg-white border border-neutral-100 shadow-sm'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${selectedAddress === idx ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm ${selectedAddress === idx ? 'text-primary' : 'text-neutral-900'}`}>{addr.label}</h3>
                  <p className="text-xs text-neutral-500 mt-1 truncate">{addr.address}</p>
                </div>
                {selectedAddress === idx && <CheckCircle size={24} className="text-primary shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Payment Method</h2>
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-neutral-100">
            {paymentMethods.map((method, idx) => (
              <label
                key={idx}
                onClick={() => setSelectedPayment(idx)}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition ${selectedPayment === idx ? 'bg-neutral-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPayment === idx ? 'bg-primary-light text-primary' : 'bg-neutral-100 text-neutral-500'}`}>
                    <CreditCard size={18} />
                  </div>
                  <span className={`font-bold text-sm ${selectedPayment === idx ? 'text-neutral-900' : 'text-neutral-600'}`}>{method}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === idx ? 'border-primary' : 'border-neutral-300'}`}>
                  {selectedPayment === idx && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Items ({cartItems.length})</h2>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 space-y-3">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getValidImageUrl(item.image_url, item.name)} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 truncate max-w-[150px]">{item.name}</p>
                    <p className="text-xs text-neutral-400">x{item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-neutral-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Order Summary</h2>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span className="font-bold text-neutral-900">₹{cartTotal}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Delivery Fee</span><span className="font-bold text-neutral-900">₹{deliveryFee}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Taxes</span><span className="font-bold text-neutral-900">₹{tax}</span></div>
            <div className="border-t border-neutral-100 pt-3 mt-1 flex justify-between items-center">
              <span className="font-bold text-neutral-900">Total</span>
              <span className="text-2xl font-black text-primary">₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Bar fixed at bottom (above nav) */}
      <div className="fixed bottom-[64px] left-0 right-0 max-w-[428px] mx-auto bg-white p-6 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-neutral-100">
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary-hover shadow-lg shadow-primary/30 disabled:opacity-70 flex justify-center items-center gap-2 transition-transform active:scale-95"
        >
          {isProcessing ? <><span className="animate-spin text-xl">⏳</span> Processing...</> : 'Place Order'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// 2. ORDER HISTORY & TRACKING (Mobile)
// ============================================

export function OrderHistoryPrototype({ initialOrderId, onBack }: { initialOrderId?: string | null, onBack?: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!session) return;
    fetch(`${API_BASE}/orders/history`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    .then(async res => {
      if (!res.ok) return null;
      const ct = res.headers.get('content-type');
      if (!ct || !ct.includes('application/json')) return null;
      return res.json();
    })
    .then(result => {
      if (result && result.success) {
        setOrders(result.data);
        if (initialOrderId) {
          const found = result.data.find((o: Order) => o.id === initialOrderId);
          if (found) {
            setSelectedOrder(found);
          } else if (result.data.length > 0) {
            // Fallback for presentation mock mode or sync delay
            setSelectedOrder(result.data[0]);
          }
        }
      }
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [session, initialOrderId]);

  const handleSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  if (selectedOrder) {
    return <OrderTrackingView order={selectedOrder} onBack={() => { setSelectedOrder(null); if (onBack) onBack(); }} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 px-6 py-8">
      <h1 className="text-2xl font-black text-neutral-900 mb-6">My Orders</h1>
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">No orders yet</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} onClick={() => handleSelect(order)} className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 cursor-pointer active:scale-[0.98] transition">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center"><Package size={20} /></div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm">{order.order_number}</h3>
                    <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="font-black text-primary">₹{order.total_amount}</span>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-neutral-50">
                <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-primary' : 'bg-orange-500'}`}></div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderTrackingView({ order, onBack }: { order: Order, onBack: () => void }) {
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const labels: Record<string, string> = { pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing', shipped: 'On the way', delivered: 'Delivered' };
  const icons = [FileText, CheckCircle, Box, Truck, MapPin];
  
  const currentIndex = steps.indexOf(order.status);
  
  // Calculate ETA (30 mins from creation)
  const createdAt = new Date(order.created_at);
  const estimatedArrival = new Date(createdAt.getTime() + 30 * 60000);
  const now = new Date();
  const diffMins = Math.max(0, Math.floor((estimatedArrival.getTime() - now.getTime()) / 60000));
  const etaText = diffMins > 0 ? `Arriving in ${diffMins} mins` : 'Arriving soon';
  const arrivalTimeStr = estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Track Order</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Order ID</p>
            <p className="font-bold text-neutral-900">{order.order_number}</p>
          </div>
          <button className="flex items-center gap-2 text-primary font-bold text-sm bg-primary-light px-4 py-2 rounded-xl">
            <Download size={16} /> Invoice
          </button>
        </div>

        {/* Mock Live Tracking Map */}
        <div className="bg-neutral-200 rounded-3xl h-48 mb-6 relative overflow-hidden shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" alt="Map" className="w-full h-full object-cover opacity-50 grayscale" />
          
          {/* Animated Route Line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 20 80 Q 50 50 80 20" fill="transparent" stroke="#22c55e" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
          </svg>
          
          {/* Store Pin */}
          <div className="absolute top-[20%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary">
            <MapPin size={16} className="text-primary" />
          </div>
          
          {/* Animated Car/Delivery Pin */}
          <div className="absolute bottom-[80%] right-[20%] -translate-x-1/2 translate-y-1/2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ left: '30%', top: '65%' }}>
            <Truck size={18} />
          </div>
          
          {/* ETA Badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white font-bold text-sm text-neutral-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {etaText}
          </div>
        </div>

        {/* Route Details */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-neutral-100 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0"><Box size={14} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">From Store</p>
              <p className="text-sm font-bold text-neutral-900 truncate">FreshCart Main Hub</p>
            </div>
          </div>
          <div className="ml-4 border-l-2 border-dashed border-neutral-200 h-4 my-1"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0"><MapPin size={14} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Delivery To</p>
              <p className="text-sm font-bold text-neutral-900 truncate">{order.delivery_address}</p>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-neutral-100 flex justify-between items-center">
            <span className="text-sm font-bold text-neutral-600">Expected Arrival</span>
            <span className="text-sm font-black text-primary">{arrivalTimeStr}</span>
          </div>
        </div>

        {/* Driver Details */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80" alt="Driver" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Rahul Sharma</h3>
              <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5"><span className="text-orange-400 font-black">★ 4.9</span> (2.4k deliveries)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <span className="text-lg">💬</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30">
              <span className="text-lg">📞</span>
            </button>
          </div>
        </div>

        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-6">Delivery Status</h2>
        
        {/* Vertical Timeline */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 pl-8">
          <div className="relative">
            {/* Background Line */}
            <div className="absolute left-6 top-6 bottom-6 w-1 bg-neutral-100 rounded-full"></div>
            {/* Active Line */}
            <div className="absolute left-6 top-6 w-1 bg-primary rounded-full transition-all duration-1000" style={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}></div>
            
            <div className="space-y-8 relative z-10">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentIndex;
                const Icon = icons[idx];
                return (
                  <div key={step} className="flex gap-6 items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-colors duration-500 ${isCompleted ? 'bg-primary border-primary-light text-white' : 'bg-white border-neutral-100 text-neutral-300'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${isCompleted ? 'text-neutral-900' : 'text-neutral-400'}`}>{labels[step]}</h3>
                      <p className="text-xs text-neutral-400 mt-1">{isCompleted ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. ANALYTICS DASHBOARD (Dark Mode Mockup match)
// ============================================

export function OrderAnalyticsPrototype() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(async res => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) return null;
        return res.json();
      })
      .then(r => { if (r && r.data) setData(r.data); });
  }, []);

  if (!data) return <div className="bg-[#111315] min-h-screen"></div>;

  return (
    <div className="min-h-screen bg-[#111315] text-white p-6 pb-24 font-sans">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
          <p className="text-[#8e939a] text-sm mt-1">Store Overview</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1e2024] flex items-center justify-center border border-[#2b2d31]">
          <span className="text-lg">📊</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1e2024] p-5 rounded-3xl border border-[#2b2d31]">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4"><span className="text-lg">💵</span></div>
          <p className="text-[#8e939a] text-xs font-bold uppercase tracking-wider mb-1">Revenue</p>
          <h2 className="text-xl font-black">₹{(data.totalRevenue / 1000).toFixed(1)}k</h2>
        </div>
        <div className="bg-[#1e2024] p-5 rounded-3xl border border-[#2b2d31]">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4"><span className="text-lg">📦</span></div>
          <p className="text-[#8e939a] text-xs font-bold uppercase tracking-wider mb-1">Orders</p>
          <h2 className="text-xl font-black">{data.totalOrders}</h2>
        </div>
      </div>

      <div className="bg-[#1e2024] p-6 rounded-3xl border border-[#2b2d31] mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-sm text-white">Revenue Trend</h3>
          <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-md font-bold">+14%</span>
        </div>
        <div className="h-48 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2b2d31" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8e939a', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8e939a', fontSize: 10 }} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#111315', border: '1px solid #2b2d31', borderRadius: '12px', color: '#fff' }} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22c55e', stroke: '#111315', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1e2024] p-6 rounded-3xl border border-[#2b2d31]">
        <h3 className="font-bold text-sm text-white mb-6">Order Volume</h3>
        <div className="h-40 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8e939a', fontSize: 10 }} />
              <RechartsTooltip cursor={{ fill: '#2b2d31' }} contentStyle={{ backgroundColor: '#111315', border: 'none', borderRadius: '12px' }} />
              <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
