'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Terminal, CheckCircle2, Store } from 'lucide-react';
import Link from 'next/link';

function StaffAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [inviteCode, setInviteCode] = useState(codeParam);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.post('/staff/accept-invite', {
        inviteCode,
        name,
        password,
      });
      if (res.success && res.tokens) {
        ApiClient.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
        setIsSuccess(true);
        setTimeout(() => {
          if (res.user?.staffRole === 'STORE_MANAGER' || res.user?.staffRole === 'MANAGER') {
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
            Join your store team as a Cashier, Manager, or Inventory Clerk.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 shadow-xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Invitation Accepted!
              </h3>
              <p className="text-xs text-slate-500">Redirecting to Cashier POS register...</p>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-4">
              <Input
                label="8-Character Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. STF-9821"
                className="font-mono uppercase font-bold tracking-widest text-center"
                required
              />

              <Input
                label="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Brody"
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

              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                Join Store Team & Open POS
              </Button>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link href="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Already have staff credentials? Sign In
          </Link>
        </div>
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
