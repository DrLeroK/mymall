'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';
import {
  Building2,
  ShieldCheck,
  Zap,
  Store,
  Truck,
  CreditCard,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>About MyMall Technologies</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Empowering Ethiopian Retail with Modern E-Commerce & POS
        </h1>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
          MyMall is a comprehensive multi-tenant SaaS platform connecting local retail shops, supermarkets, and boutique stores across Addis Ababa and nationwide with modern online storefronts, cashier POS registers, and instant digital payments.
        </p>
      </div>

      {/* Core Platform Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/30">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Instant Multi-Tenant Storefronts
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Every merchant receives a dedicated, branded storefront with multi-attribute product variants, custom delivery radius, and direct customer communication.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Ethiopian Digital Payments
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Full support for Telebirr, Commercial Bank of Ethiopia (CBE), bank transfer screenshot proof verification, and instant Chapa card payments.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            In-Store POS & Real-Time Sync
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            High-speed cashier POS registers with thermal receipt printing, daily cash drawer reconciliation, and live inventory sync with online sales.
          </p>
        </div>
      </div>

      {/* Platform Numbers / Stats */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-xl shadow-brand-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black">250+</p>
            <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">Active Stores</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black">15,000+</p>
            <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">Products Listed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black">99.9%</p>
            <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">POS Uptime</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black">3 Languages</p>
            <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">EN, AM, OM</p>
          </div>
        </div>
      </div>

      {/* Who Uses MyMall */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Built for Every Role in the Retail Ecosystem
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tailored interfaces designed specifically for platform admins, business owners, cashiers, and shoppers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Super Admins</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Govern platform SaaS metrics (GMV, MRR, ARR), manage subscription plans, verify bank payment proofs, and resolve buyer-seller disputes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Store Owners</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Manage product catalogs, variant attributes, bulk CSV imports, customer bank receipts, staff invitations, and store branding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Cashiers & Staff</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Operate high-speed POS registers, scan barcodes, tender cash/mobile payments, print receipts, and reconcile daily cash drawer shifts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Customers</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Discover stores across Addis Ababa, browse catalogs with price filters, order for doorstep delivery or pickup, and chat live with store staff.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center p-10 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
          Ready to Launch Your Store or Start Shopping?
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Join hundreds of retailers scaling their business online and in-store with MyMall.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/register">
            <Button size="lg" className="px-8 shadow-lg shadow-brand-500/25">
              Create an Account
            </Button>
          </Link>
          <Link href="/explore">
            <Button size="lg" variant="outline">
              Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
