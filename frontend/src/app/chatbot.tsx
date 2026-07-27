'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, MapPin, Loader2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hi there! I am your FreshCart AI assistant. Ask me about delivery, offers, or your location!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setIsTyping(true);

    // Process intent
    await processIntent(userText);
  };

  const processIntent = async (text: string) => {
    const lower = text.toLowerCase();
    let botReply = "I'm not sure about that. Try asking about 'delivery', 'offers', or say 'where am I' to check your location.";
    let delay = 1000;

    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      botReply = "Hello! How can I help you with your groceries today?";
    } else if (lower.includes('track') || lower.includes('order status')) {
      botReply = "You can track your order by clicking the 'Orders' icon in the bottom navigation bar.";
    } else if (lower.includes('delivery time') || lower.includes('when')) {
      botReply = "Most of our grocery deliveries are completed within 15-30 minutes!";
    } else if (lower.includes('offer') || lower.includes('deal') || lower.includes('discount')) {
      botReply = "We have great deals today! Check out our 'Sale' section for up to 50% off fresh produce.";
    } else if (lower.includes('help') || lower.includes('support')) {
      botReply = "You can reach our support team at support@freshcart.com or call 1-800-FRESH.";
    } else if (lower.includes('payment') || lower.includes('pay')) {
      botReply = "We accept all major credit cards, UPI, Google Pay, and Apple Pay.";
    } else if (lower.includes('return') || lower.includes('refund')) {
      botReply = "Not happy with your items? You can return them within 2 hours of delivery for a full refund.";
    } else if (lower.includes('location') || lower.includes('where am i')) {
      await handleLocationExtraction();
      return; // Return early, handleLocationExtraction manages state
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botReply }]);
      setIsTyping(false);
    }, delay);
  };

  const handleLocationExtraction = async () => {
    if (!navigator.geolocation) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: 'Sorry, your browser does not support geolocation.' }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      // Create a promise for geolocation to use async/await
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use Nominatim API for reverse geocoding
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

      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          sender: 'bot', 
          text: `📍 I found you! You are currently near: ${formattedAddress || data.display_name}` 
        }]);
        setIsTyping(false);
      }, 500);

    } catch (error: any) {
      let errorMsg = 'Failed to get your location.';
      if (error.code === 1) errorMsg = 'Location permission denied. Please allow location access.';
      else if (error.code === 2) errorMsg = 'Location unavailable right now.';
      else if (error.code === 3) errorMsg = 'Location request timed out.';

      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: errorMsg }]);
        setIsTyping(false);
      }, 500);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-emerald-700 transition-all z-40 active:scale-95 group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
        <Sparkles size={24} className="absolute inset-0 m-auto text-emerald-300 opacity-0 group-hover:opacity-100 group-hover:animate-pulse" />
        <MessageCircle size={28} className="group-hover:opacity-0 transition-opacity" />
      </button>

      {/* Chat Panel */}
      <div className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 w-[calc(100vw-32px)] md:w-[380px] h-[500px] max-h-[70vh] bg-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl flex flex-col overflow-hidden z-50 transition-all origin-bottom-right duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">FreshCart AI</h3>
              <p className="text-emerald-100 text-xs font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-gradient-to-b from-emerald-50/50 to-white/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-neutral-800 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${msg.sender === 'user' ? 'bg-neutral-800 text-white rounded-br-sm' : 'bg-white border border-emerald-100 text-neutral-700 shadow-sm rounded-bl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-emerald-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-neutral-100 shrink-0">
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar px-1">
            <button onClick={() => setInput('where am I?')} className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors">
              <MapPin size={12} /> My Location
            </button>
            <button onClick={() => setInput('track order')} className="shrink-0 text-[11px] font-bold text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-200 transition-colors">
              Track Order
            </button>
            <button onClick={() => setInput('offers')} className="shrink-0 text-[11px] font-bold text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-200 transition-colors">
              Latest Offers
            </button>
          </div>

          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 text-sm font-medium rounded-xl py-3.5 pl-4 pr-12 outline-none border border-transparent focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-600 text-white disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors"
            >
              <Send size={16} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
