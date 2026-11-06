'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Terminal, CheckCircle2, Store } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

function StaffAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || '';
  const { user, refreshUser } = useAuth();

  const [inviteCode, setInviteCode] = useState(codeParam);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [targetStoreName, setTargetStoreName] = useState<string | null>(null);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload: any = { inviteCode };
      if (!user) {
        payload.name = name;
        payload.password = password;
      }

      const res = await ApiClient.post('/staff/accept-invite', payload);
      if (res.success && res.tokens) {
        ApiClient.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
        await refreshUser();
        setIsSuccess(true);
        if (res.store?.name) setTargetStoreName(res.store.name);

        setTimeout(() => {
          if (res.user?.staffRole === 'STORE_MANAGER' || res.user?.staffRole === 'MANAGER' || res.user?.staffRole === 'ACCOUNTANT') {
            router.push('/merchant');
          } else {
            router.push('/pos');
          }
        }, 1500);
      } else {
        setError(res.message || 'Failed to accept invitation');
      }
    } catch (e: any) {
      setError(e.message || 'Invalid or expired invite code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Accept Staff Invitation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join your store team as a Cashier, Manager, Accountant, or Inventory Clerk.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 shadow-xl space-y-6">
          {user && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Signed In As</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                <span className="text-slate-400 block text-[11px]">{user.email}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {user.role}
              </span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Invitation Accepted!
              </h3>
              <p className="text-xs text-slate-500">
                {targetStoreName ? `Welcome to ${targetStoreName}. ` : ''}Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-4">
              <Input
                label="Invitation Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. INV-ABC12345"
                className="font-mono uppercase font-bold tracking-widest text-center"
                required
              />

              {!user && (
                <>
                  <Input
                    label="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Marcus Brody"
                    required
                  />

                  <Input
                    label="Create Account Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </>
              )}

              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                {user ? 'Accept & Join Store Team' : 'Create Staff Account & Join Team'}
              </Button>
            </form>
          )}
        </div>

        {!user && (
          <div className="text-center text-xs text-slate-500">
            <Link href="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Already have an account? Sign In first
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaffAcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-sm text-slate-400">Loading invitation...</div>}>
      <StaffAcceptContent />
    </Suspense>
  );
}
