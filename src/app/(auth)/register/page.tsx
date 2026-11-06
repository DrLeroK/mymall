'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Role } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Store, ShoppingBag, CheckCircle2, ArrowRight, Mail, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { register, sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Send OTP
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Password validation: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    const res = await sendOtp(email);
    if (res.success) {
      setStep('OTP');
    } else {
      setError(res.message || 'Failed to send OTP verification code');
    }
    setIsLoading(false);
  };

  // Step 2: Verify OTP & finalize registration
  const handleFinalizeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Verify OTP
    const otpRes = await verifyOtp(email, otpCode);
    if (!otpRes.success) {
      setError(otpRes.message || 'Invalid 6-digit OTP code');
      setIsLoading(false);
      return;
    }

    // 2. Finalize registration
    const regRes = await register({
      email,
      name,
      phone,
      password,
      role,
      otp: otpCode,
    });

    if (regRes.success) {
      if (role === 'STORE_OWNER') {
        router.push('/merchant/onboard');
      } else {
        router.push('/explore');
      }
    } else {
      setError(regRes.message || 'Registration failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            M
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === 'DETAILS' ? t('auth.registerTitle') : t('auth.otpTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'DETAILS'
              ? 'Join MyMall to shop or build your online & in-store retail business.'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 shadow-xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {step === 'DETAILS' ? (
            <form onSubmit={handleProceedToOtp} className="space-y-4">
              {/* Account Type Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('auth.accountType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === 'CUSTOMER'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mb-1 text-brand-500" />
                    <span className="text-xs font-bold block">Customer</span>
                    <span className="text-[10px] text-slate-400 block">Buy products</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('STORE_OWNER')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === 'STORE_OWNER'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Store className="w-4 h-4 mb-1 text-brand-500" />
                    <span className="text-xs font-bold block">Store Owner</span>
                    <span className="text-[10px] text-slate-400 block">Sell & POS</span>
                  </button>
                </div>
              </div>

              <Input
                label={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abebe Kebede"
                required
              />

              <Input
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />

              <Input
                label={t('auth.phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars with number & uppercase"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('auth.sendOtp')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleFinalizeRegistration} className="space-y-5">
              <div className="text-center space-y-2">
                <Mail className="w-10 h-10 text-brand-500 mx-auto" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t('auth.otpDescription')}
                </p>
              </div>

              <Input
                label="6-Digit Verification Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono font-bold"
                required
              />

              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                {t('auth.verifyOtp')}
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                >
                  Change details
                </button>
                <button
                  type="button"
                  onClick={handleProceedToOtp}
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                >
                  {t('auth.resendOtp')}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-500 space-y-1">
          <div>
            <span>{t('auth.alreadyHaveAccount')} </span>
            <Link href="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              {t('nav.login')}
            </Link>
          </div>
          <div>
            <span>Invited to join a store team? </span>
            <Link href="/staff/accept" className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
              Accept Staff Invite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
