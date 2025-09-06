"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiAlertTriangle, FiTrendingUp, FiTrendingDown, FiSearch, FiFilter, FiDownload, FiPlus, FiEye, FiEdit, FiDollarSign, FiGrid } from 'react-icons/fi';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock inventory data - replace with real data from your backend
  const inventory = [
    {
      id: 'INV-001',
      name: 'Apple iPhone 15 Pro',
      sku: 'IPH15PRO-256-BLK',
      category: 'Electronics',
      currentStock: 45,
      minStock: 10,
      maxStock: 100,
      unitCost: 899.99,
      totalValue: 40499.55,
      status: 'In Stock',
      lowStock: 10,
      outOfStock: 0,
      lastUpdated: '2024-01-25',
      supplier: 'Apple Inc.',
      location: 'Warehouse A'
    },
    {
      id: 'INV-002',
      name: 'Nike Air Max 270',
      sku: 'NIKE-AM270-42-BLK',
      category: 'Fashion',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unitCost: 129.99,
      totalValue: 1039.92,
      status: 'Low Stock',
      lowStock: 10,
      outOfStock: 0,
      lastUpdated: '2024-01-24',
      supplier: 'Nike Inc.',
      location: 'Warehouse B'
    },
    {
      id: 'INV-003',
      name: 'Sony WH-1000XM5 Headphones',
      sku: 'SONY-WH1000XM5-BLK',
      category: 'Electronics',
      currentStock: 0,
      minStock: 5,
      maxStock: 25,
      unitCost: 399.99,
      totalValue: 0,
      status: 'Out of Stock',
      lowStock: 10,
      outOfStock: 0,
      lastUpdated: '2024-01-23',
      supplier: 'Sony Corporation',
      location: 'Warehouse A'
    },
    {
      id: 'INV-004',
      name: 'Levi\'s 501 Jeans',
      sku: 'LEVIS-501-32-34-BLU',
      category: 'Fashion',
      currentStock: 67,
      minStock: 20,
      maxStock: 80,
      unitCost: 89.99,
      totalValue: 6029.33,
      status: 'In Stock',
      lowStock: 10,
      outOfStock: 0,
      lastUpdated: '2024-01-25',
      supplier: 'Levi Strauss & Co.',
      location: 'Warehouse B'
    },
    {
      id: 'INV-005',
      name: 'MacBook Pro 16"',
      sku: 'MACBOOK-PRO-16-512-SLV',
      category: 'Electronics',
      currentStock: 12,
      minStock: 8,
      maxStock: 30,
      unitCost: 24.99,
      totalValue: 299.88,
      status: 'In Stock',
      lowStock: 10,
      outOfStock: 0,
      lastUpdated: '2024-01-25',
      supplier: 'Apple Inc.',
      location: 'Warehouse A'
    }
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && item.status === 'Low Stock') ||
                        (stockFilter === 'out' && item.status === 'Out of Stock') ||
                        (stockFilter === 'in' && item.status === 'In Stock');
    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStock && matchesCategory;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stock':
        return a.currentStock - b.currentStock;
      case 'value':
        return b.totalValue - a.totalValue;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const stats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockItems: inventory.filter(item => item.status === 'Low Stock').length,
    outOfStockItems: inventory.filter(item => item.status === 'Out of Stock').length,
    categories: [...new Set(inventory.map(item => item.category))].length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
3          <h1 className="text-2xl font-bold text-light-text-primary dark:text-neutral-200">Inventory Management</h1>
          <p className="text-light-text-secondary dark:text-neutral-400">Monitor and manage your product inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-light-bg-tertiary dark:bg-neutral-800 text-light-text-secondary dark:text-neutral-300 rounded-lg hover:bg-light-interactive-hover dark:hover:bg-neutral-700 transition-colors">
            <FiDownload className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link href="/admin/inventory/add" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <FiPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-light-surface-elevated dark:bg-neutral-800 p-4 rounded-lg shadow-light-soft border border-light-border-subtle dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-light-text-secondary dark:text-neutral-400">Total Items</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-neutral-200">{stats.totalItems}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiPackage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface-elevated dark:bg-neutral-800 p-4 rounded-lg shadow-light-soft border border-light-border-subtle dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-light-text-secondary dark:text-neutral-400">Total Value</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-neutral-200">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiDollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface-elevated dark:bg-neutral-800 p-4 rounded-lg shadow-light-soft border border-light-border-subtle dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-light-text-secondary dark:text-neutral-400">Low Stock</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-neutral-200">{stats.lowStockItems}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <FiAlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface-elevated dark:bg-neutral-800 p-4 rounded-lg shadow-light-soft border border-light-border-subtle dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-light-text-secondary dark:text-neutral-400">Out of Stock</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-neutral-200">{stats.outOfStockItems}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <FiTrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface-elevated dark:bg-neutral-800 p-4 rounded-lg shadow-light-soft border border-light-border-subtle dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-light-text-secondary dark:text-neutral-400">Categories</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-neutral-200">{stats.categories}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FiGrid className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-light-surface-elevated dark:bg-neutral-800 p-4 rounded-lg shadow-light-soft border border-light-border-subtle dark:border-neutral-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted dark:text-neutral-400" />
              <input
                type="text"
                placeholder="Search inventory by name, SKU, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-light-surface-primary dark:bg-neutral-800 text-light-text-primary dark:text-neutral-200 placeholder-light-text-muted dark:placeholder-neutral-400"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-light-surface-primary dark:bg-neutral-800 text-light-text-primary dark:text-neutral-200"
            >
              <option value="all">All Stock Levels</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-light-surface-primary dark:bg-neutral-800 text-light-text-primary dark:text-neutral-200"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Garden</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-light-surface-primary dark:bg-neutral-800 text-light-text-primary dark:text-neutral-200"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="value">Sort by Value</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-light-surface-elevated dark:bg-neutral-800 rounded-lg shadow-light-soft border border-light-border-subtle dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-bg-tertiary dark:bg-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-neutral-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-neutral-400 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-neutral-400 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-neutral-400 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border-subtle dark:divide-neutral-700">
              {sortedInventory.map((item) => (
                <tr key={item.id} className="hover:bg-light-interactive-hover dark:hover:bg-neutral-700 transition-colors">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-light-text-primary dark:text-neutral-200">{item.name}</div>
                      <div className="text-sm text-light-text-secondary dark:text-neutral-400">{item.sku}</div>
                      <div className="text-sm text-light-text-secondary dark:text-neutral-400">{item.category}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-light-text-primary dark:text-neutral-200">{item.currentStock} units</div>
                      <div className="text-sm text-light-text-secondary dark:text-neutral-400">Min: {item.minStock} | Max: {item.maxStock}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-light-text-primary dark:text-neutral-200">{formatCurrency(item.totalValue)}</div>
                      <div className="text-sm text-light-text-secondary dark:text-neutral-400">{formatCurrency(item.unitCost)}/unit</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-light-text-primary dark:text-neutral-200">{item.location}</div>
                      <div className="text-sm text-light-text-secondary dark:text-neutral-400">{item.supplier}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/inventory/${item.id}`} className="text-primary hover:text-primary/80 transition-colors">
                        <FiEye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/inventory/${item.id}/edit`} className="text-light-text-secondary dark:text-neutral-400 hover:text-light-text-primary dark:hover:text-neutral-200 transition-colors">
                        <FiEdit className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
