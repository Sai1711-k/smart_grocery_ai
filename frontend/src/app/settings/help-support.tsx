'use client';

import { useState } from 'react';
import { ChevronLeft, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

export function HelpSupport({ onBack }: { onBack: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs: FAQ[] = [
    { question: 'How do I track my order?', answer: 'Go to the Orders tab in the bottom navigation. Tap on any order to see its real-time tracking status and estimated delivery time.' },
    { question: 'How do I cancel an order?', answer: 'You can cancel an order within 5 minutes of placing it. Go to Orders → select the order → tap "Cancel Order". After 5 minutes, the order enters processing and cannot be cancelled.' },
    { question: 'What payment methods are accepted?', answer: 'We accept UPI (Google Pay, PhonePe, Paytm), debit/credit cards, net banking, and Cash on Delivery. You can manage your payment methods in Settings → Payment Methods.' },
    { question: 'How do I change my delivery address?', answer: 'Go to Settings → Delivery Addresses. You can add new addresses, set a default, or delete old ones.' },
    { question: 'What is the return policy?', answer: 'We offer full refunds on damaged or incorrect items. Report the issue within 24 hours of delivery through the order details page.' },
    { question: 'How do stock alerts work?', answer: 'When an item you want is out of stock, you\'ll see a notification bell on the home page. We\'ll alert you as soon as it\'s back in stock based on your notification settings.' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white px-6 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Help & Support</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Contact Options */}
        <div>
          <h2 className="text-sm font-black text-neutral-500 uppercase tracking-wider mb-3">Contact Us</h2>
          <div className="grid grid-cols-3 gap-3">
            <button className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow active:scale-95">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <span className="text-xs font-bold text-neutral-700">Live Chat</span>
            </button>
            <button className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow active:scale-95">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Mail size={20} />
              </div>
              <span className="text-xs font-bold text-neutral-700">Email</span>
            </button>
            <button className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow active:scale-95">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <Phone size={20} />
              </div>
              <span className="text-xs font-bold text-neutral-700">Call Us</span>
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-sm font-black text-neutral-500 uppercase tracking-wider mb-3">FAQs</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <h3 className="font-bold text-neutral-900 text-sm pr-4">{faq.question}</h3>
                  {openFaq === idx ? <ChevronUp size={16} className="text-primary shrink-0" /> : <ChevronDown size={16} className="text-neutral-400 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 -mt-1">
                    <p className="text-sm text-neutral-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
