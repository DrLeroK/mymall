'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Store, ShoppingBag, Terminal, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function RoleSwitcherBanner() {
  const { role, staffRole, switchRolePreview } = useAuth();

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
          <Sparkles className="w-3 h-3 text-brand-400" />
          Active Context:
        </span>
        <span className="font-bold text-slate-200 uppercase tracking-wider">
          {role} {staffRole ? `(${staffRole})` : ''}
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-slate-400 hidden sm:inline mr-1 text-[11px]">Quick Switcher:</span>

        {/* Super Admin */}
        <button
          onClick={() => switchRolePreview('SUPER_ADMIN')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            role === 'SUPER_ADMIN'
              ? 'bg-brand-500 text-white font-bold shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-brand-300" />
          Super Admin
        </button>

        {/* Store Owner */}
        <button
          onClick={() => switchRolePreview('STORE_OWNER')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            role === 'STORE_OWNER'
              ? 'bg-brand-500 text-white font-bold shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <Store className="w-3 h-3 text-emerald-300" />
          Store Owner
        </button>

        {/* Cashier Staff */}
        <button
          onClick={() => switchRolePreview('STORE_STAFF', 'CASHIER')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            role === 'STORE_STAFF' && staffRole === 'CASHIER'
              ? 'bg-brand-500 text-white font-bold shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <Terminal className="w-3 h-3 text-amber-300" />
          Cashier (POS)
        </button>

        {/* Customer */}
        <button
          onClick={() => switchRolePreview('CUSTOMER')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            role === 'CUSTOMER'
              ? 'bg-brand-500 text-white font-bold shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <ShoppingBag className="w-3 h-3 text-sky-300" />
          Customer
        </button>
      </div>
    </div>
  );
}
