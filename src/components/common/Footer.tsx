'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';
import { ShieldCheck, Sparkles, CreditCard, Truck, Star } from 'lucide-react';
import { PlatformReviewModal } from './PlatformReviewModal';

export function Footer() {
  const { t } = useI18n();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors mt-20">
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-100 dark:border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Bank Screenshot Proof
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified CBE, Telebirr & BoA transfers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Chapa Direct Gateway
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct merchant instant payout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Doorstep & Store Pickup
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accurate Addis Ababa GPS delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Unified POS Stock Sync
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time online & physical inventory
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-black text-base">
                M
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                MyMall<span className="text-brand-500">.</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Multi-tenant e-commerce platform engine empowering stores across Ethiopia with store onboarding, subscription billing, real-time inventory, POS integration, and payment verification.
            </p>
          </div>

          {/* Shoppers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              For Shoppers
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li>
                <Link href="/explore" className="hover:text-brand-600 transition-colors">
                  Explore Stores
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-brand-600 transition-colors">
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-brand-600 transition-colors">
                  Delivery Addresses
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-brand-600 transition-colors">
                  Support & Disputes
                </Link>
              </li>
            </ul>
          </div>

          {/* Merchants */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              For Merchants
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li>
                <Link href="/register" className="hover:text-brand-600 transition-colors">
                  Open a Store
                </Link>
              </li>
              <li>
                <Link href="/merchant" className="hover:text-brand-600 transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pos" className="hover:text-brand-600 transition-colors">
                  Cashier POS Terminal
                </Link>
              </li>
              <li>
                <Link href="/merchant/billing" className="hover:text-brand-600 transition-colors">
                  Pricing Plans & Billing
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Company & Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li>
                <Link href="/about" className="hover:text-brand-600 transition-colors">
                  About MyMall
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-600 transition-colors">
                  Platform Admin
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-bold hover:underline"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Platform Reviews & Rating</span>
                </button>
              </li>
              <li>
                <span className="text-[11px] text-slate-400">
                  Built with OKLCH (52% 0.105 223.128)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MyMall Platform. All rights reserved.</p>
        </div>
      </div>

      <PlatformReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </footer>
  );
}
