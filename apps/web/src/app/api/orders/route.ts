// API route: /api/orders — CRUD for orders
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/orders — list all orders (with optional status filter)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const orderId = searchParams.get('id');

  try {
    // Single order with items
    if (orderId) {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      return NextResponse.json({ success: true, data: { ...order, items: items || [] } });
    }

    // List all orders
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/orders — create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { items, ...orderData } = body;

    const subtotal = items.reduce((sum: number, item: any) => sum + item.total_price, 0);
    const tax = Math.round(subtotal * 0.05);
    const deliveryFee = 40;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: orderData.user_id || null,
        customer_name: orderData.customer_name || 'Guest',
        customer_email: orderData.customer_email || '',
        customer_phone: orderData.customer_phone || '',
        delivery_address: orderData.delivery_address || '123 Smart Grocery Lane, Bangalore 560001',
        subtotal,
        tax,
        delivery_fee: deliveryFee,
        total_amount: subtotal + tax + deliveryFee,
        payment_method: orderData.payment_method || 'UPI',
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      await supabaseAdmin.from('order_items').insert(orderItems);
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/orders — update order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing id or status' },
        { status: 400 }
      );
    }

    const updateData: any = { status, updated_at: new Date().toISOString() };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
