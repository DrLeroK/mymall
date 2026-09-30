'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, role, staffRole } = useAuth();

  const navItems = [
    { label: 'Cashier POS Register', href: '/pos', icon: Terminal },
    { label: 'Drawer Reconciliation', href: '/pos/reconciliation', icon: CalendarCheck },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50 dark:bg-slate-950">
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
          {(role === 'STORE_OWNER' || role === 'SUPER_ADMIN') && (
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
  );
}
