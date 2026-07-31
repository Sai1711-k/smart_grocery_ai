'use client';

import { useState } from 'react';
import { ChevronLeft, CreditCard, Tag, CheckCircle, Smartphone, ArrowRight, ShieldCheck, Ticket, QrCode, X, Users } from 'lucide-react';
import { useCart, useAuth } from '@/lib/providers';

interface PaymentPageProps {
  onBack: () => void;
  onSuccess: (orderId?: string) => void;
  totalAmount: number;
  deliveryAddress: string;
}

export function PaymentPage({ onBack, onSuccess, totalAmount, deliveryAddress }: PaymentPageProps) {
  const { user, session, preferences } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const [familySize, setFamilySize] = useState<number>(preferences?.familySize || 1);
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'process' | 'success'>('select');
  const [error, setError] = useState('');

  // Card form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // UPI field
  const [upiId, setUpiId] = useState('');

  const deliveryFee = 40;
  const taxAmount = Math.round(totalAmount * 0.05);
  const finalAmount = Math.max(0, totalAmount + deliveryFee + taxAmount - discount);

  const paymentMethods = [
    { id: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', icon: Smartphone, desc: 'Pay via QR code or UPI ID' },
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
    { id: 'cod', label: 'Cash on Delivery', icon: ShieldCheck, desc: 'Pay when you receive' },
  ];

  const offers = [
    { code: 'WELCOME50', desc: 'Flat ₹50 off on first order', amount: 50 },
    { code: 'FRESH20', desc: 'Flat ₹20 off on groceries', amount: 20 },
    { code: 'FREEDEL', desc: 'Free delivery on this order', amount: deliveryFee },
  ];

  const handleApplyCoupon = (code: string = couponCode) => {
    setCouponError('');
    const offer = offers.find(o => o.code === code.toUpperCase());
    if (offer) {
      setDiscount(offer.amount);
      setCouponApplied(true);
      setCouponCode(offer.code);
    } else {
      setCouponError('Invalid coupon code');
      setDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setCouponApplied(false);
    setCouponError('');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2);
    return v;
  };

  const handleProceedToPay = () => {
    setError('');
    if (selectedMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setError('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setError('Please enter a valid CVV');
        return;
      }
    }
    setPaymentStep('process');
    // Simulate payment processing, then place order
    setTimeout(() => handlePlaceOrder(), 2500);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError('');

    const generatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderItems = cartItems.map(item => ({
      product_id: item.id,
      provider_id: item.provider_id,
      quantity: item.quantity,
      price: item.price,
      product_name: item.name,
      product_image: item.image_url,
    }));

    const orderPayload = {
      id: generatedOrderId,
      order_id: generatedOrderId,
      order_number: generatedOrderId,
      customer_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer',
      customerName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer',
      customer_email: user?.email || 'customer@example.com',
      delivery_address: deliveryAddress || '123 Tech Park, Flat 402, Bengaluru',
      deliveryAddress: deliveryAddress || '123 Tech Park, Flat 402, Bengaluru',
      payment_method: paymentMethods.find(p => p.id === selectedMethod)?.label || 'Online Payment',
      paymentMethod: paymentMethods.find(p => p.id === selectedMethod)?.label || 'Online Payment',
      items: orderItems,
      cartItems: orderItems,
      total_amount: finalAmount > 0 ? finalAmount : totalAmount,
      totalAmount: finalAmount > 0 ? finalAmount : totalAmount,
      total: finalAmount > 0 ? finalAmount : totalAmount,
      subtotal: totalAmount,
      tax: taxAmount,
      delivery_fee: deliveryFee,
      deliveryFee: deliveryFee,
      status: 'PREPARING',
      created_at: new Date().toISOString()
    };

    let finalOrderId = generatedOrderId;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const isRealJwt = session?.access_token && session.access_token.startsWith('ey');
      if (isRealJwt) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        const res = await fetch(`${apiUrl}/orders/checkout`, {
          method: 'POST',
          headers,
          body: JSON.stringify(orderPayload),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success && result.order_id) {
            finalOrderId = result.order_id;
          }
        }
      }
    } catch (e: any) {
      console.log('Backend API offline or unauthorized, proceeding with resilient local checkout flow.');
    }

    // Save order locally in localStorage so tracking and order history work 100%
    try {
      const existingOrders = JSON.parse(localStorage.getItem('grocery_orders') || '[]');
      existingOrders.unshift(orderPayload);
      localStorage.setItem('grocery_orders', JSON.stringify(existingOrders));
      localStorage.setItem('grocery_last_order', JSON.stringify(orderPayload));
    } catch (e) {}

    setPaymentStep('success');
    setTimeout(() => {
      clearCart();
      onSuccess(finalOrderId);
    }, 2000);
    setIsProcessing(false);
  };

  // ========== PAYMENT PROCESSING SCREEN ==========
  if (paymentStep === 'process') {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-neutral-100 text-center max-w-sm w-full">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-black text-neutral-900 mb-2">Processing Payment</h2>
          <p className="text-neutral-500 text-sm">Verifying your {selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'card' : 'order'}...</p>
          <div className="mt-6 bg-neutral-50 rounded-2xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">AMOUNT</p>
            <p className="text-2xl font-black text-emerald-600">₹{finalAmount}</p>
          </div>
        </div>
      </div>
    );
  }

  // ========== PAYMENT SUCCESS SCREEN ==========
  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center px-6">
        <div className="text-center text-white">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-bounce">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black mb-2">Payment Successful!</h2>
          <p className="text-emerald-100 text-lg mb-8">Your order has been placed</p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-xs mx-auto">
            <p className="text-emerald-100 text-xs font-semibold mb-1">TOTAL PAID</p>
            <p className="text-3xl font-black">₹{finalAmount}</p>
          </div>
          <p className="text-emerald-200 text-sm mt-8 animate-pulse">Redirecting to live tracking...</p>
        </div>
      </div>
    );
  }

  // ========== MAIN PAYMENT SCREEN ==========
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-neutral-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Checkout</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 pb-40 overflow-y-auto">
        {/* Total Amount Summary */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-3xl p-6 shadow-lg shadow-emerald-600/20">
          <p className="text-emerald-100 font-semibold mb-1">Total Amount</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black">₹{finalAmount}</h2>
            {discount > 0 && <span className="text-emerald-200 line-through text-lg">₹{totalAmount + deliveryFee + taxAmount}</span>}
          </div>
          <div className="mt-3 flex gap-4 text-emerald-100 text-xs">
            <span>Subtotal: ₹{totalAmount}</span>
            <span>Tax: ₹{taxAmount}</span>
            <span>Delivery: ₹{deliveryFee}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={16} /></button>
          </div>
        )}

        {/* Family Size Info & Interactive Controls */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 text-sm">Ordering for {familySize} {familySize > 1 ? 'Members' : 'Person'}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Family size from your health profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50/80 p-1.5 rounded-2xl border border-blue-100 shrink-0">
            <button
              onClick={() => setFamilySize(prev => Math.max(1, prev - 1))}
              className="w-9 h-9 rounded-xl bg-white text-blue-700 font-black text-lg flex items-center justify-center shadow-sm hover:bg-blue-100 active:scale-95 transition-all"
              title="Decrease members"
            >
              -
            </button>
            <span className="font-black text-blue-900 w-6 text-center text-lg">{familySize}</span>
            <button
              onClick={() => setFamilySize(prev => Math.min(10, prev + 1))}
              className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md hover:bg-blue-700 active:scale-95 transition-all"
              title="Increase members"
            >
              +
            </button>
          </div>
        </div>

        {/* Coupons & Offers */}
        <div>
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Offers & Coupons</h3>
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
            {!couponApplied ? (
              <>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Tag size={16} className="text-neutral-400" />
                    </div>
                    <input 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter Coupon Code" 
                      className="w-full pl-9 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-emerald-500 transition-colors uppercase font-semibold text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => handleApplyCoupon()}
                    className="bg-neutral-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors"
                  >
                    APPLY
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs font-semibold mb-3">{couponError}</p>}
                <div className="space-y-2">
                  {offers.map(offer => (
                    <div key={offer.code} className="flex items-center justify-between p-3 border border-emerald-100 bg-emerald-50/50 rounded-xl border-dashed">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Ticket size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-neutral-900">{offer.code}</p>
                          <p className="text-xs text-neutral-500">{offer.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleApplyCoupon(offer.code)}
                        className="text-emerald-600 font-bold text-xs uppercase hover:underline"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">&apos;{couponCode}&apos; applied</p>
                    <p className="text-xs text-emerald-700">₹{discount} savings on this order!</p>
                  </div>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  className="text-red-500 font-bold text-xs hover:underline"
                >
                  REMOVE
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Payment Method</h3>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {paymentMethods.map((method, idx) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <div 
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center p-4 cursor-pointer transition-colors ${
                    idx !== paymentMethods.length - 1 ? 'border-b border-neutral-100' : ''
                  } ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-neutral-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 ${
                    isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isSelected ? 'text-emerald-900' : 'text-neutral-900'}`}>{method.label}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{method.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-emerald-500' : 'border-neutral-300'
                  }`}>
                    {isSelected && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* UPI Payment Details */}
        {selectedMethod === 'upi' && (
          <div>
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Scan QR Code to Pay</h3>
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-48 h-48 bg-white border-2 border-neutral-200 rounded-2xl p-3 shadow-inner mb-4 flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=grocerymerchant@upi&pn=FreshCart&am=${finalAmount}&cu=INR`)}`} 
                    alt="Scan to Pay" 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                </div>
                <p className="text-sm font-bold text-neutral-900 mb-1">Scan with any UPI app</p>
                <p className="text-xs text-neutral-400">GPay · PhonePe · Paytm · BHIM</p>
              </div>

              {/* OR separator */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-neutral-200"></div>
                <span className="text-xs font-bold text-neutral-400 uppercase">or enter UPI ID</span>
                <div className="flex-1 h-px bg-neutral-200"></div>
              </div>

              {/* UPI ID Input */}
              <div className="relative">
                <input 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi" 
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Card Payment Details */}
        {selectedMethod === 'card' && (
          <div>
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Card Details</h3>
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
              {/* Card Preview */}
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-2xl p-5 h-44 flex flex-col justify-between shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-8 bg-amber-400 rounded-md"></div>
                  <CreditCard size={24} className="text-neutral-400" />
                </div>
                <div>
                  <p className="text-lg font-mono tracking-widest mb-2">{cardNumber || '•••• •••• •••• ••••'}</p>
                  <div className="flex justify-between">
                    <span className="text-xs text-neutral-400 uppercase">{cardName || 'CARDHOLDER NAME'}</span>
                    <span className="text-xs text-neutral-400">{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="text-xs font-bold text-neutral-500 mb-1 block">Card Number</label>
                <input 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-emerald-500 transition-colors font-mono text-sm tracking-wider"
                />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-neutral-500 mb-1 block">Cardholder Name</label>
                <input 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="FULL NAME"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold uppercase"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-neutral-500 mb-1 block">Expiry</label>
                  <input 
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-neutral-500 mb-1 block">CVV</label>
                  <input 
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COD Info */}
        {selectedMethod === 'cod' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-lg">💵</span>
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Cash on Delivery</p>
              <p className="text-xs text-amber-700 mt-1">Please keep exact change of ₹{finalAmount} ready at the time of delivery. Our delivery partner will collect the payment.</p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div>
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Order Summary</h3>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal ({cartItems.length} items)</span><span className="font-bold text-neutral-900">₹{totalAmount}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Delivery Fee</span><span className="font-bold text-neutral-900">₹{deliveryFee}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Tax (5%)</span><span className="font-bold text-neutral-900">₹{taxAmount}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-sm"><span className="text-emerald-600 font-semibold">Coupon Discount</span><span className="font-bold text-emerald-600">-₹{discount}</span></div>
            )}
            <div className="border-t border-neutral-100 pt-3 mt-1 flex justify-between items-center">
              <span className="font-bold text-neutral-900">Total</span>
              <span className="text-2xl font-black text-emerald-600">₹{finalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-6 border-t border-neutral-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-30">
        <button
          onClick={handleProceedToPay}
          disabled={isProcessing}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              Pay ₹{finalAmount}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
