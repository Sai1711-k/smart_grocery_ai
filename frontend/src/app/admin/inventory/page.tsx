'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers';
import { getValidImageUrl } from '@/lib/utils';
import { Plus, Save, Package, DollarSign, Store, Trash2 } from 'lucide-react';
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
  
  // New Product Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', description: '', unit: 'kg', image_url: '' });

  useEffect(() => {
    const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'sai17042004@gmail.com';
    if (!session) {
      router.push('/');
      return;
    }
    if (!isAdmin) {
      alert('Access Denied: Admins Only');
      router.push('/');
      return;
    }
    fetchData();
  }, [session, router, user]);

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ product_id: productId, provider_id: providerId, stock_quantity: newStock, price: newPrice })
      });
      const data = await res.json();
      if (data.success) {
        alert('Inventory updated successfully!');
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveInventoryItem = async (inventoryId: string) => {
    if (!confirm('Are you sure you want to remove this item from provider inventory?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/${inventoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Item removed from inventory!');
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product entirely from the global catalog? This will remove all provider inventory for this product.')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Product deleted from catalog!');
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        alert('Product added to Global Catalog! You can now set its inventory.');
        setShowAddForm(false);
        setNewProduct({ name: '', category: '', description: '', unit: 'kg', image_url: '' });
        // Optionally, automatically add 0 stock for the first provider so it shows in the table
        if (providers.length > 0) {
          await handleUpdateInventory(data.data.id, providers[0].id, 0, 0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Admin Dashboard</h1>
            <p className="text-neutral-500 font-medium">Manage Multi-Provider Inventory</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg"
          >
            <Plus size={20} /> Add New Product
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200 mb-8">
            <h2 className="text-xl font-bold mb-4">Add Global Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-neutral-50 rounded-xl border-none" placeholder="e.g. Heirloom Tomato" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Category (e.g. Seeds, Vegetables)</label>
                <input required type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 bg-neutral-50 rounded-xl border-none" placeholder="e.g. Seeds" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Unit</label>
                <input required type="text" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-full p-3 bg-neutral-50 rounded-xl border-none" placeholder="e.g. kg, pack, 500g" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Image URL</label>
                  <input type="text" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="w-full p-3 bg-neutral-50 rounded-xl border-none" placeholder="https://..." />
                </div>
                <button type="button" onClick={() => {
                  const file = prompt("Simulated File Picker:\nEnter a file name to upload to Cloud Storage (e.g. apple.jpg):");
                  if (file) {
                    alert("Simulating upload to Supabase Storage bucket 'product-images'...");
                    setNewProduct({...newProduct, image_url: `https://via.placeholder.com/150?text=${file.replace(/\.[^/.]+$/, "")}`});
                  }
                }} className="bg-neutral-200 text-neutral-700 px-4 py-3 rounded-xl font-bold hover:bg-neutral-300 border border-neutral-300">
                  Upload Image
                </button>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-black">Save Product to Catalog</button>
              </div>
            </form>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100/50">
                  <th className="p-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Provider</th>
                  <th className="p-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Price (₹)</th>
                  <th className="p-4 text-xs font-black text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getValidImageUrl(item.products?.image_url, item.products?.name || 'product')} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900">{item.products?.name}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{item.products?.category}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-neutral-600 flex items-center gap-2">
                      <Store size={14} className="text-primary" /> {item.providers?.name}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-neutral-400" />
                        <input 
                          type="number" 
                          defaultValue={item.stock_quantity}
                          id={`stock-${item.id}`}
                          className="w-20 p-2 bg-neutral-100 rounded-lg border-none text-sm font-bold"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-neutral-400" />
                        <input 
                          type="number" 
                          defaultValue={item.price}
                          id={`price-${item.id}`}
                          className="w-20 p-2 bg-neutral-100 rounded-lg border-none text-sm font-bold"
                        />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            const stockInput = document.getElementById(`stock-${item.id}`) as HTMLInputElement;
                            const priceInput = document.getElementById(`price-${item.id}`) as HTMLInputElement;
                            handleUpdateInventory(item.products.id, item.providers.id, Number(stockInput.value), Number(priceInput.value));
                          }}
                          className="bg-neutral-900 text-white p-2 px-3 rounded-xl hover:bg-black inline-flex items-center gap-1 text-xs font-bold"
                        >
                          <Save size={14} /> Update
                        </button>
                        <button 
                          onClick={() => handleRemoveInventoryItem(item.id)}
                          className="bg-red-50 text-red-600 p-2 px-3 rounded-xl hover:bg-red-100 inline-flex items-center gap-1 text-xs font-bold border border-red-200"
                          title="Remove from Inventory"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {inventory.length === 0 && (
             <div className="p-12 text-center text-neutral-500 font-medium">No inventory found. Ensure products are linked to a provider.</div>
          )}
        </div>
      </div>
    </div>
  );
}
