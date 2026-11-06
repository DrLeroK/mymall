'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import {
  ShieldCheck,
  LayoutDashboard,
  CheckSquare,
  Zap,
  CreditCard,
  ShieldAlert,
  Star,
  Lock,
  ArrowRight,
  MessageSquare,
  Banknote,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/common/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading } = useAuth();

  const navItems = [
    { label: t('admin.dashboard'), href: '/admin', icon: LayoutDashboard },
    { label: 'Subscription Incomes', href: '/admin/subscriptions', icon: Banknote },
    { label: 'Store Owners', href: '/admin/merchants', icon: Users },
    { label: t('admin.pendingVerifications'), href: '/admin/verifications', icon: CheckSquare },
    { label: 'Admin Chat & Support', href: '/admin/chat', icon: MessageSquare },
    { label: t('admin.plansManagement'), href: '/admin/plans', icon: Zap },
    { label: t('admin.platformBanks'), href: '/admin/bank-accounts', icon: CreditCard },
    { label: t('admin.disputesCenter'), href: '/admin/disputes', icon: ShieldAlert },
    { label: t('admin.reviewsModeration'), href: '/admin/reviews', icon: Star },
  ];

  // Route protection for Super Admin
  if (!isLoading && (!isAuthenticated || user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Super Admin Access Required
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This dashboard is restricted to platform operators. Please sign in with your Super Admin account to access platform governance and billing verifications.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full shadow-md font-bold">
                  Sign In as Super Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 flex">
      {/* Super Admin Sidebar */}
      <aside className="w-64 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col justify-between p-4 flex-shrink-0 shadow-sm">
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-800 dark:text-amber-300">
                Super Admin
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                Platform Governance
              </p>
            </div>
          </div>

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

        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
          <p className="font-bold text-slate-800 dark:text-slate-200">MyMall Platform Engine</p>
          <p className="text-[10px]">Multi-Tenant SaaS v1.0</p>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
      </div>
    </div>
  );
}
