'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useI18n } from '@/context/I18nContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import {
  ShoppingBag,
  Store,
  Terminal,
  ShieldCheck,
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  HelpCircle,
  Info,
  Star,
  CheckCircle2,
  CreditCard,
  Package,
  TrendingUp,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, staffRole, storeId, isAuthenticated, logout, switchActiveStore } = useAuth();
  const { itemCount } = useCart();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [isSwitchingStore, setIsSwitchingStore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navLinks: { href: string; label: string; icon?: any }[] = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: t('nav.explore') || 'Explore Stores' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Determine user's specific dashboard URL and title
  const getDashboardDetails = () => {
    if (role === 'SUPER_ADMIN') {
      return { href: '/admin', title: 'Admin Console', icon: ShieldCheck, color: 'text-amber-600 bg-amber-500/10 border-amber-500/30' };
    }
    if (role === 'STORE_OWNER') {
      return { href: '/merchant', title: 'Merchant Center', icon: Store, color: 'text-brand-600 bg-brand-500/10 border-brand-500/30' };
    }
    if (role === 'STORE_STAFF') {
      const perms = user?.permissions || [];
      if (staffRole === 'MANAGER') {
        return { href: '/merchant', title: 'Management Hub', icon: Store, color: 'text-brand-600 bg-brand-500/10 border-brand-500/30' };
      }
      if (perms.includes('manage_inventory') || staffRole === 'INVENTORY_CLERK') {
        return { href: '/merchant/products', title: 'Inventory & Stock', icon: Package, color: 'text-brand-600 bg-brand-500/10 border-brand-500/30' };
      }
      if (staffRole === 'ACCOUNTANT' && !perms.includes('access_pos')) {
        return { href: '/merchant/accounting', title: 'Accounting Desk', icon: CreditCard, color: 'text-violet-600 bg-violet-500/10 border-violet-500/30' };
      }
      return { href: '/pos', title: 'POS Register', icon: Terminal, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' };
    }
    return { href: '/customer', title: 'My Account', icon: User, color: 'text-sky-600 bg-sky-500/10 border-sky-500/30' };
  };

  const dashboard = getDashboardDetails();
  const DashboardIcon = dashboard.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                MyMall<span className="text-brand-500">.</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                SaaS & POS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-bold">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    active
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black shadow-sm ring-1 ring-brand-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'fill-brand-500 text-brand-500' : 'text-slate-400'}`} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* If logged in, show their dedicated Role Dashboard CTA right in navigation */}
            {isAuthenticated && (
              <Link
                href={dashboard.href}
                className={`ml-2 flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all shadow-sm ${dashboard.color}`}
              >
                <DashboardIcon className="w-4 h-4" />
                <span>{dashboard.title}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons: Language, Theme, Cart, User Auth */}
          <div className="flex items-center gap-2">
            {/* Desktop Quick Controls (hidden on mobile, visible on lg+) */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationBell />

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-brand-500/50 hover:text-brand-600 transition-colors shadow-sm"
                title={t('nav.cart')}
              >
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Multi-Store Context Switcher for Staff / Merchants */}
            {isAuthenticated && user?.availableStores && user.availableStores.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-brand-500/30 bg-brand-50/60 dark:bg-brand-950/40 text-xs font-bold text-brand-700 dark:text-brand-300 hover:bg-brand-100/70 dark:hover:bg-brand-900/50 transition-all shadow-sm"
                  title="Switch Active Working Store"
                >
                  <Store className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user.availableStores.find((s) => s.storeId === storeId)?.storeName || 'Switch Store'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-brand-400" />
                </button>

                {storeDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setStoreDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Active Store
                    </div>
                    <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                      {user.availableStores.map((s) => {
                        const isCurrent = s.storeId === storeId;
                        return (
                          <button
                            key={s.storeId}
                            disabled={isCurrent || isSwitchingStore}
                            onClick={async () => {
                              setIsSwitchingStore(true);
                              await switchActiveStore(s.storeId);
                              setIsSwitchingStore(false);
                              setStoreDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-all ${
                              isCurrent
                                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold truncate">{s.storeName}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{s.role.toLowerCase()}</p>
                            </div>
                            {isCurrent && <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown / Auth CTA */}
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold hover:border-brand-500/50 transition-colors shadow-sm text-slate-800 dark:text-slate-100"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-black text-xs">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-[9px] uppercase tracking-wider">
                        {role === 'STORE_STAFF' && staffRole
                          ? `${staffRole.replace('_', ' ')} • ${user?.availableStores?.find((s) => s.storeId === storeId)?.storeName || 'Store Staff'}`
                          : role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href={dashboard.href}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 transition-colors"
                      >
                        <DashboardIcon className="w-4 h-4 text-brand-500" />
                        <span>Go to {dashboard.title}</span>
                      </Link>

                      {/* Staff Cross-Functional Workspace Shortcuts */}
                      {role === 'STORE_STAFF' && (
                        <>
                          {(user?.permissions?.includes('manage_inventory') || staffRole === 'INVENTORY_CLERK') && dashboard.href !== '/merchant/products' && (
                            <Link
                              href="/merchant/products"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Package className="w-4 h-4 text-brand-500" />
                              <span>Products & Stock</span>
                            </Link>
                          )}
                          {staffRole === 'MANAGER' && dashboard.href !== '/merchant' && (
                            <Link
                              href="/merchant"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Store className="w-4 h-4 text-slate-400" />
                              <span>Manager Overview</span>
                            </Link>
                          )}
                          {user?.permissions?.includes('manage_orders') && dashboard.href !== '/merchant/orders' && (
                            <Link
                              href="/merchant/orders"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4 text-brand-500" />
                              <span>Store Orders</span>
                            </Link>
                          )}
                          {(user?.permissions?.includes('access_pos') || staffRole === 'CASHIER' || staffRole === 'MANAGER') && dashboard.href !== '/pos' && (
                            <Link
                              href="/pos"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Terminal className="w-4 h-4 text-emerald-500" />
                              <span>POS Register</span>
                            </Link>
                          )}
                        </>
                      )}

                      <Link
                        href="/customer"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-brand-500" />
                        <span>My Personal Purchases & Orders</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
            {/* Quick Actions Bar for Mobile (Language, Theme, Notifications, Cart) */}
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 px-1 mb-2">
                <span>Preferences & Cart</span>
                {itemCount > 0 && (
                  <span className="text-brand-600 dark:text-brand-400 font-bold">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <div className="flex justify-center">
                  <NotificationBell />
                </div>
                <div className="flex justify-center">
                  <Link
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-brand-500/50 hover:text-brand-600 transition-colors shadow-sm"
                    title={t('nav.cart')}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white font-bold text-[9px] flex items-center justify-center shadow-md">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-sm font-bold">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                      active
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black ring-1 ring-brand-500/30'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {Icon && <Icon className={`w-4 h-4 ${active ? 'fill-brand-500 text-brand-500' : 'text-slate-400'}`} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {isAuthenticated && (
                <Link
                  href={dashboard.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mt-2 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-black ${dashboard.color}`}
                >
                  <DashboardIcon className="w-4 h-4" />
                  <span>Go to {dashboard.title}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
