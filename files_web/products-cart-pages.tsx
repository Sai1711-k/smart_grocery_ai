// frontend/src/app/(dashboard)/products-cart-pages.tsx
// Combines ProductsPage and CartPage components
'use client';

import { useState, useEffect } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Loading } from '@/components/shared/Loading';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  health_score: number;
  description: string;
}

export function ProductsPage() {
  const { user } = useProtectedRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: categories } = useApi('/products/categories');
  const addToCartMutation = useApiMutation('POST');

  // Simulate product search
  useEffect(() => {
    if (searchQuery.length > 0 || selectedCategory) {
      setIsSearching(true);
      // In real implementation, this would call the API
      setTimeout(() => {
        setProducts([
          {
            id: '1',
            name: 'Organic Milk 1L',
            category: 'Dairy',
            price: 60,
            health_score: 85,
            description: 'Fresh organic milk',
          },
          {
            id: '2',
            name: 'Brown Rice 1kg',
            category: 'Grains',
            price: 80,
            health_score: 90,
            description: 'Healthy brown rice',
          },
          {
            id: '3',
            name: 'Spinach 500g',
            category: 'Vegetables',
            price: 40,
            health_score: 95,
            description: 'Fresh leafy greens',
          },
          {
            id: '4',
            name: 'Chicken Breast 500g',
            category: 'Meat',
            price: 250,
            health_score: 88,
            description: 'Lean protein source',
          },
        ]);
        setIsSearching(false);
      }, 500);
    }
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCartMutation.mutateAsync({
        url: '/cart/add',
        data: {
          product_id: product.id,
          quantity: 1,
        },
      });
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            🛒 Browse Products
          </h1>
          <Link
            href="/cart"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            View Cart
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories?.data?.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price Range: ₹{priceRange.min} - ₹{priceRange.max}
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isSearching ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
              >
                {/* Product Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    {product.category}
                  </p>

                  {/* Health Score */}
                  <div className="mt-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${getHealthColor(
                        product.health_score
                      )}`}
                    >
                      ❤️ {product.health_score}/100
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-900">
                      ₹{product.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <p className="text-neutral-600">
              Start searching or select a category to see products
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ============================================
// Cart Page Component
// ============================================


interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export function CartPage() {
  const { user } = useProtectedRoute();
  const { data: cart } = useApi('/cart');
  const removeFromCartMutation = useApiMutation('DELETE');
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      product_id: '1',
      product_name: 'Organic Milk 1L',
      quantity: 2,
      price: 60,
      total: 120,
    },
    {
      id: '2',
      product_id: '2',
      product_name: 'Brown Rice 1kg',
      quantity: 1,
      price: 80,
      total: 80,
    },
  ]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCartMutation.mutateAsync({
        url: `/cart/${itemId}`,
      });
      setCartItems(cartItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-neutral-900">🛍️ Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-neutral-600 mb-4">Your cart is empty</p>
                <Link
                  href="/products"
                  className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900">
                        {item.product_name}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        ₹{item.price} per unit
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item.id, parseInt(e.target.value))
                        }
                        className="w-16 px-2 py-1 border border-neutral-300 rounded"
                      />
                      <span className="font-semibold text-neutral-900 w-24 text-right">
                        ₹{item.total}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-semibold">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery:</span>
                <span className="font-semibold">₹40</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax:</span>
                <span className="font-semibold">₹{Math.round(totalAmount * 0.05)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 text-lg">
              <span className="font-bold text-neutral-900">Total:</span>
              <span className="font-bold text-blue-600">
                ₹{totalAmount + 40 + Math.round(totalAmount * 0.05)}
              </span>
            </div>

            {/* Smart Insights */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-800 font-medium mb-2">
                💡 Smart Insight
              </p>
              <p className="text-xs text-blue-700">
                Adding brown rice could improve your health score by 15%
              </p>
            </div>

            <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
              Proceed to Checkout
            </button>

            <Link
              href="/products"
              className="block w-full mt-3 text-center py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
