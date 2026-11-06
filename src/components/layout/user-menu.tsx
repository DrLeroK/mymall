'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon, Settings, Store, ChevronDown, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link href="/login">
        <Button size="sm" variant="outline">
          Sign In
        </Button>
      </Link>
    );
  }

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
          {initials}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
            {user.name || user.email}
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {user.staffRole || user.role}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user.name || 'User'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {user.email}
            </p>
            <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 text-[10px] font-bold uppercase tracking-wider">
              {user.staffRole ? `${user.role} • ${user.staffRole}` : user.role}
            </div>
          </div>

          <div className="p-1">
            {user.role === 'STORE_OWNER' && (
              <Link
                href="/merchant/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Store Settings</span>
              </Link>
            )}
            <Link
              href="/customer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>Customer Portal</span>
            </Link>
            <Link
              href="/staff/accept"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold transition-colors"
            >
              <Terminal className="w-4 h-4 text-amber-500" />
              <span>Accept Staff Invite</span>
            </Link>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              <Store className="w-4 h-4 text-slate-400" />
              <span>Browse Marketplace</span>
            </Link>
          </div>

          <div className="p-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
