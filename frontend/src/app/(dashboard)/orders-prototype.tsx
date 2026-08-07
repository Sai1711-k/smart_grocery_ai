'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, MapPin, CreditCard, CheckCircle, Package, Truck, Box, FileText, Download, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useCart, useAuth } from '@/lib/providers';
import { getValidImageUrl, generateFoodSvgDataUri } from '@/lib/utils';

// ============================================
// Shared Types
// ============================================

interface OrderItem {
  id?: string;
  name?: string;
  product_name?: string;
  quantity: number;
  price?: number;
  unit_price?: number;
  total_price?: number;
  image_url?: string;
  category?: string;
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
                    <img
                      src={getValidImageUrl(item.image_url, item.name)}
                      alt={item.name}
                     onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = getValidImageUrl(null, item.name); }}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
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

export function OrderHistoryPrototype({ initialOrderId, onBack, onNavigate }: { initialOrderId?: string | null, onBack?: () => void, onNavigate?: (view: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // 1. Read local orders immediately from localStorage for instant, offline-resilient display
    let localOrders: Order[] = [];
    try {
      const stored = localStorage.getItem('grocery_orders');
      if (stored) {
        localOrders = JSON.parse(stored);
      }
      const lastOrderStr = localStorage.getItem('grocery_last_order');
      if (lastOrderStr && localOrders.length === 0) {
        localOrders = [JSON.parse(lastOrderStr)];
      }
    } catch (e) {}

    if (localOrders.length > 0) {
      setOrders(localOrders);
      if (initialOrderId) {
        const found = localOrders.find((o: Order) => o.id === initialOrderId || o.order_number === initialOrderId);
        setSelectedOrder(found || localOrders[0]);
      } else {
        setSelectedOrder(localOrders[0]);
      }
      setLoading(false);
    }

    // 2. Fetch remote orders in background if session available with valid JWT
    const isRealJwt = session?.access_token && session.access_token.startsWith('ey');
    if (isRealJwt) {
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
        if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
          setOrders(result.data);
          if (initialOrderId) {
            const found = result.data.find((o: Order) => o.id === initialOrderId || o.order_number === initialOrderId);
            if (found) setSelectedOrder(found);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session, initialOrderId]);

  const handleSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  if (selectedOrder) {
    return <OrderTrackingView order={selectedOrder} onBack={() => { setSelectedOrder(null); if (onBack) onBack(); }} onNavigate={onNavigate} />;
  }

  const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered');
  const historyOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'delivered');

  const handleClearHistoryItem = (orderId: string) => {
    try {
      const updated = orders.filter(o => o.id !== orderId && o.order_number !== orderId);
      setOrders(updated);
      localStorage.setItem('grocery_orders', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 px-6 py-8">
      <h1 className="text-2xl font-black text-neutral-900 mb-6">My Orders & History</h1>
      
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : orders.length === 0 ? (
        /* ── Beautiful Empty State ── */
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="relative mb-6">
            <div className="w-28 h-28 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100/50">
              <Package size={48} className="text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
              <span className="text-lg">📦</span>
            </div>
          </div>
          <h2 className="text-xl font-black text-neutral-800 mb-2">No Orders Received Yet</h2>
          <p className="text-sm text-neutral-400 font-medium max-w-xs mb-8 leading-relaxed">
            Looks like you haven't placed any orders yet. Browse our fresh groceries and get started with your first order!
          </p>
          <button
            onClick={() => onNavigate?.('home')}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.97] flex items-center gap-2"
          >
            <span>🛒</span>
            <span>Start Shopping</span>
            <ArrowRight size={16} />
          </button>
          <div className="flex items-center gap-4 mt-8">
            {[
              { icon: '⚡', text: '10-min delivery' },
              { icon: '💰', text: 'Best prices' },
              { icon: '🌿', text: 'Farm fresh' },
            ].map(b => (
              <span key={b.text} className="flex items-center gap-1 text-[11px] text-neutral-400 font-bold">
                <span>{b.icon}</span>{b.text}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-md mx-auto w-full">
          {/* SECTION 1: ACTIVE PLACED ORDERS */}
          {activeOrders.length > 0 && (
          <div>
            <h2 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-3">Active Orders</h2>
              <div className="space-y-3">
                {activeOrders.map(order => {
                  const orderTotal = Number(
                    order.total_amount || 
                    (order as any).totalAmount || 
                    (order as any).total || 
                    (order.items || []).reduce((sum, item) => sum + ((item.price || item.unit_price || 0) * item.quantity), 0)
                  ) || 340;
                  return (
                    <div key={order.id} onClick={() => handleSelect(order)} className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 cursor-pointer active:scale-[0.98] transition">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                            <Package size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-neutral-900 text-sm">{order.order_number}</h3>
                            <p className="text-[11px] text-neutral-400">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="font-black text-emerald-600 text-sm">₹{orderTotal}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-extrabold rounded-full uppercase">
                          {order.status}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">Track Order →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
          )}

          {/* SECTION 2: ORDER HISTORY (DELIVERED & CANCELLED) */}
          {historyOrders.length > 0 && (
          <div>
            <h2 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-3">Order History & Refunds</h2>
              <div className="space-y-3">
                {historyOrders.map(order => {
                  const isCancelled = order.status === 'cancelled';
                  const payMethod = order.payment_method || (order as any).paymentMethod || 'Online Payment';
                  const isCOD = payMethod.toLowerCase().includes('cash') || payMethod.toLowerCase().includes('cod');
                  const orderTotal = Number(
                    order.total_amount || 
                    (order as any).totalAmount || 
                    (order as any).total || 
                    (order.items || []).reduce((sum, item) => sum + ((item.price || item.unit_price || 0) * item.quantity), 0)
                  ) || 340;

                  return (
                    <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${isCancelled ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'} rounded-full flex items-center justify-center font-bold`}>
                            {isCancelled ? '❌' : '✓'}
                          </div>
                          <div>
                            <h3 className="font-bold text-neutral-900 text-sm">{order.order_number}</h3>
                            <p className="text-[11px] text-neutral-400">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`font-black text-sm ${isCancelled ? 'text-rose-600 line-through' : 'text-neutral-900'}`}>₹{orderTotal}</span>
                      </div>

                      {/* Refund notice according to payment method */}
                      {isCancelled ? (
                        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-xs text-rose-700 space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="uppercase text-[10px] tracking-wider text-rose-800">Cancelled Order</span>
                            <span className="text-[10px] text-rose-500 font-normal">Method: {payMethod}</span>
                          </div>
                          <p className="leading-relaxed">
                            {isCOD ? (
                              <span>Paid via <strong>Cash on Delivery</strong> (No refund applicable).</span>
                            ) : (
                              <span>100% refund of <strong>₹{orderTotal}</strong> initiated to <strong>{payMethod}</strong> (credited within 24 hours).</span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-50 rounded-2xl text-xs text-emerald-700 font-medium">
                          Delivered Successfully • Paid via {payMethod}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                        <span className="text-[11px] text-neutral-400">{(order.items || []).length} Items</span>
                        <button 
                          onClick={() => handleClearHistoryItem(order.id)} 
                          className="text-xs font-bold text-neutral-400 hover:text-rose-500 transition-colors"
                        >
                          Remove from History
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrderTrackingView({ order, onBack, onNavigate }: { order: Order, onBack: () => void, onNavigate?: (view: string) => void }) {
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const labels: Record<string, string> = { pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing', shipped: 'On the way', delivered: 'Delivered' };
  const icons = [FileText, CheckCircle, Box, Truck, MapPin];
  
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 minutes default
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (orderStatus === 'cancelled') return;
    const createdAt = new Date(order.created_at).getTime();
    const tenMinWindow = createdAt + 10 * 60 * 1000;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((tenMinWindow - now) / 1000));
      setSecondsRemaining(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.created_at, orderStatus]);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grocery_user_coords');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return { lat: 13.0035, lng: 80.0033 }; // Chennai / Thandalam / Chettipedu coordinates
  });

  const [activeAddress, setActiveAddress] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('grocery_active_address') || 'Chettipedu, Thandalam, Chennai, PIN: 602105';
    }
    return 'Chettipedu, Thandalam, Chennai, PIN: 602105';
  });

  const [driverProgress, setDriverProgress] = useState(35);
  const [gpsActive, setGpsActive] = useState(true);

  // Continuous real-time GPS tracking for live Google Map updates
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsActive(true);
        },
        (err) => console.log('Geolocation watch fallback:', err.message),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Simulated live driver movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setDriverProgress(prev => (prev >= 90 ? 20 : prev + 2));
    }, 3000);
    return () => clearInterval(moveInterval);
  }, []);

  const confirmCancel = async () => {
    setShowCancelModal(false);
    setOrderStatus('cancelled');

    // Save cancellation in local storage array
    try {
      const stored = localStorage.getItem('grocery_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((o: Order) => (o.id === order.id || o.order_number === order.order_number) ? { ...o, status: 'cancelled' } : o);
        localStorage.setItem('grocery_orders', JSON.stringify(updated));
      }
    } catch (e) {}

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${order.id}/cancel`, { method: 'POST' });
    } catch (e) {}

    // Immediately exit tracking view and return to My Orders list view
    onBack();
  };

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timerDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const currentStepIndex = steps.indexOf(orderStatus);
  const currentIndex = currentStepIndex;
  const etaText = orderStatus === 'delivered' ? 'Delivered' : orderStatus === 'cancelled' ? 'Order Cancelled' : 'Arriving in 25 mins';
  const estimatedArrival = new Date(new Date(order.created_at).getTime() + 30 * 60000);
  const arrivalTimeStr = estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-24">
      {/* Top Header */}
      <div className="bg-white px-6 py-4 border-b border-neutral-100 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-bold text-neutral-900 text-base">Order Tracking</h1>
          <p className="text-xs text-neutral-500 font-medium">{order.order_number}</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-md mx-auto w-full">
        {/* ACTIVE 10-MIN WINDOW BANNER */}
        {orderStatus !== 'cancelled' && (
          <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-sm text-emerald-950">
                  {secondsRemaining > 0 ? '10-Minute Order Window Active' : 'Order Locked & In Transit'}
                </h3>
              </div>
              {secondsRemaining > 0 && (
                <span className="font-mono font-black text-sm text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                  ⏱️ {timerDisplay}
                </span>
              )}
            </div>

            {secondsRemaining > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  You can modify items or cancel for a 100% instant refund within the next {timerDisplay} minutes.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors border border-rose-200"
                  >
                    Cancel Order (Instant Refund)
                  </button>
                  <button 
                    onClick={() => {
                      if (onNavigate) onNavigate('home');
                      else onBack();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                  >
                    + Add Items to Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-neutral-100 rounded-2xl border border-neutral-200 text-center mt-2">
                <p className="text-xs font-bold text-neutral-700">
                  🔒 10-Minute Order Window Closed — Order Locked & In Transit
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Modifications, item additions, and order cancellations are now disabled.
                </p>
              </div>
            )}
          </div>
        )}

        {/* CANCELLED STATUS VIEW – Redirect to Order History */}
        {orderStatus === 'cancelled' ? (
          <div className="p-6 bg-white rounded-3xl border border-neutral-100 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">
              ❌
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-base">Order {order.order_number} Cancelled</h3>
              <p className="text-xs text-neutral-500 mt-1">This order has been moved to your Order History.</p>
            </div>
            <button
              onClick={onBack}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all"
            >
              View My Orders & History →
            </button>
          </div>
        ) : (
          <>
            {/* Order Header */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Order ID</p>
                <p className="font-bold text-neutral-900">{order.order_number}</p>
              </div>
              <button className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl">
                <Download size={16} /> Invoice
              </button>
            </div>

            {/* Interactive Live Google Maps Tracking */}
            {/* Interactive Live Google Maps Tracking */}
            <div className="bg-slate-900 rounded-3xl h-72 relative overflow-hidden shadow-xl border border-slate-800">
              <iframe
                title="Real Live Google Map Tracking"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(coords ? `${coords.lat},${coords.lng}` : activeAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full object-cover"
              />

              {/* Live GPS Active Badge */}
              <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{gpsActive ? 'Live GPS Connected' : 'Acquiring GPS...'}</span>
              </div>

              {/* Recenter Live Location Button */}
              <button
                onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(pos => {
                      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      setGpsActive(true);
                    });
                  }
                }}
                className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md text-emerald-700 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200 flex items-center gap-1.5 hover:bg-emerald-50 transition active:scale-95"
              >
                <MapPin size={14} className="text-emerald-600" />
                <span>My Live Location</span>
              </button>

              {/* Animated GPS Live Driver Pulse Overlay */}
              <div 
                className="absolute z-10 transition-all duration-1000 ease-in-out w-11 h-11 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-emerald-400/50"
                style={{ left: `${Math.min(85, Math.max(15, driverProgress))}%`, top: `${Math.min(75, Math.max(20, 75 - driverProgress * 0.5))}%` }}
              >
                <Truck size={22} className="animate-pulse" />
              </div>

              {/* Store Pin */}
              <div className="absolute top-[25%] right-[20%] z-10 w-9 h-9 bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-500">
                <MapPin size={18} className="text-emerald-600" />
              </div>

              {/* ETA Badge Overlay */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-slate-200 font-bold text-sm text-slate-900 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                {etaText}
              </div>
            </div>

            {/* Route Details */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0"><Box size={14} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">From Hub</p>
                  <p className="text-sm font-bold text-neutral-900 truncate">FreshCart Super Hub #104 — Chennai</p>
                </div>
              </div>
              <div className="ml-4 border-l-2 border-dashed border-neutral-200 h-4 my-1"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><MapPin size={14} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Delivery To</p>
                  <p className="text-sm font-bold text-neutral-900 truncate">{activeAddress || order.delivery_address}</p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-sm font-bold text-neutral-600">Expected Arrival</span>
                <span className="text-sm font-black text-emerald-600">{arrivalTimeStr}</span>
              </div>
            </div>

            {/* Driver Details */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                  <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80" alt="Driver" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Rahul Sharma</h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5"><span className="text-amber-400 font-black">★ 4.9</span> (2.4k deliveries)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => alert('Opening live chat with delivery agent Rahul...')} className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="text-lg">💬</span>
                </button>
                <button onClick={() => alert('Calling delivery agent Rahul Sharma at +91 98765 43210')} className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <span className="text-lg">📞</span>
                </button>
              </div>
            </div>
            {/* Delivery Status Timeline */}
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Delivery Status</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 pl-8">
              <div className="relative">
                <div className="absolute left-6 top-6 bottom-6 w-1 bg-neutral-100 rounded-full"></div>
                <div className="absolute left-6 top-6 w-1 bg-emerald-600 rounded-full transition-all duration-1000" style={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}></div>
                
                <div className="space-y-8 relative z-10">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentIndex;
                    const Icon = icons[idx];
                    return (
                      <div key={step} className="flex gap-6 items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-colors duration-500 ${isCompleted ? 'bg-emerald-600 border-emerald-100 text-white' : 'bg-white border-neutral-100 text-neutral-400'}`}>
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
          </>
        )}
      </div>

      {/* CANCELLATION CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-100 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-neutral-900">Cancel Order #{order.order_number}?</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Are you sure you want to cancel your order? A 100% instant refund of <span className="font-bold text-emerald-600">₹{order.total_amount}</span> will be credited back to your account.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
              >
                No, Keep My Order
              </button>
              <button
                onClick={confirmCancel}
                className="w-full py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-all border border-rose-200"
              >
                Yes, Cancel Order &amp; Refund
              </button>
            </div>
          </div>
        </div>
      )}
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
