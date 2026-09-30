'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag,
  Package,
  User,
  MapPin,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Lock,
  Store,
} from 'lucide-react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading } = useAuth();

  const navItems = [
    { label: 'Orders & Tracking', href: '/customer', icon: Package },
    { label: 'My Chats & Support', href: '/customer/chat', icon: MessageSquare },
    { label: 'Profile & Addresses', href: '/customer?tab=profile', icon: User },
    { label: 'Disputes & Claims', href: '/customer?tab=disputes', icon: ShieldAlert },
    { label: 'Explore Marketplace', href: '/explore', icon: Store },
  ];

  // Route protection for Customer portal
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Customer Sign-In Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Please sign in to track your orders, chat with store owners, and manage your delivery addresses.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full shadow-md font-bold">
                Sign In to Customer Account
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
          {/* User Profile Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 space-y-2 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-base flex-shrink-0 shadow-sm">
                {user?.name?.[0] || 'C'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {user?.name || 'Customer'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Account Type</span>
              <span className="text-sky-600 dark:text-sky-400 uppercase tracking-wider font-extrabold">
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href.includes('?') && pathname === '/customer');
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom CTA: Upgrade to Store Owner */}
        <div className="p-3.5 rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/30 space-y-2 text-xs">
          <p className="font-bold text-brand-900 dark:text-brand-200">Want to sell online?</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Open your verified store and POS terminal on MyMall today.
          </p>
          <Link href="/merchant/onboard" className="block pt-1">
            <Button size="sm" className="w-full text-xs font-bold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Store
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
