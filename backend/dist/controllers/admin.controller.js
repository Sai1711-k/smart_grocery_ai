"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const supabase_1 = require("../config/supabase");
class AdminController {
    // 1. Get all inventory (grouped by provider)
    static async getInventory(req, res) {
        try {
            const { data, error } = await supabase_1.supabaseAdmin
                .from('provider_inventory')
                .select(`
          id,
          stock_quantity,
          price,
          products ( id, name, category, image_url ),
          providers ( id, name )
        `);
            if (error)
                throw error;
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    // 2. Add a new Product to global catalog
    static async addProduct(req, res) {
        try {
            const { name, description, category, unit, image_url } = req.body;
            const { data, error } = await supabase_1.supabaseAdmin
                .from('products')
                .insert([{ name, description, category, unit, image_url }])
                .select()
                .single();
            if (error)
                throw error;
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    // 3. Set Inventory for a Provider
    static async setInventory(req, res) {
        try {
            const { provider_id, product_id, stock_quantity, price } = req.body;
            const { data, error } = await supabase_1.supabaseAdmin
                .from('provider_inventory')
                .upsert({ provider_id, product_id, stock_quantity, price }, { onConflict: 'provider_id, product_id' })
                .select()
                .single();
            if (error)
                throw error;
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    // 4. Get list of Providers
    static async getProviders(req, res) {
        try {
            const { data, error } = await supabase_1.supabaseAdmin.from('providers').select('*');
            if (error)
                throw error;
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    // 5. Delete an Inventory Item
    static async deleteInventoryItem(req, res) {
        try {
            const { id } = req.params;
            const { error } = await supabase_1.supabaseAdmin
                .from('provider_inventory')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            res.json({ success: true, message: 'Inventory item removed successfully' });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    // 6. Delete a Product from Global Catalog
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            // Delete associated inventory entries first
            await supabase_1.supabaseAdmin.from('provider_inventory').delete().eq('product_id', id);
            // Delete the product
            const { error } = await supabase_1.supabaseAdmin.from('products').delete().eq('id', id);
            if (error)
                throw error;
            res.json({ success: true, message: 'Product deleted successfully' });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}
exports.AdminController = AdminController;
