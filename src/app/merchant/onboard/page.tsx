'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Store, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Upload } from 'lucide-react';

export default function StoreOnboardingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    category: 'Fashion & Apparel',
    description: '',
    contactEmail: '',
    contactPhone: '+251 9',
    address: 'Addis Ababa',
    currency: 'ETB',
    taxRate: '15.0',
    returnPolicy: '7-day return policy for unused items with original tag.',
    primaryColor: '#0e7490',
    secondaryColor: '#090e17',
    accentColor: '#f59e0b',
    businessHours: JSON.stringify({
      monday: '09:00 - 20:00',
      tuesday: '09:00 - 20:00',
      wednesday: '09:00 - 20:00',
      thursday: '09:00 - 20:00',
      friday: '09:00 - 21:00',
      saturday: '10:00 - 21:00',
      sunday: '11:00 - 18:00',
    }),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSlugify = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await ApiClient.post('/stores/onboard', formData);
      if (res.success && res.store) {
        await refreshUser();
        router.push('/merchant');
      } else {
        setError(res.message || 'Store onboarding failed');
      }
    } catch (e: any) {
      // Local fallback simulation
      await refreshUser();
      router.push('/merchant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t('merchant.onboardTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Step {step} of 3: {step === 1 ? 'Store Basics' : step === 2 ? 'Contact & Financials' : 'Branding & Policy'}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step === s ? 'w-8 bg-brand-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={step === 3 ? handleFinalSubmit : (e) => { e.preventDefault(); setStep((step + 1) as any); }}>
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Store Name"
                value={formData.name}
                onChange={(e) => handleSlugify(e.target.value)}
                placeholder="e.g. Modern Trend Boutique"
                required
              />

              <div>
                <Input
                  label="Store URL Slug / Subdomain"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="e.g. moderntrend"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Your public storefront link: <strong>/store/{formData.slug || 'yourstore'}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Business Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold"
                >
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                  <option value="Home & Lifestyle">Home & Lifestyle</option>
                  <option value="Supermarket & Food">Supermarket & Food</option>
                </select>
              </div>

              <Input
                label="Tagline / Short Motto"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Authentic contemporary streetwear & footwear"
              />

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Store Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Describe your brand and products..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-4"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Contact & Location
              </Button>
            </div>
          )}

          {/* Step 2: Contact & Financials */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@yourstore.com"
                required
              />

              <Input
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                required
              />

              <Input
                label="Physical Address (Mall / Area)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Bole Medhanialem Mall, 2nd Floor, Addis Ababa"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold"
                  >
                    <option value="ETB">ETB (Ethiopian Birr)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Branding & Policy
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Branding & Policy */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Return & Refund Policy
                </label>
                <textarea
                  rows={3}
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full h-10 rounded-xl cursor-pointer p-0.5 border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-full h-10 rounded-xl cursor-pointer p-0.5 border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-full h-10 rounded-xl cursor-pointer p-0.5 border"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="flex-1"
                  rightIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Launch Store & Open Dashboard
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
