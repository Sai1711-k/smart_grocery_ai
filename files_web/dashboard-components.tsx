// frontend/src/components/dashboard/dashboard-components.tsx
// Combines DashboardPage, DashboardLayout, SpendingChart,
// RecommendationCard, HealthInsights, and Loading components
'use client';

import { ReactNode } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function DashboardPage() {
  const { user } = useProtectedRoute();
  const { data: analytics, isLoading: analyticsLoading } = useApi('/analytics/spending');
  const { data: recommendations, isLoading: recommendationsLoading } = useApi('/recommendations/personalized');
  const { data: healthInsights, isLoading: healthLoading } = useApi('/analytics/health');

  if (analyticsLoading || recommendationsLoading || healthLoading) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <h1 className="text-3xl font-bold">Welcome back, {user?.full_name}!</h1>
          <p className="mt-2 opacity-90">
            Make smarter grocery decisions with AI-powered insights
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Spending Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Monthly Spending
              </h2>
              {analytics && (
                <SpendingChart data={analytics.data} />
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Personalized Recommendations
              </h2>
              <div className="space-y-4">
                {recommendations?.data?.map((rec: any) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Insights */}
          <div className="space-y-6">
            {/* Health Insights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">
                🏥 Health Score
              </h2>
              {healthInsights && (
                <HealthInsights data={healthInsights} />
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">
                Quick Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Monthly Budget:</span>
                  <span className="font-bold text-neutral-900">₹5,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Spent This Month:</span>
                  <span className="font-bold text-neutral-900">₹3,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Remaining:</span>
                  <span className="font-bold text-green-600">₹1,800</span>
                </div>
              </div>
            </div>

            {/* Featured Action */}
            <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition">
              📱 Start Shopping
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================
// DashboardLayout Component
// ============================================

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Products', href: '/products', icon: '🛒' },
    { label: 'Cart', href: '/cart', icon: '🛍️' },
    { label: 'Orders', href: '/orders', icon: '📦' },
    { label: 'Profile', href: '/profile', icon: '👤' },
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
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
            >
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
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/privacy" className="hover:text-neutral-900">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-neutral-900">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-neutral-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// SpendingChart Component
// ============================================

interface SpendingChartProps {
  data: Array<{
    month: string;
    spent: number;
    budget: number;
  }>;
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value) => `₹${value}`}
          contentStyle={{
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <Legend />
        <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
        <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================
// RecommendationCard Component
// ============================================

interface RecommendationCardProps {
  recommendation: {
    id: string;
    title: string;
    reason: string;
    product_name: string;
    confidence: number;
  };
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-neutral-900">
            {recommendation.product_name}
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            {recommendation.reason}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${getConfidenceColor(
            recommendation.confidence
          )}`}
        >
          {Math.round(recommendation.confidence * 100)}%
        </span>
      </div>
      <button className="text-blue-600 text-sm font-medium hover:underline">
        Add to Cart →
      </button>
    </div>
  );
}

// ============================================
// HealthInsights Component
// ============================================

interface HealthInsightsProps {
  data: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    insights: string[];
  };
}

export function HealthInsights({ data }: HealthInsightsProps) {
  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-neutral-900">
            {data.score}/100
          </span>
          <span
            className={`text-sm font-medium ${
              data.trend === 'up'
                ? 'text-green-600'
                : data.trend === 'down'
                ? 'text-red-600'
                : 'text-neutral-600'
            }`}
          >
            {data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'}{' '}
            {data.trend}
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${data.score}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-700 uppercase">
          Insights
        </p>
        {data.insights.map((insight, idx) => (
          <p key={idx} className="text-xs text-neutral-600">
            • {insight}
          </p>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Loading Component
// ============================================

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-neutral-600">Loading...</p>
      </div>
    </div>
  );
}
