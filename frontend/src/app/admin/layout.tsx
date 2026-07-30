'use client';

import { useAuth } from '@/lib/providers';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PackageSearch, Activity } from 'lucide-react';

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

  if (loading || !session) return <div className="p-10 text-center">Loading Admin Portal...</div>;

  const navItems = [
    { name: 'Inventory & Products', path: '/admin/inventory', icon: PackageSearch },
    { name: 'Analytics & Alerts', path: '/admin/analytics', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-neutral-200 p-6 flex flex-col gap-6 sticky top-0 md:h-screen z-10 shadow-sm md:shadow-none">
        <div className="flex items-center gap-2 text-emerald-600 font-black text-xl mb-4">
          <LayoutDashboard size={24} />
          <span>Admin Hub</span>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                  isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="mt-auto hidden md:block pt-6 border-t border-neutral-100">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Logged in as</p>
          <p className="text-sm font-bold text-neutral-900 truncate">{user?.email}</p>
          <div className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
            Super Admin
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
