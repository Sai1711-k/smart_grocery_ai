import React, { ReactNode } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Products', href: '#', icon: '🛒' },
    { label: 'Cart', href: '#', icon: '🛍️' },
    { label: 'Orders', href: '/', icon: '📦' },
    { label: 'Profile', href: '#', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="font-bold text-xl text-blue-600">
              🛒 Smart Grocery AI
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-100 border-t border-neutral-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-neutral-600 text-sm">
            <p>© 2026 Smart Grocery AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
