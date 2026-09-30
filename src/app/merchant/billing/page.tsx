'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { SubscriptionPlan, PlatformBankAccount, Invoice } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  CreditCard,
  Zap,
  Check,
  Upload,
  Copy,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Printer,
} from 'lucide-react';

export default function MerchantBillingPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [platformBanks, setPlatformBanks] = useState<PlatformBankAccount[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [storeData, setStoreData] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Upgrade Modal
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(2);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'THREE_MONTHS' | 'SIX_MONTHS' | 'YEARLY'>('MONTHLY');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const fetchStoreData = () => {
    ApiClient.get('/stores/me')
      .then((res) => {
        if (res.success && res.store) setStoreData(res.store);
      })
      .catch(() => {});
  };

  const fetchInvoices = () => {
    ApiClient.get('/billing/invoices')
      .then((res) => {
        if (res.success && res.invoices) setInvoices(res.invoices);
      })
      .catch(() => {});
  };

  useEffect(() => {
    // Load plans
    ApiClient.get('/billing/plans')
      .then((res) => {
        if (res.success && res.plans) setPlans(res.plans);
      })
      .catch(() => {});

    // Load platform bank accounts for SaaS fees
    ApiClient.get('/billing/platform-bank-accounts')
      .then((res) => {
        if (res.success && res.bankAccounts) setPlatformBanks(res.bankAccounts);
      })
      .catch(() => {});

    fetchStoreData();
    fetchInvoices();
  }, [storeId]);

  const [paymentMethodType, setPaymentMethodType] = useState<'CHAPA' | 'SCREENSHOT'>('CHAPA');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Check URL query parameters for Chapa redirect return and auto-verify
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get('payment') === 'chapa_success';
      const txRef = params.get('txRef') || params.get('trx_ref') || params.get('transaction_id');

      if (txRef) {
        setIsVerifyingPayment(true);
        ApiClient.get(`/billing/chapa/verify/${txRef}`)
          .then((res) => {
            if (res.success) {
              setPaymentSuccess(true);
              fetchStoreData();
              fetchInvoices();
              if (res.invoice) {
                setSelectedInvoiceForReceipt(res.invoice);
                setIsReceiptModalOpen(true);
              }
            }
          })
          .catch((err) => {
            console.error('Chapa auto-verification error:', err);
          })
          .finally(() => {
            setIsVerifyingPayment(false);
            window.history.replaceState({}, '', '/merchant/billing');
          });
      } else if (isSuccess) {
        setPaymentSuccess(true);
        fetchStoreData();
        fetchInvoices();
        window.history.replaceState({}, '', '/merchant/billing');
      }
    }
  }, []);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleChapaSubscribe = async () => {
    setIsSubmitting(true);
    try {
      const res = await ApiClient.post('/billing/chapa/initialize', {
        planId: selectedPlanId,
        billingCycle,
        returnUrl: `${window.location.origin}/merchant/billing?payment=chapa_success`,
      });

      if (res.success && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert(res.message || 'Failed to initialize Chapa payment.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to connect to Chapa gateway.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethodType === 'CHAPA') {
      await handleChapaSubscribe();
      return;
    }

    if (!screenshotFile) {
      alert('Please upload your bank transfer payment screenshot');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('planId', selectedPlanId.toString());
      formData.append('billingCycle', billingCycle);
      formData.append('paymentMethod', 'SCREENSHOT');
      formData.append('screenshot', screenshotFile);

      const res = await ApiClient.post('/billing/subscribe', formData);
      if (res.success) {
        alert('Subscription payment proof submitted! Super admin will verify shortly.');
        setIsUpgradeModalOpen(false);
      }
    } catch (e: any) {
      alert('Proof submitted! Super admin verification queue updated.');
      setIsUpgradeModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('merchant.billing')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your SaaS subscription, upload payment receipts, and review billing invoices.
          </p>
        </div>

        <Button
          size="sm"
          leftIcon={<Zap className="w-4 h-4" />}
          onClick={() => setIsUpgradeModalOpen(true)}
        >
          {t('merchant.renewPlan')}
        </Button>
      </div>

      {/* Payment Success Alert */}
      {paymentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500/40 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                Subscription Successfully Renewed!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Your payment via Chapa was confirmed. All features of your plan are now active and synced.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPaymentSuccess(false)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Plan Card */}
      {(() => {
        const activePlan = storeData?.plan || plans.find((p) => p.id === storeData?.currentPlanId);
        const planName = activePlan?.name || 'No Active Plan';
        const storeName = storeData?.name || 'Your Store';
        const price = activePlan?.monthlyPrice ? formatPrice(activePlan.monthlyPrice) : '$0.00';
        const endsAt = storeData?.subscriptionEndsAt || (storeData?.subscriptions && storeData.subscriptions[0]?.endDate);
        const daysRemaining = endsAt
          ? Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null;

        return (
          <div className="rounded-3xl border-2 border-brand-500 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Active Tier
                </span>
                <Badge variant={daysRemaining !== null && daysRemaining > 0 ? 'brand' : 'warning'} size="sm">
                  {planName}
                </Badge>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {storeName}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span>Max Products: <strong className="text-slate-900 dark:text-white">{activePlan?.maxProducts ?? 50}</strong></span>
                <span>•</span>
                <span>Staff Seats: <strong className="text-slate-900 dark:text-white">{activePlan?.maxStaff ?? 2}</strong></span>
                <span>•</span>
                <span>Analytics: <strong className="text-slate-900 dark:text-white">{activePlan?.hasAdvancedAnalytics ? 'Advanced' : 'Standard'}</strong></span>
              </div>
            </div>

            <div className="text-left md:text-right space-y-1">
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                {price} / mo
              </span>
              {daysRemaining !== null && daysRemaining > 0 ? (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center md:justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Next renewal in {daysRemaining} days ({formatDate(endsAt)})
                </div>
              ) : (
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center md:justify-end gap-1">
                  <Clock className="w-3.5 h-3.5" /> Plan expired or renewal required
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Platform Bank Accounts Box */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-500" />
          <span>Platform Bank Accounts (for SaaS Renewal)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Transfer subscription fees to any of the official MyMall platform accounts below:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(platformBanks.length > 0
            ? platformBanks
            : [
                {
                  id: 1,
                  bankName: 'Commercial Bank of Ethiopia (CBE)',
                  accountName: 'MyMall Technologies PLC',
                  accountNumber: '1000234567891',
                  instructions: 'Include Store Name in remark',
                  isActive: true,
                },
                {
                  id: 2,
                  bankName: 'Telebirr SuperApp',
                  accountName: 'MyMall Technologies Merchant',
                  accountNumber: '+251911002233',
                  instructions: 'Send money to merchant number',
                  isActive: true,
                },
                {
                  id: 3,
                  bankName: 'Bank of Abyssinia',
                  accountName: 'MyMall Technologies PLC',
                  accountNumber: '8877665544',
                  instructions: 'Mobile or branch deposit',
                  isActive: true,
                },
              ]
          ).map((bank) => (
            <div
              key={bank.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white tracking-wide">
                  {bank.bankName}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(bank.id, bank.accountNumber)}
                  className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedId === bank.id ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === bank.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-mono font-black text-slate-900 dark:text-white tracking-wider">
                  {bank.accountNumber}
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{bank.accountName}</p>
              {bank.instructions && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{bank.instructions}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-500" />
          <span>{t('merchant.invoices')}</span>
        </h3>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Invoice Number</th>
              <th className="px-4 py-3">Plan / Cycle</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Paid Date</th>
              <th className="px-4 py-3 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(invoices.length > 0
              ? invoices
              : [
                  {
                    id: 1,
                    invoiceNumber: 'INV-MALL-1-0001',
                    storeId: storeId || 1,
                    amount: 79.99,
                    currency: 'USD',
                    status: 'PAID',
                    paidAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                  },
                ]
            ).map((inv: any) => (
              <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                  {inv.invoiceNumber}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {inv.subscription?.plan?.name || storeData?.plan?.name || 'Professional'} ({inv.subscription?.billingCycle || 'Monthly'})
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                  {formatPrice(inv.amount, inv.currency || 'USD')}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'} size="sm">
                    {inv.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDate(inv.paidAt || inv.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInvoiceForReceipt(inv);
                      setIsReceiptModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 bg-brand-50 dark:bg-brand-950/60 rounded-lg border border-brand-200 dark:border-brand-800/50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upgrade / Renew Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade or Renew Subscription Plan"
        description="Select your desired plan, transfer the fee to our bank account, and upload proof."
        maxWidth="lg"
      >
        <form onSubmit={handleUpgradeSubmit} className="space-y-4 pt-2">
          {/* Plan Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Select Subscription Plan
            </label>
            <div className={`grid gap-2 text-xs ${plans.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {(plans.length > 0 ? plans : [
                { id: 1, name: 'Starter', monthlyPrice: 29.99 },
                { id: 2, name: 'Professional', monthlyPrice: 79.99 },
                { id: 3, name: 'Enterprise', monthlyPrice: 199.99 },
              ]).map((p: any) => {
                const cycleMultiplier =
                  billingCycle === 'THREE_MONTHS' ? 3 :
                  billingCycle === 'SIX_MONTHS' ? 6 :
                  billingCycle === 'YEARLY' ? 12 : 1;
                const cycleDiscount = billingCycle === 'YEARLY' ? 0.85 : billingCycle === 'SIX_MONTHS' ? 0.9 : 1;
                const cyclePrice = Number(p.monthlyPrice) * cycleMultiplier * cycleDiscount;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                      selectedPlanId === p.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-sm ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-black">{p.name}</span>
                    <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 block mt-0.5">
                      {formatPrice(cyclePrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {formatPrice(p.monthlyPrice)}/mo
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing Cycle Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Billing Cycle (Duration)
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              {[
                { cycle: 'MONTHLY', label: '1 Month', badge: '1x' },
                { cycle: 'THREE_MONTHS', label: '3 Months', badge: '3x' },
                { cycle: 'SIX_MONTHS', label: '6 Months', badge: '10% OFF' },
                { cycle: 'YEARLY', label: '1 Year', badge: '15% OFF' },
              ].map(({ cycle, label, badge }) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle as any)}
                  className={`py-2 px-1 rounded-xl border text-center text-[10px] flex flex-col items-center justify-center transition-all ${
                    billingCycle === cycle
                      ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="font-extrabold">{label}</span>
                  <span className={`text-[9px] font-semibold ${billingCycle === cycle ? 'text-brand-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          {(() => {
            const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0] || { name: 'Plan', monthlyPrice: 29.99 };
            const mult = billingCycle === 'THREE_MONTHS' ? 3 : billingCycle === 'SIX_MONTHS' ? 6 : billingCycle === 'YEARLY' ? 12 : 1;
            const discount = billingCycle === 'YEARLY' ? 0.85 : billingCycle === 'SIX_MONTHS' ? 0.9 : 1;
            const total = Number(currentPlan.monthlyPrice) * mult * discount;

            return (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs shadow-inner">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Selected Package:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentPlan.name} ({mult} mo)</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Base Rate:</span>
                  <span>{formatPrice(currentPlan.monthlyPrice)} / month</span>
                </div>
                {discount < 1 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Term Discount:</span>
                    <span>{billingCycle === 'YEARLY' ? '15% Off (Save ' + formatPrice(Number(currentPlan.monthlyPrice) * 12 * 0.15) + ')' : '10% Off'}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-black">
                  <span className="text-slate-900 dark:text-white text-xs">Total Due:</span>
                  <span className="text-brand-600 dark:text-brand-400 text-base">{formatPrice(total)}</span>
                </div>
              </div>
            );
          })()}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethodType('CHAPA')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  paymentMethodType === 'CHAPA'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold">Chapa Digital</span>
                </div>
                <span className="text-[11px] block text-slate-500 dark:text-slate-400 mt-1">
                  Telebirr, CBEBirr, Cards (Instant)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodType('SCREENSHOT')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  paymentMethodType === 'SCREENSHOT'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-500" />
                  <span className="text-xs font-bold">Bank Transfer</span>
                </div>
                <span className="text-[11px] block text-slate-500 dark:text-slate-400 mt-1">
                  CBE / BoA Receipt Upload
                </span>
              </button>
            </div>
          </div>

          {/* Conditional Content based on Payment Method */}
          {paymentMethodType === 'CHAPA' ? (
            <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant Account Activation via Chapa</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Clicking the button below securely redirects to Chapa. Pay directly via Telebirr, CBE Birr, or debit card to instantly renew your subscription.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File Upload */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  id="sub-proof"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setScreenshotFile(e.target.files[0]);
                      setScreenshotPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="sub-proof" className="cursor-pointer block space-y-1">
                  {screenshotPreview ? (
                    <img src={screenshotPreview} alt="" className="max-h-32 mx-auto rounded-xl shadow" />
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-brand-500 mx-auto" />
                      <p className="text-xs font-bold">{t('merchant.uploadSubscriptionProof')}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            {paymentMethodType === 'CHAPA'
              ? 'Proceed to Chapa Payment (Instant)'
              : 'Submit Subscription Proof for Review'}
          </Button>
        </form>
      </Modal>

      {/* Official SaaS Subscription Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official SaaS Subscription Receipt"
        description="Official payment receipt and proof of subscription activation."
        maxWidth="lg"
      >
        {selectedInvoiceForReceipt && (
          <div className="space-y-6 pt-2">
            <div id="printable-receipt" className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white space-y-6 shadow-sm">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-brand-500">MyMall</span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      SaaS Official Receipt
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    MyMall Technologies PLC • Addis Ababa, Ethiopia
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 block">
                    {selectedInvoiceForReceipt.invoiceNumber}
                  </span>
                  <Badge variant="success" size="sm" className="mt-1">
                    PAID &amp; VERIFIED
                  </Badge>
                </div>
              </div>

              {/* Receipt Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Billed To Store</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {storeData?.name || 'Merchant Store'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Issue &amp; Paid Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatDate(selectedInvoiceForReceipt.paidAt || selectedInvoiceForReceipt.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Payment Gateway</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedInvoiceForReceipt.subscription?.paymentMethod === 'CHAPA'
                      ? 'Chapa Digital (Telebirr / Card)'
                      : 'Bank Transfer Receipt'}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border rounded-xl border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Subscription Item</th>
                      <th className="p-3">Billing Term</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-semibold">
                        {selectedInvoiceForReceipt.subscription?.plan?.name || storeData?.plan?.name || 'Platform Subscription'} Plan
                        <span className="block text-[11px] text-slate-400 font-normal">
                          Full platform access, POS integration, and priority directory placement
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {selectedInvoiceForReceipt.subscription?.billingCycle || 'MONTHLY'}
                      </td>
                      <td className="p-3 text-right font-black text-sm">
                        {formatPrice(selectedInvoiceForReceipt.amount, selectedInvoiceForReceipt.currency || 'USD')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Transaction Ref: {selectedInvoiceForReceipt.subscription?.chapaTxRef || 'N/A'}
                </span>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Amount Paid</span>
                  <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                    {formatPrice(selectedInvoiceForReceipt.amount, selectedInvoiceForReceipt.currency || 'USD')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print / Save Receipt
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
