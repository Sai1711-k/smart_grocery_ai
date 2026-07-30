'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers';
import {
  User,
  LogOut,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Camera,
  Save,
  X,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  ShoppingBag,
  HeartPulse,
  Sparkles,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';

export function ProfilePage({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { user, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  // Get user initials for avatar
  const getInitials = () => {
    const n = localStorage.getItem('grocery_user_name') || displayName;
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    setName(localStorage.getItem('grocery_user_name') || displayName);
    setPhone(localStorage.getItem('grocery_user_phone') || '+91 ');
    setAddress(localStorage.getItem('grocery_user_address') || 'Not set');
    setDob(localStorage.getItem('grocery_user_dob') || 'Not set');
  }, [user]);

  const handleSave = () => {
    localStorage.setItem('grocery_user_name', name);
    localStorage.setItem('grocery_user_phone', phone);
    localStorage.setItem('grocery_user_address', address);
    localStorage.setItem('grocery_user_dob', dob);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(localStorage.getItem('grocery_user_name') || displayName);
    setPhone(localStorage.getItem('grocery_user_phone') || '+91 ');
    setAddress(localStorage.getItem('grocery_user_address') || 'Not set');
    setDob(localStorage.getItem('grocery_user_dob') || 'Not set');
    setIsEditing(false);
  };

  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'sai17042004@gmail.com';

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24">

      {/* ── Gradient Header ── */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 pt-14 pb-24 rounded-b-[52px] shadow-xl overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="absolute bottom-8 left-4 w-20 h-20 rounded-full bg-white/5 blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="relative flex flex-col items-center">
          {/* Avatar with Initial */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/40 shadow-2xl">
              <span className="text-4xl font-black text-white tracking-tight">{getInitials()}</span>
            </div>
            {/* Camera overlay */}
            <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-emerald-600 hover:scale-110 transition-transform active:scale-95 border-2 border-emerald-100">
              <Camera size={16} />
            </button>
          </div>

          {/* Name & email */}
          <h1 className="text-2xl font-black text-white tracking-tight">{localStorage.getItem('grocery_user_name') || displayName}</h1>
          <p className="text-white/70 text-sm mt-1 font-medium">{displayEmail}</p>
          {isAdmin && (
            <span className="mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full border border-white/30 uppercase tracking-wider">
              ⚡ Admin Account
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 -mt-12 relative z-10 space-y-4">

        {/* ── Editable Profile Card ── */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-base font-bold text-neutral-800 dark:text-white">Personal Info</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                <Edit3 size={15} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
                >
                  <X size={15} />
                </button>
                <button
                  onClick={handleSave}
                  className="h-9 px-4 rounded-full bg-emerald-600 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Save size={13} />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 space-y-1">
            {isEditing ? (
              <div className="space-y-4 pt-2">
                <EditField label="Full Name" value={name} onChange={setName} placeholder="Your full name" />
                <EditField label="Phone Number" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
                <EditField label="Email" value={displayEmail} onChange={() => {}} placeholder="email" disabled />
                <EditField label="Address" value={address} onChange={setAddress} placeholder="Enter your address" />
                <EditField label="Date of Birth" value={dob} onChange={setDob} placeholder="DD/MM/YYYY" />
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                <InfoRow icon={<User size={17} />} label="Full Name" value={name || displayName} color="emerald" />
                <InfoRow icon={<Phone size={17} />} label="Phone" value={phone} color="blue" />
                <InfoRow icon={<Mail size={17} />} label="Email" value={displayEmail} color="violet" />
                <InfoRow icon={<MapPin size={17} />} label="Address" value={address} color="amber" />
                <InfoRow icon={<span className="text-base">🎂</span>} label="Date of Birth" value={dob} color="rose" />
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-2">
          {isAdmin && (
            <ProfileLink
              icon={<LayoutDashboard size={18} />}
              label="Admin Dashboard"
              badge="Admin"
              badgeColor="bg-violet-600"
              iconBg="bg-violet-100 dark:bg-violet-900/30 text-violet-600"
              onClick={() => window.location.href = '/admin/inventory'}
            />
          )}
          <ProfileLink
            icon={<ClipboardList size={18} />}
            label="Order History"
            iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
            onClick={() => onNavigate?.('history')}
          />
          <ProfileLink
            icon={<HeartPulse size={18} />}
            label="Health & Budget Planner"
            iconBg="bg-rose-100 dark:bg-rose-900/30 text-rose-500"
            onClick={() => onNavigate?.('health-budget')}
          />
          <ProfileLink
            icon={<Sparkles size={18} />}
            label="AI Diet Planner"
            badge="AI"
            badgeColor="bg-emerald-600"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
            onClick={() => onNavigate?.('smart-planner')}
          />
          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1 mx-3" />
          <ProfileLink
            icon={<MapPin size={18} />}
            label="Delivery Addresses"
            iconBg="bg-amber-100 dark:bg-amber-900/30 text-amber-600"
            onClick={() => onNavigate?.('settings-addresses')}
          />
          <ProfileLink
            icon={<CreditCard size={18} />}
            label="Payment Methods"
            iconBg="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
            onClick={() => onNavigate?.('settings-payments')}
          />
          <ProfileLink
            icon={<Bell size={18} />}
            label="Notifications"
            iconBg="bg-orange-100 dark:bg-orange-900/30 text-orange-600"
            onClick={() => onNavigate?.('settings-notifications')}
          />
          <ProfileLink
            icon={<Settings size={18} />}
            label="App Settings"
            iconBg="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            onClick={() => onNavigate?.('settings-app')}
          />
          <ProfileLink
            icon={<HelpCircle size={18} />}
            label="Help & Support"
            iconBg="bg-teal-100 dark:bg-teal-900/30 text-teal-600"
            onClick={() => onNavigate?.('settings-help')}
          />
        </div>

        {/* ── Sign Out ── */}
        <button
          onClick={() => signOut()}
          className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-red-100 active:scale-[0.98] transition-all mt-2 shadow-sm border border-red-100 dark:border-red-800"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── Sub-components ─────────────────── */

function InfoRow({ icon, label, value, color = 'emerald' }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  const bgMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500',
  };
  return (
    <div className="flex items-center gap-4 py-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bgMap[color] || bgMap.emerald}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-neutral-800 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, placeholder, disabled = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none ${disabled ? 'bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30'}`}
      />
    </div>
  );
}

function ProfileLink({ icon, label, badge, badgeColor, iconBg, onClick }: { icon: React.ReactNode; label: string; badge?: string; badgeColor?: string; iconBg?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-2xl transition-colors">
      <div className="flex items-center gap-3.5 text-neutral-700 dark:text-neutral-200 font-semibold text-sm">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
          {icon}
        </div>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <div className={`px-2.5 h-6 rounded-full ${badgeColor || 'bg-emerald-600'} text-white text-[10px] font-bold flex items-center justify-center uppercase tracking-wide`}>
            {badge}
          </div>
        )}
        <ChevronRight size={15} className="text-neutral-300 dark:text-neutral-600" />
      </div>
    </button>
  );
}
