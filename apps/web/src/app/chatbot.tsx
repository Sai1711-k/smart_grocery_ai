'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, MapPin, Sparkles, ShoppingCart, Wallet, Salad, PhoneCall, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

const QUICK_ACTIONS = [
  { label: '📍 My Location', value: 'where am I?' },
  { label: '📦 Track Order', value: 'track my order' },
  { label: '🏷️ Latest Offers', value: 'show me offers' },
  { label: '❌ Cancel Order', value: 'how do I cancel my order?' },
  { label: '🥗 Diet Tips', value: 'give me diet tips' },
  { label: '💳 Payments', value: 'what payments are accepted?' },
  { label: '📍 Add Address', value: 'how do I add a delivery address?' },
  { label: '💰 My Budget', value: 'how do I check my budget?' },
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: '👋 Hi! I\'m your FreshCart AI assistant. I can help you with orders, delivery, diet tips, payments, and more. What do you need?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (text: string, delay = 900) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text }]);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const userText = (overrideText || input).trim();
    if (!userText) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setIsTyping(true);
    await processIntent(userText);
  };

  const processIntent = async (text: string) => {
    const lower = text.toLowerCase();

    // ── Greetings ──
    if (/^(hi|hello|hey|hlo|namaste|vanakkam)/.test(lower)) {
      addBotMessage('Hello! 😊 How can I help you with your FreshCart grocery shopping today?');

    // ── Track / Order Status ──
    } else if (lower.includes('track') || lower.includes('order status') || lower.includes('where is my order')) {
      addBotMessage('📦 To track your order:\n1. Tap the **Orders** icon in the bottom navigation bar.\n2. Select your active order.\n3. You\'ll see a live map with your driver\'s location and ETA.');

    // ── Cancel Order ──
    } else if (lower.includes('cancel') && lower.includes('order')) {
      addBotMessage('❌ **To cancel an order:**\n1. Go to the **Orders** tab in the bottom navigation.\n2. Open the active order you want to cancel.\n3. Tap "Cancel Order" within **10 minutes** of placing it.\n4. A confirmation popup will appear — tap "Yes, Cancel Order & Refund".\n\n💰 100% instant refund is processed automatically!');

    // ── Delivery Time ──
    } else if (lower.includes('delivery time') || lower.includes('how long') || lower.includes('when will')) {
      addBotMessage('🚀 Most FreshCart deliveries are completed in **15–30 minutes**! You can track your driver live on the map after placing an order.');

    // ── Offers / Deals / Discount ──
    } else if (lower.includes('offer') || lower.includes('deal') || lower.includes('discount') || lower.includes('sale')) {
      addBotMessage('🏷️ **Today\'s Deals:**\n• 🥦 Up to 40% off Fresh Vegetables\n• 🍎 Buy 2 Get 1 Free on Seasonal Fruits\n• 🥛 ₹20 off on all Dairy products\n• 🛒 Free delivery on orders above ₹200!\n\nCheck the "Top Deals" category on the home screen for more!');

    // ── Help / Support ──
    } else if (lower.includes('help') || lower.includes('support') || lower.includes('contact')) {
      addBotMessage('📞 **FreshCart Support:**\n• Email: support@freshcart.com\n• Phone: 1800-FRESH (toll-free)\n• Live Chat: You\'re already here! 😊\n\nOr go to **Profile → Help & Support** for more options.');

    // ── Payment Methods ──
    } else if (lower.includes('payment') || lower.includes('pay') || lower.includes('upi') || lower.includes('card')) {
      addBotMessage('💳 **We accept all major payment methods:**\n• Google Pay, PhonePe, Paytm, BHIM UPI\n• Credit / Debit Cards (Visa, MasterCard, RuPay)\n• Net Banking\n• Cash on Delivery (COD)\n\nGo to **Profile → Payment Methods** to manage your saved methods!');

    // ── Return / Refund ──
    } else if (lower.includes('return') || lower.includes('refund')) {
      addBotMessage('💰 **Refund & Return Policy:**\n• Cancel within **10 minutes** of placing → 100% instant refund\n• Damaged/wrong items → Report within **2 hours** of delivery\n• Refund is credited back to your original payment method within 24–48 hours.');

    // ── Add Address ──
    } else if (lower.includes('address') || lower.includes('delivery address') || lower.includes('add address') || lower.includes('location')) {
      addBotMessage('📍 **To add or manage delivery addresses:**\n1. Go to **Profile** (bottom navigation)\n2. Tap **Delivery Addresses**\n3. Tap **+ Add New Address** or use **"Use Current Location"** for GPS auto-fill!\n\nYou can save multiple addresses (Home, Office, etc.)');

    // ── Diet Tips ──
    } else if (lower.includes('diet') || lower.includes('healthy') || lower.includes('nutrition') || lower.includes('food tips')) {
      addBotMessage('🥗 **Diet Tips from FreshCart AI:**\n• 🥦 Eat 5 servings of veggies & fruits daily\n• 💧 Drink at least 8 glasses of water\n• 🫘 Include protein with every meal (eggs, legumes, dairy)\n• 🚫 Avoid processed snacks — choose nuts or fruits instead\n\nFor a personalized weekly plan, try our **AI Diet Planner** in Profile → AI Diet Planner!');

    // ── Budget ──
    } else if (lower.includes('budget') || lower.includes('spending') || lower.includes('monthly')) {
      addBotMessage('💰 **To manage your grocery budget:**\n1. Go to **Profile → Health & Budget Planner**\n2. Set your monthly grocery budget\n3. Track spending per category\n4. Get AI bundle suggestions within your budget!\n\nOur AI will alert you when you\'re nearing your monthly limit 🔔');

    // ── Language / Settings ──
    } else if (lower.includes('language') || lower.includes('change language') || lower.includes('hindi') || lower.includes('telugu')) {
      addBotMessage('🌐 **To change the app language:**\n1. Go to **Profile → App Settings**\n2. Select your preferred language from the dropdown\n3. We support: English, हिंदी, తెలుగు, தமிழ், ಕನ್ನಡ, മലയാളം, Español\n\nYour choice is saved automatically!');

    // ── Location Detection ──
    } else if (lower.includes('where am i') || lower.includes('my location') || lower.includes('find me')) {
      await handleLocationExtraction();
      return;

    // ── Store Info ──
    } else if (lower.includes('store') || lower.includes('shop') || lower.includes('branch')) {
      addBotMessage('🏪 **FreshCart Stores near you:**\n• Smart Grocery – Tech Park (Main)\n• FreshCart Express – Cyber City\n• FreshCart – IT Corridor\n\nAll stores deliver within a 5km radius. Orders from the nearest store are routed automatically!');

    // ── Fallback ──
    } else {
      addBotMessage("I'm not sure about that, but I'm always learning! 🤖\n\nTry asking me about:\n• 'track my order'\n• 'cancel order'\n• 'payment methods'\n• 'diet tips'\n• 'delivery address'\n• 'where am I?'");
    }
  };

  const handleLocationExtraction = async () => {
    if (!navigator.geolocation) {
      addBotMessage('Sorry, your browser does not support geolocation. Please check your browser settings.', 500);
      return;
    }
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      const { latitude, longitude } = position.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`);
      const data = await res.json();
      const addr = data.address;
      const formattedAddress = [
        addr.house_number,
        addr.road || addr.street,
        addr.suburb || addr.neighbourhood,
        addr.city || addr.town || addr.village,
        addr.state,
        addr.postcode
      ].filter(Boolean).join(', ');

      addBotMessage(`📍 **Found your location!**\n${formattedAddress || data.display_name}\n\nWant me to set this as your delivery address? Go to **Profile → Delivery Addresses → Use Current Location**!`, 500);

    } catch (error: any) {
      let errorMsg = 'Failed to get your location.';
      if (error.code === 1) errorMsg = '🔒 Location permission denied. Please allow location access in your browser settings.';
      else if (error.code === 2) errorMsg = '📡 Location unavailable right now. Please try again.';
      else if (error.code === 3) errorMsg = '⏰ Location request timed out. Please try again.';
      addBotMessage(errorMsg, 500);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(5,150,105,0.4)] hover:shadow-[0_12px_40px_rgba(5,150,105,0.5)] transition-all z-50 active:scale-95 group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
        <Sparkles size={22} className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageCircle size={26} className="group-hover:opacity-0 transition-opacity" />
      </button>

      {/* Chat Panel */}
      <div className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[calc(100vw-32px)] md:w-[390px] h-[520px] max-h-[75vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-neutral-200/80 dark:border-slate-800 shadow-2xl rounded-3xl flex flex-col overflow-hidden z-50 transition-all origin-bottom-right duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center ring-2 ring-white/30">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">FreshCart AI</h3>
              <p className="text-emerald-100 text-xs font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse inline-block"></span>
                Online · Always Ready
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-emerald-50/40 to-white">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-neutral-800 text-white' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'}`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`max-w-[78%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.sender === 'user' ? 'bg-neutral-800 text-white rounded-br-sm font-medium' : 'bg-white border border-emerald-100 text-neutral-700 shadow-sm rounded-bl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-white border border-emerald-100 p-3.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-neutral-100 shrink-0">
          {/* Quick Actions Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-0.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.value}
                onClick={() => { setInput(action.value); handleSend(undefined, action.value); }}
                className="shrink-0 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors whitespace-nowrap"
              >
                {action.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative mt-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 text-sm font-medium rounded-xl py-3.5 pl-4 pr-12 outline-none border border-transparent focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white disabled:opacity-40 disabled:bg-neutral-200 disabled:from-neutral-200 disabled:to-neutral-200 disabled:text-neutral-400 transition-all"
            >
              <Send size={15} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
