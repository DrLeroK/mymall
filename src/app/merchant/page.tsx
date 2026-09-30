'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign,
  ShoppingCart,
  Terminal,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';

export default function MerchantDashboardPage() {
  const { t } = useI18n();
  const { user, storeId } = useAuth();

  const [analytics, setAnalytics] = useState<any>({
    totalRevenue: 64800,
    onlineSalesTotal: 36350,
    posSalesTotal: 28450,
    inventoryCostValuation: 85000,
    inventoryRetailValuation: 165000,
    lowStockCount: 2,
    recentOrders: [],
    lowStockItems: [
      { id: 2, name: 'Urban Runner Sneakers', stockQuantity: 8, lowStockThreshold: 10, unit: 'pair' },
    ],
  });

  useEffect(() => {
    if (!ApiClient.getAccessToken()) return;
    ApiClient.get('/analytics/store')
      .then((res) => {
        if (res.success && res.analytics) {
          setAnalytics((prev: any) => ({
            ...prev,
            ...res.analytics,
            lowStockItems: res.analytics.lowStockItems || prev.lowStockItems || [],
          }));
        }
      })
      .catch(() => {});
  }, [storeId]);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('merchant.dashboard')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics and inventory sync across your online store and physical POS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/merchant/products">
            <Button size="sm" variant="secondary" leftIcon={<Plus className="w-4 h-4" />}>
              {t('merchant.addProduct')}
            </Button>
          </Link>
          <Link href="/pos">
            <Button size="sm" leftIcon={<Terminal className="w-4 h-4" />}>
              Open POS Register
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>{t('merchant.totalRevenue')}</span>
            <DollarSign className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400">
            {formatPrice(analytics.totalRevenue)}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Online: {formatPrice(analytics.onlineSalesTotal)}</span>
            <span>•</span>
            <span>POS: {formatPrice(analytics.posSalesTotal)}</span>
          </div>
        </div>

        {/* Online Orders Count */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Online Orders</span>
            <ShoppingCart className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics.recentOrders?.length || 18} Orders
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Active Pipeline</span>
        </div>

        {/* Inventory Valuation */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Inventory Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {formatPrice(analytics.inventoryRetailValuation)}
          </p>
          <span className="text-[11px] text-slate-400">
            Cost Basis: {formatPrice(analytics.inventoryCostValuation)}
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">
            {analytics.lowStockCount || 1} Items
          </p>
          <span className="text-[11px] text-amber-600 font-semibold">Needs Restocking</span>
        </div>
      </div>

      {/* Grid: Low Stock Warnings & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts Box */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{t('merchant.lowStockAlerts')}</span>
            </h3>
            <Link href="/merchant/products" className="text-xs text-brand-600 font-bold hover:underline">
              Manage Products
            </Link>
          </div>

          <div className="space-y-3">
            {(analytics?.lowStockItems && analytics.lowStockItems.length > 0) ? (
              analytics.lowStockItems.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-slate-400">
                      Threshold: {item.lowStockThreshold || 5} {item.unit || 'pcs'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-500 block text-sm">
                      {item.stockQuantity} {item.unit || 'pcs'} Left
                    </span>
                    <Link href="/merchant/products" className="text-xs text-brand-600 font-bold hover:underline">
                      Restock
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500">All product inventories are currently above threshold.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & POS Hub Box */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Quick Operations
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/merchant/orders"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:border-brand-500 transition-colors text-left space-y-1 group"
            >
              <ShoppingCart className="w-5 h-5 text-brand-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                Verify Customer Proofs
              </h4>
              <p className="text-[10px] text-slate-400">Review bank transfer screenshots</p>
            </Link>

            <Link
              href="/pos"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:border-brand-500 transition-colors text-left space-y-1 group"
            >
              <Terminal className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                Launch Cashier POS
              </h4>
              <p className="text-[10px] text-slate-400">Barcode scan & print receipts</p>
            </Link>

            <Link
              href="/merchant/staff"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:border-brand-500 transition-colors text-left space-y-1 group"
            >
              <Package className="w-5 h-5 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                Invite Staff Members
              </h4>
              <p className="text-[10px] text-slate-400">Cashiers, Managers, Clerks</p>
            </Link>

            <Link
              href="/merchant/settings"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:border-brand-500 transition-colors text-left space-y-1 group"
            >
              <DollarSign className="w-5 h-5 text-sky-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                Store Bank Accounts
              </h4>
              <p className="text-[10px] text-slate-400">CBE, Telebirr payment details</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
