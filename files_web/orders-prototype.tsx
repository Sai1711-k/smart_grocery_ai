// frontend/src/app/(dashboard)/orders-prototype.tsx
// Comprehensive prototype for Order Management featuring:
// 1. Checkout Page
// 2. Order History
// 3. Order Tracking
// 4. Invoice Generation
// 5. Order Analytics

'use client';

import { useState } from 'react';
// Assuming DashboardLayout exists as in previous files
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// ============================================
// Mock Data
// ============================================

const mockCartItems = [
  { id: '1', name: 'Organic Milk 1L', quantity: 2, price: 60, total: 120 },
  { id: '2', name: 'Brown Rice 1kg', quantity: 1, price: 80, total: 80 },
  { id: '3', name: 'Spinach 500g', quantity: 1, price: 40, total: 40 },
];

const mockOrders = [
  {
    id: 'ORD-2026-9821',
    date: '2026-05-25T14:30:00Z',
    status: 'Delivered',
    total: 850,
    items: 5,
    paymentMethod: 'Credit Card (ending in 4242)',
  },
  {
    id: 'ORD-2026-9844',
    date: '2026-05-26T09:15:00Z',
    status: 'Shipped',
    total: 320,
    items: 2,
    paymentMethod: 'UPI',
  },
  {
    id: 'ORD-2026-9855',
    date: '2026-05-27T10:00:00Z',
    status: 'Processing',
    total: 240,
    items: 3,
    paymentMethod: 'Cash on Delivery',
  },
];

const analyticsData = [
  { name: 'Mon', orders: 12, revenue: 4200 },
  { name: 'Tue', orders: 19, revenue: 6100 },
  { name: 'Wed', orders: 15, revenue: 5300 },
  { name: 'Thu', orders: 22, revenue: 8400 },
  { name: 'Fri', orders: 28, revenue: 10500 },
  { name: 'Sat', orders: 35, revenue: 14200 },
  { name: 'Sun', orders: 30, revenue: 12100 },
];

// ============================================
// 1. Checkout Component
// ============================================

