'use client';

import { useAuth } from '@/lib/providers';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PackageSearch, Activity, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'sai17042004@gmail.com';
    if (!loading && !session) {
      router.push('/');
    } else if (!loading && !isAdmin) {
      alert('Access Denied: Admins Only');
      router.push('/');
    }
  }, [session, user, loading, router]);

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400 font-bold">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Inventory', path: '/admin/inventory', icon: PackageSearch, description: 'Manage products & stock' },
    { name: 'Analytics', path: '/admin/analytics', icon: Activity, description: 'Sales & stock alerts' },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col sticky top-0 md:h-screen z-10">
        {/* Logo Area */}
        <div className="px-6 pt-7 pb-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg tracking-tight">FreshCart</h1>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Back to App */}
        <div className="px-4 pt-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/50 transition-all text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Store
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-row md:flex-col gap-1.5 px-4 py-4 overflow-x-auto md:overflow-visible">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <div className="flex flex-col">
                  <span className="text-sm">{item.name}</span>
                  {isActive && <span className="text-[10px] text-emerald-200/70 font-medium hidden md:block">{item.description}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile Footer */}
        <div className="mt-auto hidden md:block p-5 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-500/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
