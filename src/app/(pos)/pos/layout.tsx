'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import {
  Terminal,
  Calculator,
  Store,
  ArrowLeft,
  ShoppingBag,
  Clock,
  Printer,
  CalendarCheck,
  Lock,
  Package,
  FolderTree,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/common/Navbar';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, role, staffRole, isAuthenticated, isLoading } = useAuth();

  // Strict route protection: Prevent accountants & unpermitted clerks from accessing POS
  React.useEffect(() => {
    if (isLoading) return;
    if (role === 'STORE_STAFF') {
      if (staffRole === 'ACCOUNTANT' && !user?.permissions?.includes('access_pos')) {
        router.replace('/merchant/accounting');
        return;
      }
      if (staffRole === 'INVENTORY_CLERK' && !user?.permissions?.includes('access_pos')) {
        router.replace('/merchant/products');
        return;
      }
    }
  }, [role, staffRole, user, isLoading, router]);

  // Route protection for POS: Only Store Owner, Super Admin, or authorized Store Staff
  if (!isLoading && (!isAuthenticated || (role !== 'STORE_OWNER' && role !== 'SUPER_ADMIN' && role !== 'STORE_STAFF'))) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              POS Cashier Access Required
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This terminal is restricted to authorized store cashiers, managers, and store owners.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full shadow-md font-bold">
                  Sign In with Cashier Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnerOrAdmin = role === 'STORE_OWNER' || role === 'SUPER_ADMIN';
  const perms = user?.permissions || [];
  const hasInventory = isOwnerOrAdmin || perms.includes('manage_inventory');
  const hasOrders = isOwnerOrAdmin || perms.includes('manage_orders');
  const hasReports = isOwnerOrAdmin || perms.includes('view_reports') || perms.includes('view_sales_reports');
  const hasPricing = isOwnerOrAdmin || perms.includes('manage_pricing');

  const navItems = [
    { label: 'Cashier POS Register', href: '/pos', icon: Terminal },
    { label: 'Drawer Reconciliation', href: '/pos/reconciliation', icon: CalendarCheck },
  ];

  if (hasInventory) {
    navItems.push({ label: 'Products & Stock', href: '/merchant/products', icon: Package });
    navItems.push({ label: 'Product Categories', href: '/merchant/categories', icon: FolderTree });
  }
  if (hasPricing && !hasInventory) {
    navItems.push({ label: 'Pricing & Cost', href: '/merchant/pricing', icon: Calculator });
  }
  if (hasOrders) {
    navItems.push({ label: 'Orders & Dispatch', href: '/merchant/orders', icon: ShoppingBag });
  }
  if (hasReports) {
    navItems.push({ label: 'Sales Reports', href: '/merchant/sales', icon: TrendingUp });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 flex">
      {/* Cashier Sidebar */}
      <aside className="w-64 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col justify-between p-4 flex-shrink-0 shadow-sm">
        <div className="space-y-6">
          {/* POS Pill */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                Cashier POS Desk
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                {user?.name || 'UrbanTrend Cashier'}
              </p>
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

        {/* Quick Return Links */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          {(isOwnerOrAdmin || hasInventory || hasOrders || hasReports || staffRole === 'MANAGER') && (
            <Link
              href="/merchant"
              className="flex items-center gap-2 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors"
            >
              <Store className="w-4 h-4 text-brand-500" />
              <span>Merchant Center</span>
            </Link>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-sky-500" />
            <span>Marketplace Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      </div>
    </div>
  );
}
