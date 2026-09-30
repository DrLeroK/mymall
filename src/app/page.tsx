'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Product, Store, SubscriptionPlan } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Store as StoreIcon,
  ShoppingBag,
  TrendingUp,
  Star,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock initial data if backend is waiting for seed/startup
const fallbackStores: Store[] = [
  {
    id: 1,
    name: 'UrbanTrend Fashion',
    slug: 'urbantrend',
    tagline: 'Modern Apparel & Streetwear',
    description: 'Curated contemporary streetwear, footwear, and accessories in Addis Ababa.',
    category: 'Fashion & Apparel',
    logoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    currency: 'ETB',
    taxRate: 15.0,
    primaryColor: '#2563eb',
    hideOutOfStock: false,
    status: 'ACTIVE',
    ownerId: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Habesha Tech Hub',
    slug: 'habesha-tech',
    tagline: 'Smartphones, Audio & Gadgets',
    description: 'Official electronics, accessories, laptops, and original gadgets.',
    category: 'Electronics',
    logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    currency: 'ETB',
    taxRate: 15.0,
    primaryColor: '#0e7490',
    hideOutOfStock: false,
    status: 'ACTIVE',
    ownerId: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const fallbackProducts: Product[] = [
  {
    id: 1,
    storeId: 1,
    name: 'Oversized Vintage Hoodie',
    slug: 'oversized-vintage-hoodie',
    costPrice: 650,
    sellingPrice: 1850,
    compareAtPrice: 2200,
    stockQuantity: 45,
    lowStockThreshold: 10,
    unit: 'pcs',
    images: JSON.stringify(['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80']),
    isActive: true,
    hasVariants: true,
    store: fallbackStores[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    storeId: 1,
    name: 'Urban Runner Sneakers',
    slug: 'urban-runner-sneakers',
    costPrice: 1200,
    sellingPrice: 3200,
    compareAtPrice: 3800,
    stockQuantity: 8,
    lowStockThreshold: 10,
    unit: 'pair',
    images: JSON.stringify(['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80']),
    isActive: true,
    hasVariants: false,
    store: fallbackStores[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    storeId: 1,
    name: 'Classic Graphic Tee',
    slug: 'classic-graphic-tee',
    costPrice: 400,
    sellingPrice: 950,
    stockQuantity: 120,
    lowStockThreshold: 15,
    unit: 'pcs',
    images: JSON.stringify(['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80']),
    isActive: true,
    hasVariants: false,
    store: fallbackStores[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    storeId: 2,
    name: 'Noise-Canceling Wireless Earbuds',
    slug: 'wireless-earbuds-pro',
    costPrice: 1500,
    sellingPrice: 3400,
    compareAtPrice: 4000,
    stockQuantity: 24,
    lowStockThreshold: 5,
    unit: 'pcs',
    images: JSON.stringify(['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80']),
    isActive: true,
    hasVariants: false,
    store: fallbackStores[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [stores, setStores] = useState<Store[]>(fallbackStores);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  useEffect(() => {
    // Attempt live fetch from backend
    ApiClient.get('/storefront/search/all')
      .then((res) => {
        if (res.success) {
          if (res.stores && res.stores.length > 0) setStores(res.stores);
          if (res.products && res.products.length > 0) setProducts(res.products);
        }
      })
      .catch(() => {});

    ApiClient.get('/billing/plans')
      .then((res) => {
        if (res.success && res.plans) {
          setPlans(res.plans);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,116,144,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,116,144,0.25),rgba(9,14,23,0))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/25 animate-in fade-in slide-in-from-top-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            The Modern Commerce Engine for{' '}
            <span className="text-brand-500 underline decoration-brand-500/30 decoration-wavy underline-offset-8">
              Addis Ababa & Beyond
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {t('hero.subtitle')}
          </p>

          {/* Prominent Hero Search Bar */}
          <div className="max-w-2xl mx-auto w-full pt-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (heroSearchQuery.trim()) {
                  router.push(`/explore?q=${encodeURIComponent(heroSearchQuery.trim())}`);
                }
              }}
              className="relative flex items-center shadow-xl rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-700/80 p-1.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
              <input
                type="text"
                value={heroSearchQuery}
                onChange={(e) => setHeroSearchQuery(e.target.value)}
                placeholder="Search products, brands, stores, electronics..."
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium"
              />
              <Button
                type="submit"
                size="md"
                className="flex-shrink-0 rounded-xl font-bold shadow-md shadow-brand-500/25"
              >
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Trending:</span>
              {['Sneakers', 'Hoodies', 'Electronics', 'Perfumery', 'Watches'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => router.push(`/explore?q=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium border border-slate-200/80 dark:border-slate-700/70"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/explore">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t('hero.browseStores')}
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg" leftIcon={<StoreIcon className="w-4 h-4 text-brand-500" />}>
                {t('hero.openStore')}
              </Button>
            </Link>
          </div>

          {/* Key Platform Stats */}
          <div className="pt-10 grid grid-cols-3 max-w-xl mx-auto border-t border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">250+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('hero.statsStores')}</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-brand-500">12,000+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('hero.statsProducts')}</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-500">99.8%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Uptime & Sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <StoreIcon className="w-4 h-4" />
              <span>Independent Merchants</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('hero.featuredStores')}
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/store/${store.slug}`}
              className="group relative rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
            >
              <div className="h-44 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={store.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <img
                    src={store.logoUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80'}
                    alt={store.name}
                    className="w-14 h-14 rounded-2xl border-2 border-white object-cover shadow-md"
                  />
                  <div>
                    <h3 className="text-lg font-black text-white leading-tight">{store.name}</h3>
                    <p className="text-xs text-white/80">{store.tagline || store.category}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-sm">
                  {store.description}
                </p>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 flex-shrink-0">
                  {t('hero.viewStore')} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Catalog Showcase</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('hero.trendingProducts')}
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SaaS Pricing Plans Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Monetization Core</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transparent SaaS Plans for Store Owners
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose your billing cycle, transfer via CBE or Telebirr with screenshot verification, or pay directly via Chapa.
          </p>

          {/* Monthly / Yearly Switch */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Yearly Billing (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(plans.length > 0
            ? plans
            : [
                {
                  id: 1,
                  name: 'Starter',
                  monthlyPrice: 29.99,
                  yearlyPrice: 299.99,
                  maxProducts: 50,
                  maxStaff: 2,
                  badge: 'Small Retail',
                  features: ['Up to 50 Products', '2 Staff / Cashier Accounts', 'Basic Store Analytics', 'POS Terminal & Receipt Printing'],
                },
                {
                  id: 2,
                  name: 'Professional',
                  monthlyPrice: 79.99,
                  yearlyPrice: 799.99,
                  maxProducts: 500,
                  maxStaff: 10,
                  badge: 'Growing Brands',
                  isPopular: true,
                  features: ['5x Marketplace Search Rank Boost', 'Up to 500 Products & Variants', '10 Staff / Cashier Accounts', 'Custom Domain Support', 'Advanced Revenue & Inventory Analytics'],
                },
                {
                  id: 3,
                  name: 'Enterprise',
                  monthlyPrice: 199.99,
                  yearlyPrice: 1999.99,
                  maxProducts: 10000,
                  maxStaff: 50,
                  badge: 'High Volume Chain',
                  features: ['10x Top Tier Marketplace Boost', 'Up to 10,000 Products', '50 Cashiers & Staff Seats', 'Dedicated Account Manager'],
                },
              ]
          ).map((p: any) => {
            const isHighlighted = p.name?.toLowerCase().includes('pro') || p.isPopular;
            const price = billingPeriod === 'monthly'
              ? formatPrice(p.monthlyPrice)
              : formatPrice(p.yearlyPrice || Number(p.monthlyPrice) * 10);

            // Parse features
            let featureList: string[] = [];
            if (Array.isArray(p.features)) {
              featureList = p.features;
            } else if (typeof p.features === 'string') {
              try {
                featureList = JSON.parse(p.features);
              } catch {
                featureList = [p.features];
              }
            } else {
              featureList = [
                `Up to ${p.maxProducts ?? 'Unlimited'} Products`,
                `${p.maxStaff ?? 5} Staff / Cashier Seats`,
                p.hasCustomDomain ? 'Custom Domain Support' : 'MyMall Subdomain',
                p.hasAdvancedAnalytics ? 'Advanced Analytics & POS Sync' : 'Standard Analytics',
              ];
            }

            return (
              <div
                key={p.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  isHighlighted
                    ? 'border-2 border-brand-500 bg-white dark:bg-slate-900 shadow-xl scale-105 z-10'
                    : 'border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isHighlighted ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'
                    }`}
                  >
                    {p.name}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {p.badge || (p.name === 'Starter' ? 'Small Retail' : p.name === 'Enterprise' ? 'High Volume Chain' : 'Growing Brands')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {p.description ||
                      (isHighlighted
                        ? 'High marketplace search ranking boost, POS integration & advanced analytics.'
                        : 'Complete toolkit to manage retail inventory and sales.')}
                  </p>

                  <div className="mt-6">
                    <span
                      className={`text-3xl font-black ${
                        isHighlighted ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {price}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    {featureList.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/register" className="mt-8 block">
                  <Button variant={isHighlighted ? 'primary' : 'secondary'} className="w-full">
                    {isHighlighted ? 'Upgrade to Pro' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Customer Feedback & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('hero.customerFeedback')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              &quot;MyMall has revolutionized how I shop across Addis Ababa stores. Uploading my CBE transfer screenshot was verified within 15 minutes, and delivery arrived right at my gate!&quot;
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 dark:text-white">Abebe Kebede</span>
              <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" /> {t('hero.verifiedBuyer')}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              &quot;As a boutique store owner in Bole Medhanialem, having physical POS sales directly decrement our online marketplace inventory in real time has saved us countless overselling headaches!&quot;
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 dark:text-white">Elena Vance (UrbanTrend)</span>
              <span className="text-brand-600 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Store Owner
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
