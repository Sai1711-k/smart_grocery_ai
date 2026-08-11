// API route: /api/analytics — Order analytics
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Fetch all orders
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const allOrders = orders || [];

    // Total stats
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    allOrders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Daily order volume (last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData: Record<string, { orders: number; revenue: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dayNames[d.getDay()];
      dailyData[key] = { orders: 0, revenue: 0 };
    }

    allOrders.forEach((o) => {
      const d = new Date(o.created_at);
      const daysDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const key = dayNames[d.getDay()];
        if (dailyData[key]) {
          dailyData[key].orders += 1;
          dailyData[key].revenue += parseFloat(o.total_amount);
        }
      }
    });

    const chartData = Object.entries(dailyData).map(([name, vals]) => ({
      name,
      orders: vals.orders,
      revenue: vals.revenue,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue),
        avgOrderValue,
        activeUsers: 89, // mock for prototype
        statusCounts,
        chartData,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
