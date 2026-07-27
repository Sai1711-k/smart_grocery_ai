import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export class AdminController {
  
  // 1. Get all inventory (grouped by provider)
  static async getInventory(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('provider_inventory')
        .select(`
          id,
          stock_quantity,
          price,
          products ( id, name, category, image_url ),
          providers ( id, name )
        `);
      
      if (error) throw error;
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. Add a new Product to global catalog
  static async addProduct(req: Request, res: Response) {
    try {
      const { name, description, category, unit, image_url } = req.body;
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([{ name, description, category, unit, image_url }])
        .select()
        .single();
      
      if (error) throw error;
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. Set Inventory for a Provider
  static async setInventory(req: Request, res: Response) {
    try {
      const { provider_id, product_id, stock_quantity, price } = req.body;
      
      const { data, error } = await supabaseAdmin
        .from('provider_inventory')
        .upsert({ provider_id, product_id, stock_quantity, price }, { onConflict: 'provider_id, product_id' })
        .select()
        .single();
        
      if (error) throw error;
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. Get list of Providers
  static async getProviders(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin.from('providers').select('*');
      if (error) throw error;
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
