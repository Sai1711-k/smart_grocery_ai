import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

const mockOrders: any[] = []; // Store mock orders in memory for presentation mode

export class OrderController {
  
  static async checkout(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const {
        cartItems, // array of { product_id, provider_id, quantity, price, product_name, product_image }
        totalAmount,
        subtotal,
        tax,
        deliveryFee,
        deliveryAddress,
        customerName,
        customerEmail,
        paymentMethod
      } = req.body;

      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ success: false, error: 'Cart is empty or invalid' });
      }

      // Generate order number
      const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      // Step 1: Create the order directly (no RPC needed)
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([{
          user_id: userId,
          order_number: orderNumber,
          customer_name: customerName || 'Guest',
          customer_email: customerEmail || '',
          customer_phone: '',
          delivery_address: deliveryAddress || '',
          total_amount: totalAmount,
          subtotal: subtotal || totalAmount,
          tax: tax || 0,
          delivery_fee: deliveryFee || 0,
          payment_method: paymentMethod || 'Online',
          status: 'confirmed',
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order insert error:', orderError);
        throw orderError;
      }

      // Step 2: Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_name: item.product_name || item.name,
        product_image: item.product_image || item.image_url || '',
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items insert error:', itemsError);
        // Still return success since order was created
      }

      // Step 3: Deduct stock for each item
      for (const item of cartItems) {
        if (item.provider_id && item.product_id) {
          const { error: rpcErr } = await supabaseAdmin.rpc('decrement_stock', {
            p_provider_id: item.provider_id,
            p_product_id: item.product_id,
            p_quantity: item.quantity
          });
          
          if (rpcErr) {
            console.error('Failed to decrement stock:', rpcErr);
          }
        }
      }

      res.json({ 
        success: true, 
        order_id: order.id, 
        order_number: order.order_number || orderNumber,
        order: order
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      
      const {
        cartItems = [],
        totalAmount = 0,
        subtotal = 0,
        tax = 0,
        deliveryFee = 0,
        deliveryAddress = '',
        customerName = 'Guest',
        paymentMethod = 'Online'
      } = req.body;
      
      const mockOrder = {
        id: 'mock-order-' + Date.now(),
        order_number: 'ORD-MOCK-' + Date.now().toString().substring(5),
        customer_name: customerName,
        total_amount: totalAmount,
        subtotal: subtotal,
        tax: tax,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod,
        status: 'confirmed',
        created_at: new Date().toISOString(),
        delivery_address: deliveryAddress || '123 Guest Location',
        items: cartItems.map((item: any) => ({
          product_name: item.product_name || item.name,
          product_image: item.product_image || item.image_url || '',
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }))
      };
      
      mockOrders.unshift(mockOrder); // Save to in-memory array

      // Fallback for presentation if DB is offline
      res.json({ 
        success: true, 
        order_id: mockOrder.id, 
        order_number: mockOrder.order_number,
        mocked: true,
        message: 'Database offline: returning mock successful order for presentation'
      });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select(`
          id, order_number, customer_name, total_amount, subtotal, tax,
          delivery_fee, payment_method, status, created_at, delivered_at, delivery_address,
          order_items ( id, product_name, product_image, quantity, unit_price, total_price )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (orders || []).map((o: any) => ({
        ...o,
        items: o.order_items || []
      }));
      
      // Combine mock orders (from failed checkouts) with real DB orders
      const combined = [...mockOrders, ...formatted];

      res.json({ success: true, data: combined });
    } catch (err: any) {
      console.error('History error:', err);
      res.json({ 
        success: true, 
        data: mockOrders // Return user's placed mock orders (starts empty)
      });
    }
  }

  static async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select(`
          id, order_number, customer_name, total_amount, subtotal, tax,
          delivery_fee, payment_method, status, created_at, delivered_at, delivery_address,
          order_items ( id, product_name, product_image, quantity, unit_price, total_price )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      res.json({ success: true, data: { ...order, items: order.order_items || [] } });
    } catch (err: any) {
      // Find in mock orders first
      const mockOrder = mockOrders.find(o => o.id === req.params.id);
      if (mockOrder) {
        return res.json({ success: true, data: mockOrder });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
