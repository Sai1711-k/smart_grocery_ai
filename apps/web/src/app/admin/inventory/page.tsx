'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers';
import { getValidImageUrl } from '@/lib/utils';
import { Plus, Save, Package, IndianRupee, Store, Trash2, Search, X, Upload, ChevronDown, Box, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Provider {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
}

interface InventoryItem {
  id: string;
  stock_quantity: number;
  price: number;
  products: Product;
  providers: Provider;
}

export default function AdminInventoryPage() {
  const { session, user } = useAuth();
  const router = useRouter();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Product Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', description: '', unit: 'kg', image_url: '' });

  useEffect(() => {
    const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'sai17042004@gmail.com';
    if (!session) { router.push('/'); return; }
    if (!isAdmin) { alert('Access Denied: Admins Only'); router.push('/'); return; }
    fetchData();
  }, [session, router, user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${session?.access_token}` };
      const [invRes, provRes] = await Promise.all([
        fetch(`${API_BASE}/admin/inventory`, { headers }),
        fetch(`${API_BASE}/admin/providers`, { headers })
      ]);
      const invData = invRes.ok && invRes.headers.get('content-type')?.includes('application/json') ? await invRes.json() : null;
      const provData = provRes.ok && provRes.headers.get('content-type')?.includes('application/json') ? await provRes.json() : null;
      if (invData && invData.success) setInventory(invData.data);
      if (provData && provData.success) setProviders(provData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (productId: string, providerId: string, newStock: number, newPrice: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/inventory`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ product_id: productId, provider_id: providerId, stock_quantity: newStock, price: newPrice })
      });
      const data = await res.json();
      if (data.success) { showToast('✅ Inventory updated successfully!'); fetchData(); }
      else showToast('Error: ' + data.error, 'error');
    } catch (err) { console.error(err); }
  };

  const handleRemoveInventoryItem = async (inventoryId: string) => {
    if (!confirm('Remove this item from provider inventory?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/${inventoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (data.success) { showToast('🗑️ Item removed from inventory!'); fetchData(); }
      else showToast('Error: ' + data.error, 'error');
    } catch (err) { console.error(err); }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product entirely from the global catalog? This removes all provider inventory for this product.')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (data.success) { showToast('🗑️ Product deleted from catalog!'); fetchData(); }
      else showToast('Error: ' + data.error, 'error');
    } catch (err) { console.error(err); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Product added to global catalog!');
        setShowAddForm(false);
        setNewProduct({ name: '', category: '', description: '', unit: 'kg', image_url: '' });
        if (providers.length > 0) {
          await handleUpdateInventory(data.data.id, providers[0].id, 0, 0);
        }
      }
    } catch (err) { console.error(err); }
  };

  const filteredInventory = inventory.filter(item =>
    !searchQuery || item.products?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.products?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = inventory.length;
  const lowStockCount = inventory.filter(i => i.stock_quantity > 0 && i.stock_quantity <= 5).length;
  const outOfStockCount = inventory.filter(i => i.stock_quantity === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-5 md:p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl text-sm font-bold shadow-2xl animate-slide-in-right ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Inventory Management</h1>
            <p className="text-neutral-500 text-sm font-medium mt-0.5">Manage products, stock levels, and pricing</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${showAddForm ? 'bg-neutral-800 text-neutral-300 border border-neutral-700' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'}`}
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Cancel' : 'Add New Product'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Box size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{totalProducts}</p>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Products</p>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertCircle size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{lowStockCount}</p>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Low Stock</p>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Package size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{outOfStockCount}</p>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Plus size={18} className="text-emerald-400" /> Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full p-3.5 bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:border-emerald-500 outline-none text-sm font-medium placeholder:text-neutral-600 transition-colors"
                  placeholder="e.g. Organic Tomato" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Category</label>
                <input required type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full p-3.5 bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:border-emerald-500 outline-none text-sm font-medium placeholder:text-neutral-600 transition-colors"
                  placeholder="e.g. Vegetables" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Unit</label>
                <input required type="text" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                  className="w-full p-3.5 bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:border-emerald-500 outline-none text-sm font-medium placeholder:text-neutral-600 transition-colors"
                  placeholder="e.g. kg, pack, 500g" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Image URL</label>
                <input type="text" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                  className="w-full p-3.5 bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:border-emerald-500 outline-none text-sm font-medium placeholder:text-neutral-600 transition-colors"
                  placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.98]">
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full pl-11 pr-4 py-3.5 bg-neutral-900 text-white rounded-xl border border-neutral-800 focus:border-emerald-500/50 outline-none text-sm font-medium placeholder:text-neutral-600 transition-colors"
          />
        </div>

        {/* Inventory Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider">Provider</th>
                  <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider">Price (₹)</th>
                  <th className="px-5 py-4 text-[11px] font-black text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const isLow = item.stock_quantity > 0 && item.stock_quantity <= 5;
                  const isOut = item.stock_quantity === 0;
                  return (
                    <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-800 overflow-hidden shrink-0 ring-1 ring-neutral-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getValidImageUrl(item.products?.image_url, item.products?.name || 'product', item.products?.category)}
                              alt=""
                              referrerPolicy="no-referrer"
                              onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = getValidImageUrl(null, item.products?.name || 'product', item.products?.category); }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{item.products?.name}</p>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{item.products?.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
                          <Store size={14} className="text-emerald-500" />
                          {item.providers?.name}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isOut && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                          {isLow && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                          <input
                            type="number"
                            defaultValue={item.stock_quantity}
                            id={`stock-${item.id}`}
                            className={`w-20 p-2 rounded-lg border text-sm font-bold outline-none transition-colors ${isOut ? 'bg-red-500/10 border-red-500/30 text-red-400' : isLow ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-neutral-800 border-neutral-700 text-white'}`}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500 text-xs">₹</span>
                          <input
                            type="number"
                            defaultValue={item.price}
                            id={`price-${item.id}`}
                            className="w-20 p-2 bg-neutral-800 rounded-lg border border-neutral-700 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500/50 transition-colors"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const stockInput = document.getElementById(`stock-${item.id}`) as HTMLInputElement;
                              const priceInput = document.getElementById(`price-${item.id}`) as HTMLInputElement;
                              handleUpdateInventory(item.products.id, item.providers.id, Number(stockInput.value), Number(priceInput.value));
                            }}
                            className="bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-lg hover:bg-emerald-500/20 inline-flex items-center gap-1.5 text-xs font-bold transition-colors border border-emerald-500/20"
                          >
                            <Save size={13} /> Save
                          </button>
                          <button
                            onClick={() => handleRemoveInventoryItem(item.id)}
                            className="bg-red-500/10 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/20 inline-flex items-center gap-1.5 text-xs font-bold transition-colors border border-red-500/20"
                            title="Remove from Inventory"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredInventory.length === 0 && (
            <div className="p-12 text-center">
              <Package size={40} className="text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-500 font-bold">No inventory items found</p>
              <p className="text-neutral-600 text-sm mt-1">Add products or try a different search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
