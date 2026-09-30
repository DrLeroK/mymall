'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.post('/auth/forgot-password', { email });
      if (res.success) {
        if (res.devResetCode) setDevCode(res.devResetCode);
        setStep('RESET');
      } else {
        setError(res.message || 'Failed to request reset code');
      }
    } catch (e: any) {
      setError(e.message || 'Email not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword,
      });
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (e: any) {
      setError(e.message || 'Invalid code or password requirements not met');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === 'REQUEST' ? 'Reset Password' : 'Set New Password'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'REQUEST'
              ? 'Enter your registered email to receive a 6-digit reset code.'
              : `Enter the code sent to ${email} and your new password.`}
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
                Password Reset Successfully!
              </h3>
              <p className="text-xs text-slate-500">Redirecting to login...</p>
            </div>
          ) : step === 'REQUEST' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {devCode && (
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold text-center">
                  Dev Code: {devCode}
                </div>
              )}
              <Input
                label="6-Digit Reset Code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters, 1 uppercase & number"
                required
              />
              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                Confirm New Password
              </Button>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link href="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
