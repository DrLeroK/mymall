'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Calculator,
  Search,
  RefreshCw,
  Edit2,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  AlertCircle,
  Coins,
} from 'lucide-react';

interface PricingVariant {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
}

interface PricingItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  categoryName: string;
  costPrice: number;
  sellingPrice: number;
  compareAtPrice: number | null;
  marginEtb: number;
  marginPercent: number;
  stockQuantity: number;
  inventoryCostValue: number;
  inventoryRetailValue: number;
  variants: PricingVariant[];
}

interface PricingSummary {
  totalProducts: number;
  totalStockCount: number;
  totalValuationAtCost: number;
  totalValuationAtRetail: number;
  potentialProfit: number;
}

export default function MerchantPricingPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [items, setItems] = useState<PricingItem[]>([]);
  const [summary, setSummary] = useState<PricingSummary | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Quick edit modal
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editSellingPrice, setEditSellingPrice] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    loadPricing();
  }, [storeId]);

  const loadPricing = () => {
    setIsLoading(true);
    ApiClient.get('/products/inventory-pricing')
      .then((res) => {
        if (res.success) {
          setItems(res.items || []);
          setSummary(res.summary || null);
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleOpenEdit = (item: PricingItem) => {
    setEditingItem(item);
    setEditCostPrice(item.costPrice.toString());
    setEditSellingPrice(item.sellingPrice.toString());
    setEditStockQuantity(item.stockQuantity.toString());
    setEditError(null);
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    setEditError(null);

    const costPrice = parseFloat(editCostPrice) || 0;
    const sellingPrice = parseFloat(editSellingPrice) || 0;
    const stockQuantity = parseFloat(editStockQuantity) || 0;

    try {
      const res = await ApiClient.patch(`/products/${editingItem.id}`, {
        costPrice,
        sellingPrice,
        stockQuantity,
      });

      if (res.success || res.product) {
        setEditingItem(null);
        loadPricing();
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to update price and inventory values.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-brand-500" />
            <span>Inventory Pricing & Margins</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track buying prices (COGS), selling prices, gross profit margins, and warehouse asset valuation.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={loadPricing}
        >
          Refresh Valuation
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Asset Value (At Cost)
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatPrice(summary.totalValuationAtCost)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Total invested capital in current stock
            </p>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Asset Value (Retail)
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {formatPrice(summary.totalValuationAtRetail)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Expected sales return on full inventory
            </p>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Potential Gross Profit
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              +{formatPrice(summary.potentialProfit)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Retail valuation minus cost basis
            </p>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                In-Stock Units
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.totalStockCount} units
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Across {summary.totalProducts} catalog products
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by product name, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <p className="text-xs text-slate-400 hidden sm:block">
          Showing {filteredItems.length} of {items.length} items
        </p>
      </div>

      {/* Pricing Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Product Item</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Buying Price (Cost)</th>
                <th className="px-6 py-3.5">Selling Price</th>
                <th className="px-6 py-3.5">Unit Margin</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Cost Valuation</th>
                <th className="px-6 py-3.5">Retail Valuation</th>
                <th className="px-6 py-3.5 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.sku || 'NO-SKU'}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.categoryName}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">
                      {formatPrice(item.costPrice)}
                    </td>

                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(item.sellingPrice)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatPrice(item.marginEtb)}
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-400">
                          {item.marginPercent}% margin
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${
                          item.stockQuantity <= 5
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.stockQuantity} pcs
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">
                      {formatPrice(item.inventoryCostValue)}
                    </td>

                    <td className="px-6 py-4 font-bold text-brand-600 dark:text-brand-400">
                      {formatPrice(item.inventoryRetailValue)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-500 transition-colors"
                        title="Quick edit pricing and stock"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Pricing Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Quick Edit Pricing & Stock"
        description={`Update buying price, selling price, and inventory for ${editingItem?.name}.`}
      >
        {editingItem && (
          <form onSubmit={handleSavePricing} className="space-y-4 pt-2">
            {editError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Buying Price / Cost (ETB)"
                type="number"
                step="any"
                value={editCostPrice}
                onChange={(e) => setEditCostPrice(e.target.value)}
                required
              />

              <Input
                label="Selling Price (ETB)"
                type="number"
                step="any"
                value={editSellingPrice}
                onChange={(e) => setEditSellingPrice(e.target.value)}
                required
              />
            </div>

            <Input
              label="Stock Quantity (in units)"
              type="number"
              step="any"
              value={editStockQuantity}
              onChange={(e) => setEditStockQuantity(e.target.value)}
              required
            />

            {/* Calculated Profit Margin Live Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Projected Margin:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {(() => {
                  const c = parseFloat(editCostPrice) || 0;
                  const s = parseFloat(editSellingPrice) || 0;
                  const m = s - c;
                  const pct = s > 0 ? ((m / s) * 100).toFixed(1) : '0.0';
                  return `+${formatPrice(m)} (${pct}%)`;
                })()}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isUpdating}>
                Save Pricing
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
