'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Store, Terminal, ShoppingBag, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success && res.user) {
      // Dynamic redirection to each role's dashboard
      const userRole = res.user.role;
      if (userRole === 'SUPER_ADMIN') {
        router.push('/admin');
      } else if (userRole === 'STORE_OWNER') {
        router.push('/merchant');
      } else if (userRole === 'STORE_STAFF') {
        router.push('/pos');
      } else {
        router.push('/customer');
      }
    } else {
      setError(res.message || 'Invalid email or password. Please verify credentials or seed the database.');
    }
    setIsLoading(false);
  };

  const handleSelectPreset = (roleKey: 'SUPER_ADMIN' | 'STORE_OWNER' | 'CASHIER' | 'CUSTOMER') => {
    setActivePreset(roleKey);
    if (roleKey === 'SUPER_ADMIN') {
      setEmail('admin@mymall.com');
      setPassword('admin123');
    } else if (roleKey === 'STORE_OWNER') {
      setEmail('owner@urbantrend.com');
      setPassword('owner123');
    } else if (roleKey === 'CASHIER') {
      setEmail('cashier@urbantrend.com');
      setPassword('cashier123');
    } else {
      setEmail('customer@example.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            M
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Sign in to access your store, POS register, or customer orders.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="text-slate-900 dark:text-slate-100 font-medium"
              required
            />

            <div className="space-y-1">
              <Input
                label={t('auth.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="text-slate-900 dark:text-slate-100 font-medium"
                required
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full shadow-lg shadow-brand-500/25 font-bold">
              {t('nav.login')}
            </Button>
          </form>

          {/* Seed Demo Credentials */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                <KeyRound className="w-3.5 h-3.5 text-brand-500" />
                <span>One-Click Seed Accounts</span>
              </span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">Click to prefill</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectPreset('SUPER_ADMIN')}
                className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                  activePreset === 'SUPER_ADMIN'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-amber-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span className="font-extrabold text-xs">Super Admin</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono truncate">
                  admin@mymall.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('STORE_OWNER')}
                className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                  activePreset === 'STORE_OWNER'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/30'
                    : 'border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-brand-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-brand-500" />
                  <span className="font-extrabold text-xs">Store Owner</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono truncate">
                  owner@urbantrend.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('CASHIER')}
                className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                  activePreset === 'CASHIER'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span className="font-extrabold text-xs">Cashier Staff</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono truncate">
                  cashier@urbantrend.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('CUSTOMER')}
                className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                  activePreset === 'CUSTOMER'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/30'
                    : 'border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-sky-500" />
                  <span className="font-extrabold text-xs">Customer</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono truncate">
                  customer@example.com
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>{t('auth.dontHaveAccount')} </span>
          <Link href="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