export function CheckoutPrototype() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = mockCartItems.reduce((acc, item) => acc + item.total, 0);
  const deliveryFee = 40;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderPlaced(true);
    }, 2000);
  };

  if (orderPlaced) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Order Placed Successfully!</h1>
          <p className="text-neutral-600 text-lg text-center max-w-md">
            Your order <span className="font-bold text-blue-600">#ORD-2026-9856</span> has been confirmed. 
            You will receive a confirmation email shortly.
          </p>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => window.location.href = '/orders'}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Track Order
            </button>
            <button className="bg-white border border-neutral-200 text-neutral-700 px-6 py-3 rounded-xl font-medium hover:bg-neutral-50 transition">
              Continue Shopping
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
          <span>💳</span> Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <span>📍</span> Delivery Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-blue-500 bg-blue-50 p-4 rounded-xl cursor-pointer relative">
                  <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-blue-500"></div>
                  <h3 className="font-semibold text-blue-900">Home</h3>
                  <p className="text-sm text-blue-800 mt-1">123 Smart Grocery Lane<br/>Tech Park, Bangalore 560001</p>
                </div>
                <div className="border border-neutral-200 p-4 rounded-xl cursor-pointer hover:border-blue-300 transition group">
                  <h3 className="font-semibold text-neutral-700 group-hover:text-blue-600">Office</h3>
                  <p className="text-sm text-neutral-500 mt-1">Building 4, Cyber City<br/>Tech Park, Bangalore 560002</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <span>💰</span> Payment Method
              </h2>
              <div className="space-y-3">
                {['UPI / QR', 'Credit / Debit Card', 'Cash on Delivery'].map((method, idx) => (
                  <label key={idx} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${idx === 0 ? 'border-blue-500 bg-blue-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" defaultChecked={idx === 0} className="w-4 h-4 text-blue-600" />
                      <span className={`font-medium ${idx === 0 ? 'text-blue-900' : 'text-neutral-700'}`}>{method}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-neutral-100 sticky top-24">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {mockCartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-neutral-900">₹{item.total}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Delivery Fee</span>
                  <span className="font-medium">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Taxes</span>
                  <span className="font-medium">₹{tax}</span>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 mb-6 flex justify-between items-center">
                <span className="text-lg font-bold text-neutral-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">₹{total}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================
// 2 & 3 & 4. Order History, Tracking, & Invoice
// ============================================

export function OrderHistoryPrototype() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
          <span>📦</span> My Orders
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className={`lg:col-span-1 space-y-4 ${selectedOrder ? 'hidden lg:block' : 'block'}`}>
            {mockOrders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`bg-white p-5 rounded-2xl border-2 transition cursor-pointer ${selectedOrder?.id === order.id ? 'border-blue-500 shadow-md' : 'border-transparent shadow-sm hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-neutral-900">{order.id}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-neutral-100 mt-2">
                  <span className="text-neutral-600">{order.items} Items</span>
                  <span className="font-bold text-neutral-900">₹{order.total}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Details & Tracking */}
          <div className={`lg:col-span-2 ${!selectedOrder ? 'hidden lg:flex' : 'flex'} flex-col gap-6`}>
            {!selectedOrder ? (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 h-full flex flex-col items-center justify-center p-12 text-center text-neutral-400">
                <span className="text-6xl mb-4">👈</span>
                <h3 className="text-xl font-medium text-neutral-700">Select an order to view details</h3>
              </div>
            ) : (
              <>
                {/* Details Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <button className="lg:hidden text-blue-600 text-sm mb-4 font-medium" onClick={() => setSelectedOrder(null)}>
                        ← Back to list
                      </button>
                      <h2 className="text-2xl font-bold text-neutral-900">Order {selectedOrder.id}</h2>
                      <p className="text-neutral-500 mt-1">Placed on {new Date(selectedOrder.date).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowInvoice(true)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <span>📄</span> Invoice
                      </button>
                      {selectedOrder.status === 'Processing' && (
                        <button className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="py-8">
                    <h3 className="text-lg font-bold text-neutral-900 mb-6">Tracking Status</h3>
                    <OrderTrackingTimeline currentStatus={selectedOrder.status} />
                  </div>
                </div>

                {/* Items & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100 fill-mode-both">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">Items Summary</h3>
                    <div className="space-y-4">
                      {mockCartItems.map((item, idx) => (
                         <div key={idx} className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-xl">
                             📦
                           </div>
                           <div className="flex-1">
                             <p className="font-medium text-neutral-900">{item.name}</p>
                             <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                           </div>
                           <p className="font-bold text-neutral-900">₹{item.total}</p>
                         </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">Payment Info</h3>
                      <p className="text-neutral-600">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div className="pt-6 border-t border-neutral-100">
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">Delivery Address</h3>
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        John Doe<br/>
                        123 Smart Grocery Lane<br/>
                        Tech Park, Bangalore 560001<br/>
                        Ph: +91 98765 43210
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {showInvoice && selectedOrder && (
        <InvoiceModal order={selectedOrder} onClose={() => setShowInvoice(false)} />
      )}
    </DashboardLayout>
  );
}

// ---------------------------
// Tracking Timeline Component
// ---------------------------
function OrderTrackingTimeline({ currentStatus }: { currentStatus: string }) {
  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = steps.indexOf(currentStatus) === -1 ? 0 : steps.indexOf(currentStatus);

  return (
    <div className="relative flex justify-between items-center w-full">
      {/* Background Track */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-neutral-200 rounded-full z-0"></div>
      
      {/* Active Track */}
      <div 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-1000 ease-in-out"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      ></div>

      {/* Steps */}
      {steps.map((step, idx) => {
        const isCompleted = idx <= currentIndex;
        const isActive = idx === currentIndex;
        return (
          <div key={step} className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-white border-2 border-neutral-300 text-neutral-400'}`}>
              {isCompleted ? '✓' : idx + 1}
            </div>
            <span className={`mt-3 text-sm font-medium absolute top-full w-24 text-center ${isActive ? 'text-blue-600 font-bold' : isCompleted ? 'text-neutral-800' : 'text-neutral-400'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------
// Invoice Modal Component
// ---------------------------
function InvoiceModal({ order, onClose }: { order: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Action */}
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="font-bold text-neutral-700">Invoice Preview</h2>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              Download PDF
            </button>
            <button onClick={onClose} className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-3 py-2 rounded-lg text-sm transition">
              ✕
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto" id="printable-invoice">
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-neutral-200">
            <div>
              <h1 className="text-3xl font-black text-blue-600 mb-2">INVOICE</h1>
              <p className="text-neutral-500">#{order.id}</p>
              <p className="text-neutral-500">{new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h2 className="font-bold text-xl text-neutral-900">Smart Grocery AI</h2>
              <p className="text-neutral-500 text-sm mt-1">
                GSTIN: 29ABCDE1234F1Z5<br/>
                hello@smartgrocery.ai
              </p>
            </div>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <h3 className="font-bold text-neutral-400 text-xs uppercase mb-2">Billed To</h3>
              <p className="font-medium text-neutral-900">John Doe</p>
              <p className="text-neutral-600 text-sm">123 Smart Grocery Lane<br/>Bangalore 560001</p>
            </div>
            <div>
              <h3 className="font-bold text-neutral-400 text-xs uppercase mb-2">Payment Method</h3>
              <p className="font-medium text-neutral-900">{order.paymentMethod}</p>
            </div>
          </div>

          <table className="w-full text-left mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-200">
                <th className="py-3 font-bold text-neutral-700">Item</th>
                <th className="py-3 font-bold text-neutral-700 text-center">Qty</th>
                <th className="py-3 font-bold text-neutral-700 text-right">Price</th>
                <th className="py-3 font-bold text-neutral-700 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockCartItems.map((item, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="py-4 text-neutral-800">{item.name}</td>
                  <td className="py-4 text-center text-neutral-600">{item.quantity}</td>
                  <td className="py-4 text-right text-neutral-600">₹{item.price}</td>
                  <td className="py-4 text-right font-medium text-neutral-900">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₹240</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax (5%)</span>
                <span>₹12</span>
              </div>
              <div className="flex justify-between text-neutral-600 border-b border-neutral-200 pb-3">
                <span>Delivery</span>
                <span>₹40</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-neutral-900 pt-1">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-neutral-400 text-sm">
            Thank you for shopping with Smart Grocery AI!
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================
// 5. Order Analytics Dashboard (Admin View)
// ============================================

export function OrderAnalyticsPrototype() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">📈 Order Analytics</h1>
            <p className="text-neutral-500 mt-2">Track performance and sales volume</p>
          </div>
          <select className="bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full z-0"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Orders</p>
              <h2 className="text-3xl font-black text-neutral-900">151</h2>
              <p className="text-green-500 text-sm font-medium mt-2 flex items-center gap-1">↑ 12% vs last week</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full z-0"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Revenue</p>
              <h2 className="text-3xl font-black text-neutral-900">₹60.8k</h2>
              <p className="text-green-500 text-sm font-medium mt-2 flex items-center gap-1">↑ 8% vs last week</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full z-0"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Avg Order Value</p>
              <h2 className="text-3xl font-black text-neutral-900">₹402</h2>
              <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-1">↓ 2% vs last week</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full z-0"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Active Users</p>
              <h2 className="text-3xl font-black text-neutral-900">89</h2>
              <p className="text-green-500 text-sm font-medium mt-2 flex items-center gap-1">↑ 5% vs last week</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Revenue Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Volume Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Order Volume</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
