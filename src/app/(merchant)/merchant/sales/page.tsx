'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  Globe,
  Store,
  Search,
  Calendar,
  Eye,
  FileText,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  RefreshCw,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface SaleItem {
  name: string;
  variantName?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface SaleRecord {
  id: string;
  rawId: number;
  channel: 'ONLINE' | 'OFFLINE';
  referenceNumber: string;
  customerName: string;
  customerPhone?: string;
  cashierName?: string;
  amount: number;
  costAmount: number;
  netProfit: number;
  paymentMethod: string;
  status: string;
  itemCount: number;
  createdAt: string;
  items: SaleItem[];
}

interface SalesSummary {
  totalRevenue: number;
  totalOnlineRevenue: number;
  totalOfflineRevenue: number;
  totalProfit: number;
  totalOrdersCount: number;
  onlineOrdersCount: number;
  offlineSalesCount: number;
}

export default function MerchantSalesPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [search, setSearch] = useState('');
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);

  useEffect(() => {
    loadSales();
  }, [storeId, selectedChannel]);

  const loadSales = () => {
    setIsLoading(true);
    let url = '/orders/reports/sales?';
    if (selectedChannel !== 'ALL') {
      url += `channel=${selectedChannel}&`;
    }
    if (search) {
      url += `search=${encodeURIComponent(search)}&`;
    }

    ApiClient.get(url)
      .then((res) => {
        if (res.success) {
          setSales(res.sales || []);
          setSummary(res.summary || null);
        } else {
          setSales([]);
        }
      })
      .catch(() => {
        setSales([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSales();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-brand-500" />
            <span>Sales & Revenue Breakdown</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive audit of Online Marketplace Orders vs In-Store POS Terminal Sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadSales}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Combined Revenue */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Gross Sales
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatPrice(summary.totalRevenue)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              {summary.totalOrdersCount} combined transactions
            </p>
          </div>

          {/* Online Marketplace Sales */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Online Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {formatPrice(summary.totalOnlineRevenue)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              {summary.onlineOrdersCount} deliveries & store pickups
            </p>
          </div>

          {/* POS Terminal Sales */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                In-Store POS Sales
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice(summary.totalOfflineRevenue)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              {summary.offlineSalesCount} cashier register checkouts
            </p>
          </div>

          {/* Gross Margin / Profit */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gross Profit
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatPrice(summary.totalProfit)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Sales minus item cost (COGS)
            </p>
          </div>
        </div>
      )}

      {/* Filter and Channel Switcher Bar */}
      <div className="p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Channel Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setSelectedChannel('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              selectedChannel === 'ALL'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setSelectedChannel('ONLINE')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              selectedChannel === 'ONLINE'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Online Orders</span>
          </button>
          <button
            onClick={() => setSelectedChannel('OFFLINE')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              selectedChannel === 'OFFLINE'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>POS Register</span>
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt #, customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </form>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Sales Activity Records ({sales.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Reference #</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Customer / Cashier</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Gross Revenue</th>
                <th className="px-6 py-3.5">Est. Profit</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5 text-right">Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No sales transactions found for this filter.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {s.referenceNumber}
                    </td>

                    <td className="px-6 py-4">
                      {s.channel === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                          <Globe className="w-3 h-3" />
                          ONLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <Store className="w-3 h-3" />
                          POS
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {s.customerName}
                      </p>
                      {s.cashierName && (
                        <p className="text-[10px] text-slate-400">
                          Cashier: {s.cashierName}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s.paymentMethod}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      {s.itemCount} items
                    </td>

                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(s.amount)}
                    </td>

                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatPrice(s.netProfit)}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(s.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setViewingSale(s)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-500 transition-colors"
                        title="View itemized breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Item Breakdown Modal */}
      <Modal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        title="Transaction Line Items"
        description={`Itemized items for ${viewingSale?.channel === 'ONLINE' ? 'Online Order' : 'POS Receipt'} ${viewingSale?.referenceNumber}`}
      >
        {viewingSale && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-400">Customer</p>
                <p className="font-bold text-slate-900 dark:text-white">{viewingSale.customerName}</p>
              </div>
              <div>
                <p className="text-slate-400">Channel</p>
                <p className="font-bold text-brand-600 dark:text-brand-400">{viewingSale.channel}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Total Charged</p>
                <p className="font-black text-slate-900 dark:text-white text-sm">{formatPrice(viewingSale.amount)}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 font-bold text-slate-500 flex justify-between">
                <span>Product Item</span>
                <span>Qty &times; Price</span>
                <span>Subtotal</span>
              </div>
              {viewingSale.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                    {item.variantName && (
                      <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                        Variant: {item.variantName}
                      </p>
                    )}
                  </div>
                  <div className="text-slate-500">
                    {item.quantity} &times; {formatPrice(item.price)}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-500">Estimated Transaction Profit:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                +{formatPrice(viewingSale.netProfit)}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingSale(null)}
              className="w-full mt-2"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
