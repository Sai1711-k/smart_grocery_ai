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

  // Load saved data from localStorage on mount
  useEffect(() => {
    setName(localStorage.getItem('grocery_user_name') || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
    setPhone(localStorage.getItem('grocery_user_phone') || user?.user_metadata?.phone || '+91 ');
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
    setName(localStorage.getItem('grocery_user_name') || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
    setPhone(localStorage.getItem('grocery_user_phone') || user?.user_metadata?.phone || '+91 ');
    setAddress(localStorage.getItem('grocery_user_address') || 'Not set');
    setDob(localStorage.getItem('grocery_user_dob') || 'Not set');
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-24">

      {/* ── Gradient Header ── */}
      <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-14 pb-20 rounded-b-[48px] shadow-lg">
        {/* Decorative circles */}
        <div className="absolute top-6 right-8 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute bottom-10 left-6 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
              <User size={56} className="text-white" />
            </div>
            {/* Camera overlay */}
            <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-emerald-600 hover:scale-110 transition-transform active:scale-95">
              <Camera size={16} />
            </button>
          </div>

          {/* Name & email */}
          <h1 className="text-2xl font-bold text-white tracking-tight">{displayName}</h1>
          <p className="text-white/70 text-sm mt-1">{displayEmail}</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 -mt-8 relative z-10 space-y-5">

        {/* ── Editable Profile Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-lg font-bold text-neutral-800">Personal Info</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                <Edit3 size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleSave}
                  className="h-9 px-4 rounded-full bg-emerald-600 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Save size={14} />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 space-y-1">
            {isEditing ? (
              /* ── Edit Mode ── */
              <div className="space-y-4 pt-2">
                <EditField label="Full Name" value={name} onChange={setName} placeholder="Your full name" />
                <EditField label="Phone Number" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
                <EditField label="Email" value={displayEmail} onChange={() => {}} placeholder="email" disabled />
                <EditField label="Address" value={address} onChange={setAddress} placeholder="Enter your address" />
                <EditField label="Date of Birth" value={dob} onChange={setDob} placeholder="DD/MM/YYYY" />
              </div>
            ) : (
              /* ── View Mode ── */
              <div className="divide-y divide-neutral-100">
                <InfoRow icon={<User size={18} />} label="Full Name" value={name || displayName} color="emerald" />
                <InfoRow icon={<Phone size={18} />} label="Phone" value={phone} color="blue" />
                <InfoRow icon={<Mail size={18} />} label="Email" value={displayEmail} color="violet" />
                <InfoRow icon={<MapPin size={18} />} label="Address" value={address} color="amber" />
                <InfoRow
                  icon={<span className="text-base">🎂</span>}
                  label="Date of Birth"
                  value={dob}
                  color="rose"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-neutral-100">
          {(user?.user_metadata?.role === 'admin' || user?.email === 'sai17042004@gmail.com') && (
            <ProfileLink icon={<User size={20} />} label="Admin Dashboard" badge="New" onClick={() => window.location.href = '/admin/inventory'} />
          )}
          <ProfileLink icon={<span className="text-xl">❤️</span>} label="Health Preferences" onClick={() => onNavigate?.('health-budget')} />
          <ProfileLink icon={<span className="text-xl">✨</span>} label="AI Diet Planner" onClick={() => onNavigate?.('smart-planner')} badge="AI" />
          <ProfileLink icon={<span className="text-xl">₹</span>} label="Smart Budget" onClick={() => onNavigate?.('budget-dashboard')} />
          <div className="h-px bg-neutral-100 my-1 mx-4" />
          <ProfileLink icon={<MapPin size={20} />} label="Delivery Addresses" onClick={() => onNavigate?.('settings-addresses')} />
          <ProfileLink icon={<CreditCard size={20} />} label="Payment Methods" onClick={() => onNavigate?.('settings-payments')} />
          <ProfileLink icon={<Bell size={20} />} label="Notifications" onClick={() => onNavigate?.('settings-notifications')} />
          <ProfileLink icon={<Settings size={20} />} label="App Settings" onClick={() => onNavigate?.('settings-app')} />
          <ProfileLink icon={<HelpCircle size={20} />} label="Help & Support" onClick={() => onNavigate?.('settings-help')} />
        </div>

        {/* ── Sign Out ── */}
        <button
          onClick={() => signOut()}
          className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-red-100 active:scale-[0.98] transition-all mt-2 shadow-sm border border-red-100"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Sub-components ─────────────────────────────── */

/** A single read-only info row in view mode */
function InfoRow({
  icon,
  label,
  value,
  color = 'emerald',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  const bgMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgMap[color] || bgMap.emerald}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-neutral-800 truncate">{value}</p>
      </div>
    </div>
  );
}

/** A text input field used in edit mode */
function EditField({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none
          ${disabled
            ? 'bg-neutral-50 border-neutral-100 text-neutral-400 cursor-not-allowed'
            : 'bg-white border-neutral-200 text-neutral-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
          }`}
      />
    </div>
  );
}

/** Navigation row used in the quick-links card */
function ProfileLink({ icon, label, badge, onClick }: { icon: React.ReactNode; label: string; badge?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 rounded-2xl transition-colors">
      <div className="flex items-center gap-4 text-neutral-700 font-medium">
        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
          {icon}
        </div>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <div className="w-auto px-2 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
            {badge}
          </div>
        )}
        <ChevronRight size={16} className="text-neutral-300" />
      </div>
    </button>
  );
}
