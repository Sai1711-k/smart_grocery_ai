// API route: /api/sales-recap — Monthly sales recap analytics
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Fetch all order items with their parent order info
    const { data: orders, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, status, created_at, delivered_at');

    if (orderError) throw orderError;

    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*');

    if (itemsError) throw itemsError;

    const allOrders = orders || [];
    const allItems = orderItems || [];

    // Build order lookup
    const orderLookup: Record<string, any> = {};
    allOrders.forEach(o => { orderLookup[o.id] = o; });

    // --- Per-product breakdown ---
    const productMap: Record<string, { name: string; totalQty: number; totalRevenue: number; orderCount: number }> = {};
    allItems.forEach(item => {
      const key = item.product_name;
      if (!productMap[key]) {
        productMap[key] = { name: key, totalQty: 0, totalRevenue: 0, orderCount: 0 };
      }
      productMap[key].totalQty += item.quantity;
      productMap[key].totalRevenue += parseFloat(item.total_price);
      productMap[key].orderCount += 1;
    });

    const productBreakdown = Object.values(productMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // --- Category breakdown ---
    // Fetch products to map names to categories
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('name, category');

    const categoryLookup: Record<string, string> = {};
    (products || []).forEach((p: any) => { categoryLookup[p.name] = p.category; });

    const categoryMap: Record<string, { category: string; totalQty: number; totalRevenue: number; productCount: number }> = {};
    productBreakdown.forEach(p => {
      const cat = categoryLookup[p.name] || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, totalQty: 0, totalRevenue: 0, productCount: 0 };
      }
      categoryMap[cat].totalQty += p.totalQty;
      categoryMap[cat].totalRevenue += p.totalRevenue;
      categoryMap[cat].productCount += 1;
    });

    const categoryBreakdown = Object.values(categoryMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // --- Weekly trend (last 4 weeks) ---
    const weeklyData: { week: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (w * 7));
      
      const weekOrders = allOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= weekStart && d <= weekEnd;
      });

      weeklyData.push({
        week: `Week ${4 - w}`,
        revenue: weekOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
        orders: weekOrders.length,
      });
    }

    // --- Monthly totals ---
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const totalItemsSold = allItems.reduce((sum, i) => sum + i.quantity, 0);
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length;
    const topProduct = productBreakdown[0] || null;
    const topCategory = categoryBreakdown[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: allOrders.length,
        totalItemsSold,
        deliveredOrders,
        topProduct,
        topCategory,
        productBreakdown,
        categoryBreakdown,
        weeklyData,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
