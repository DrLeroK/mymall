'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { Store } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Terminal,
  Users,
  CreditCard,
  Settings,
  ExternalLink,
  Store as StoreIcon,
  Sparkles,
  Lock,
  MessageSquare,
} from 'lucide-react';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, storeId, isAuthenticated, isLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    if (!ApiClient.getAccessToken()) return;
    ApiClient.get('/stores/me')
      .then((res) => {
        if (res.success && res.store) {
          setStore(res.store);
        }
      })
      .catch(() => {});
  }, [storeId]);

  const navItems = [
    { label: t('merchant.overview'), href: '/merchant', icon: LayoutDashboard },
    { label: 'Store Onboarding Wizard', href: '/merchant/onboard', icon: Sparkles },
    { label: t('merchant.products'), href: '/merchant/products', icon: Package },
    { label: t('merchant.orders'), href: '/merchant/orders', icon: ShoppingCart },
    { label: 'Chat & Support', href: '/merchant/chat', icon: MessageSquare },
    { label: t('pos.title'), href: '/pos', icon: Terminal },
    { label: t('merchant.staff'), href: '/merchant/staff', icon: Users },
    { label: t('merchant.billing'), href: '/merchant/billing', icon: CreditCard },
    { label: t('merchant.settings'), href: '/merchant/settings', icon: Settings },
  ];

  // Route protection for Store Owner
  if (!isLoading && (!isAuthenticated || (user?.role !== 'STORE_OWNER' && user?.role !== 'SUPER_ADMIN'))) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Store Owner Access Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This dashboard is dedicated to store merchants and staff managers. Please sign in with your Store Owner account to manage your catalog, orders, and POS terminal.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full shadow-md font-bold">
                Sign In as Store Owner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col justify-between p-4 flex-shrink-0 shadow-sm">
        <div className="space-y-6">
          {/* Store Info Pill */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 space-y-2 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                {store?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {store?.name || 'UrbanTrend Fashion'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                  /{store?.slug || 'urbantrend'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Badge variant="success" size="sm">
                Active Store
              </Badge>
              <Link
                href={`/store/${store?.slug || 'urbantrend'}`}
                target="_blank"
                className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Plan Expiry / Upgrade prompt */}
        <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-brand-800 dark:text-brand-300">Professional Plan</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold">Active</span>
          </div>
          <Link href="/merchant/billing" className="block">
            <button className="w-full py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-colors">
              Manage SaaS Tier
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Merchant Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
