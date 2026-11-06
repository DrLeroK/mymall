'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSidebarStore } from '@/store/sidebar-store';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Menu, ShoppingCart, Store, Check, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { NotificationBell } from '@/components/common/NotificationBell';
import { UnseenAlertsModal } from '@/components/common/UnseenAlertsModal';
import { UserMenu } from './user-menu';

export function Topbar() {
  const { toggle } = useSidebarStore();
  const { user, storeId, switchActiveStore } = useAuth();
  const { itemCount } = useCart();

  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const storeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (storeRef.current && !storeRef.current.contains(event.target as Node)) {
        setIsStoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableStores = user?.availableStores || [];
  const currentStore = availableStores.find((s) => s.storeId === storeId) || availableStores[0];

  const handleSwitchStore = async (targetId: number) => {
    if (targetId === storeId || switching) return;
    setSwitching(true);
    await switchActiveStore(targetId);
    setIsStoreOpen(false);
    setSwitching(false);
    // Reload active dashboard route to refresh store context
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <>
      <UnseenAlertsModal />
      <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Multi-Store Switcher */}
          {availableStores.length > 0 && (
            <div className="relative" ref={storeRef}>
              <button
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-sm"
                title="Switch active store"
              >
                <div className="w-5 h-5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <span className="max-w-[130px] truncate">
                  {currentStore ? currentStore.storeName : 'Select Store'}
                </span>
                {availableStores.length > 1 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    {availableStores.length}
                  </span>
                )}
                {availableStores.length > 1 && (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {isStoreOpen && availableStores.length > 1 && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Switch Active Store
                    </p>
                  </div>
                  <div className="p-1 space-y-0.5 max-h-60 overflow-y-auto">
                    {availableStores.map((s) => {
                      const isActive = s.storeId === storeId;
                      return (
                        <button
                          key={s.storeId}
                          disabled={switching}
                          onClick={() => handleSwitchStore(s.storeId)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                            isActive
                              ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Store className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <div className="truncate">
                              <p className="truncate">{s.storeName}</p>
                              {s.role && (
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                  {s.role}
                                </p>
                              )}
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand-500/50 hover:text-brand-600 transition-colors shadow-sm"
            aria-label="View shopping cart"
            title="Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-black text-white shadow-md">
                {itemCount}
              </span>
            )}
          </Link>

          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationBell />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <UserMenu />
        </div>
      </header>
    </>
  );
}
