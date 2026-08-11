'use client';

import { useState } from 'react';
import { ChevronLeft, Moon, Sun, Globe, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '@/lib/providers';

export function AppSettings({ onBack }: { onBack: () => void }) {
  const { darkMode, setDarkMode, language, setLanguage } = useAuth();
  const [showLang, setShowLang] = useState(false);

  const languages = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Spanish'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">App Settings</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Appearance */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Dark Theme</h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{darkMode ? 'Dark Mode Active' : 'Light Mode Active'}</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-7 rounded-full transition-all relative ${darkMode ? 'bg-indigo-600' : 'bg-neutral-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${darkMode ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800">
            <button onClick={() => setShowLang(!showLang)} className="w-full p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Language / भाषा</h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{language}</p>
                </div>
              </div>
              <ChevronRight size={18} className={`text-neutral-400 transition-transform ${showLang ? 'rotate-90' : ''}`} />
            </button>
            {showLang && (
              <div className="px-5 pb-5 flex flex-wrap gap-2">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLang(false); }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      language === lang 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {language === lang && <Check size={14} />}
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm">About FreshCart</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Version</span>
              <span className="font-bold text-neutral-900 dark:text-white">2.5.0 (Pro)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Environment</span>
              <span className="font-bold text-emerald-600">Production Live</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Developer</span>
              <span className="font-bold text-neutral-900 dark:text-white">Smart Grocery AI Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
