'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { Store } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/common/Navbar';
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
  TrendingUp,
  Calculator,
  Bell,
  Receipt,
  FolderTree,
} from 'lucide-react';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, storeId, isAuthenticated, isLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);

  // Helper to dynamically calculate allowed route paths for any staff role + custom permissions
  const getAllowedStaffPaths = (roleName?: string | null, perms: string[] = []): string[] => {
    const allowed = new Set<string>(['/merchant/notifications']);

    if (roleName === 'MANAGER') {
      return [
        '/merchant',
        '/merchant/products',
        '/merchant/categories',
        '/merchant/orders',
        '/merchant/sales',
        '/merchant/pricing',
        '/merchant/chat',
        '/merchant/staff',
        '/merchant/notifications',
        '/pos',
        '/pos/reconciliation',
      ];
    }

    if (roleName === 'ACCOUNTANT') {
      allowed.add('/merchant/accounting');
    }

    if (roleName === 'INVENTORY_CLERK') {
      allowed.add('/merchant/products');
      allowed.add('/merchant/categories');
      allowed.add('/merchant/pricing');
    }

    if (roleName === 'CASHIER') {
      allowed.add('/pos');
      allowed.add('/pos/reconciliation');
    }

    // Dynamic custom permission overrides for ANY staff role:
    if (perms.includes('manage_inventory')) {
      allowed.add('/merchant/products');
      allowed.add('/merchant/categories');
      allowed.add('/merchant/pricing');
    }
    if (perms.includes('manage_orders')) {
      allowed.add('/merchant/orders');
    }
    if (perms.includes('view_reports') || perms.includes('view_sales_reports')) {
      allowed.add('/merchant/sales');
    }
    if (perms.includes('manage_pricing')) {
      allowed.add('/merchant/pricing');
    }
    if (perms.includes('access_pos')) {
      allowed.add('/pos');
      allowed.add('/pos/reconciliation');
    }
    if (perms.includes('manage_accounting')) {
      allowed.add('/merchant/accounting');
    }
    if (perms.includes('manage_staff')) {
      allowed.add('/merchant/staff');
    }
    if (perms.includes('manage_chat')) {
      allowed.add('/merchant/chat');
    }
    if (perms.includes('manage_settings')) {
      allowed.add('/merchant/settings');
    }

    return Array.from(allowed);
  };

  // Strict route protection across all roles and permissions
  useEffect(() => {
    if (isLoading || !user) return;

    if (user.role === 'STORE_STAFF') {
      const perms = user.permissions || [];
      const allowedPaths = getAllowedStaffPaths(user.staffRole, perms);

      // Managers cannot access billing
      if (user.staffRole === 'MANAGER' && pathname.startsWith('/merchant/billing')) {
        router.replace('/merchant');
        return;
      }

      // Non-manager staff are strictly blocked from the /merchant financial overview dashboard
      if (pathname === '/merchant' && user.staffRole !== 'MANAGER') {
        const dest = allowedPaths.includes('/merchant/products')
          ? '/merchant/products'
          : allowedPaths.find((p) => p !== '/merchant/notifications' && p !== '/merchant') || (user.staffRole === 'CASHIER' ? '/pos' : '/merchant/products');
        router.replace(dest);
        return;
      }

      const isAllowed = allowedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
      if (!isAllowed) {
        // Redirect to first primary destination
        const defaultDest = allowedPaths.includes('/merchant/products')
          ? '/merchant/products'
          : allowedPaths.find((p) => p !== '/merchant/notifications' && p !== '/merchant') || (user.staffRole === 'CASHIER' ? '/pos' : '/merchant/products');
        router.replace(defaultDest);
      }
    }
  }, [pathname, user, isLoading, router]);

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

  const isStaff = user?.role === 'STORE_STAFF';
  const staffRole = user?.staffRole;
  const permissions = user?.permissions || [];

  // Dedicated role-based navigation with custom permission overrides for ANY staff role
  const getNavItems = () => {
    if (isStaff) {
      if (staffRole === 'MANAGER') {
        return [
          { label: t('merchant.overview'), href: '/merchant', icon: LayoutDashboard },
          { label: t('merchant.products'), href: '/merchant/products', icon: Package },
          { label: 'Categories', href: '/merchant/categories', icon: FolderTree },
          { label: t('merchant.orders'), href: '/merchant/orders', icon: ShoppingCart },
          { label: 'Sales (Online & POS)', href: '/merchant/sales', icon: TrendingUp },
          { label: 'Inventory Cost & Pricing', href: '/merchant/pricing', icon: Calculator },
          { label: 'Chat & Support', href: '/merchant/chat', icon: MessageSquare },
          { label: t('pos.title'), href: '/pos', icon: Terminal },
          { label: t('merchant.staff'), href: '/merchant/staff', icon: Users },
          { label: 'Notifications', href: '/merchant/notifications', icon: Bell },
        ];
      }

      const allowedPaths = getAllowedStaffPaths(staffRole, permissions);
      const items: { label: string; href: string; icon: any }[] = [];

      if (allowedPaths.includes('/pos')) {
        items.push({ label: t('pos.title'), href: '/pos', icon: Terminal });
      }
      if (allowedPaths.includes('/merchant/products')) {
        items.push({ label: t('merchant.products'), href: '/merchant/products', icon: Package });
      }
      if (allowedPaths.includes('/merchant/categories')) {
        items.push({ label: 'Categories', href: '/merchant/categories', icon: FolderTree });
      }
      if (allowedPaths.includes('/merchant/pricing')) {
        items.push({ label: 'Inventory Cost & Pricing', href: '/merchant/pricing', icon: Calculator });
      }
      if (allowedPaths.includes('/merchant/orders')) {
        items.push({ label: t('merchant.orders'), href: '/merchant/orders', icon: ShoppingCart });
      }
      if (allowedPaths.includes('/merchant/sales')) {
        items.push({ label: 'Sales (Online & POS)', href: '/merchant/sales', icon: TrendingUp });
      }
      if (allowedPaths.includes('/merchant/accounting')) {
        items.push({ label: 'Accounting & Ledger', href: '/merchant/accounting', icon: Receipt });
      }
      if (allowedPaths.includes('/merchant/chat')) {
        items.push({ label: 'Chat & Support', href: '/merchant/chat', icon: MessageSquare });
      }
      if (allowedPaths.includes('/merchant/staff')) {
        items.push({ label: t('merchant.staff'), href: '/merchant/staff', icon: Users });
      }
      if (allowedPaths.includes('/merchant/settings')) {
        items.push({ label: 'Store Settings', href: '/merchant/settings', icon: Settings });
      }

      items.push({ label: 'Notifications', href: '/merchant/notifications', icon: Bell });
      return items;
    }

    // Default for STORE_OWNER or SUPER_ADMIN (unrestricted access)
    return [
      { label: t('merchant.overview'), href: '/merchant', icon: LayoutDashboard },
      { label: 'Store Profile & Setup', href: '/merchant/onboard', icon: Sparkles },
      { label: t('merchant.products'), href: '/merchant/products', icon: Package },
      { label: 'Categories', href: '/merchant/categories', icon: FolderTree },
      { label: 'Sales (Online & POS)', href: '/merchant/sales', icon: TrendingUp },
      { label: 'Inventory Cost & Pricing', href: '/merchant/pricing', icon: Calculator },
      { label: 'Accounting & Ledger', href: '/merchant/accounting', icon: Receipt },
      { label: t('merchant.orders'), href: '/merchant/orders', icon: ShoppingCart },
      { label: 'Chat & Support', href: '/merchant/chat', icon: MessageSquare },
      { label: t('pos.title'), href: '/pos', icon: Terminal },
      { label: t('merchant.staff'), href: '/merchant/staff', icon: Users },
      { label: t('merchant.billing'), href: '/merchant/billing', icon: CreditCard },
      { label: 'Notifications', href: '/merchant/notifications', icon: Bell },
      { label: t('merchant.settings'), href: '/merchant/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  // Route protection for Store Owner and Staff Members
  if (!isLoading && (!isAuthenticated || (user?.role !== 'STORE_OWNER' && user?.role !== 'SUPER_ADMIN' && user?.role !== 'STORE_STAFF'))) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Merchant Access Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This dashboard is dedicated to store merchants and staff members. Please sign in with your authorized account to manage your catalog, orders, accounting ledger, and POS terminal.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full shadow-md font-bold">
                Sign In to Merchant Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 flex">
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
            <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span>My Role</span>
              <span className="text-brand-600 dark:text-brand-400 uppercase tracking-wider font-extrabold text-[10px]">
                {user?.role === 'STORE_STAFF' && user?.staffRole
                  ? user.staffRole.replace('_', ' ')
                  : (user?.role?.replace('_', ' ') || 'MERCHANT')}
              </span>
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
    </div>
  );
}
