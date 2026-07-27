'use client';

import { useState } from 'react';
import { ChevronLeft, Moon, Sun, Globe, ChevronRight } from 'lucide-react';

export function AppSettings({ onBack }: { onBack: () => void }) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showLang, setShowLang] = useState(false);

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white px-6 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">App Settings</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Appearance */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Dark Mode</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{darkMode ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 rounded-full transition-all relative ${darkMode ? 'bg-indigo-500' : 'bg-neutral-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${darkMode ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="border-t border-neutral-50">
            <button onClick={() => setShowLang(!showLang)} className="w-full p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-neutral-900 text-sm">Language</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{language}</p>
                </div>
              </div>
              <ChevronRight size={18} className={`text-neutral-400 transition-transform ${showLang ? 'rotate-90' : ''}`} />
            </button>
            {showLang && (
              <div className="px-5 pb-4 flex flex-wrap gap-2">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLang(false); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${language === lang ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                  >{lang}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-neutral-900 text-sm">About</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Version</span>
              <span className="font-bold text-neutral-900">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Build</span>
              <span className="font-bold text-neutral-900">2026.05.31</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Developer</span>
              <span className="font-bold text-neutral-900">Smart Grocery Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
