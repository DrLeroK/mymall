'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';
import { StoreSubscription } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Banknote,
  CreditCard,
  Building2,
  Search,
  FileText,
  ExternalLink,
  CheckCircle2,
  Download,
  Receipt,
  CheckSquare,
} from 'lucide-react';

export default function AdminSubscriptionsIncomePage() {
  const { t } = useI18n();

  const [subscriptions, setSubscriptions] = useState<StoreSubscription[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    chapaIncome: 0,
    bankIncome: 0,
    approvedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'CHAPA' | 'SCREENSHOT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'APPROVED' | 'ALL' | 'PENDING_APPROVAL'>('APPROVED');

  // Receipt Modal State
  const [selectedSubForReceipt, setSelectedSubForReceipt] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter]);

  const loadSubscriptions = () => {
    setIsLoading(true);
    ApiClient.get(`/billing/admin/verifications?status=${statusFilter}`)
      .then((res: any) => {
        if (res.success && Array.isArray(res.verifications)) {
          setSubscriptions(res.verifications);
          if (res.summary) {
            setSummary(res.summary);
          }
        }
      })
      .catch(() => {
        setSubscriptions([]);
      })
      .finally(() => setIsLoading(false));
  };

  // Filtered subscriptions list
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub: any) => {
      const storeName = sub.store?.name?.toLowerCase() || '';
      const storeSlug = sub.store?.slug?.toLowerCase() || '';
      const ownerEmail = sub.store?.owner?.email?.toLowerCase() || '';
      const ownerName = sub.store?.owner?.name?.toLowerCase() || '';
      const planName = sub.plan?.name?.toLowerCase() || '';
      const txRef = sub.chapaTxRef?.toLowerCase() || '';
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !term ||
        storeName.includes(term) ||
        storeSlug.includes(term) ||
        ownerEmail.includes(term) ||
        ownerName.includes(term) ||
        planName.includes(term) ||
        txRef.includes(term);

      const matchesMethod =
        methodFilter === 'ALL' ||
        (methodFilter === 'CHAPA' && sub.paymentMethod === 'CHAPA') ||
        (methodFilter === 'SCREENSHOT' && sub.paymentMethod !== 'CHAPA');

      return matchesSearch && matchesMethod;
    });
  }, [subscriptions, searchTerm, methodFilter]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              Platform Monetization
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscription Fee Incomes & Revenue History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of all subscription fee income collected from tenant stores, payment methods, and verifiable proof.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/verifications">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CheckSquare className="w-4 h-4 text-amber-500" />}
            >
              Pending Verifications Queue
            </Button>
          </Link>
          <Link href="/admin">
            <Button size="sm" variant="secondary">
              Admin Overview
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 High-Impact Income Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Approved Revenue */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Subscription Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatPrice(summary.totalIncome, 'ETB')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{summary.approvedCount} approved subscription payments cleared</span>
          </div>
        </div>

        {/* Chapa Gateway Revenue */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Chapa Gateway Revenue</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
            {formatPrice(summary.chapaIncome, 'ETB')}
          </p>
          <div className="text-[11px] text-slate-400">
            Instant automatic checkout settlements
          </div>
        </div>

        {/* Direct Bank Transfer Revenue */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Bank Transfer Revenue</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-sky-600 dark:text-sky-400 tracking-tight">
            {formatPrice(summary.bankIncome, 'ETB')}
          </p>
          <div className="text-[11px] text-slate-400">
            CBE, Telebirr & manual bank receipts
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by store name, slug, owner email, or tx ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'APPROVED'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Approved Income
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Records
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMethodFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                methodFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Methods
            </button>
            <button
              onClick={() => setMethodFilter('CHAPA')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                methodFilter === 'CHAPA'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Chapa
            </button>
            <button
              onClick={() => setMethodFilter('SCREENSHOT')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                methodFilter === 'SCREENSHOT'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bank Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Incomes Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-xs font-medium">Loading subscription payments ledger...</span>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Receipt className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Subscription Payments Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || methodFilter !== 'ALL'
                ? 'Try adjusting your search query or payment method filter.'
                : 'Approved subscription transactions and fee revenue will be recorded here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Store / Tenant</th>
                  <th className="px-6 py-3.5">Store Owner</th>
                  <th className="px-6 py-3.5">Plan Tier & Cycle</th>
                  <th className="px-6 py-3.5">Amount (Income)</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Approval Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Digital Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSubscriptions.map((sub: any) => {
                  const isChapa = sub.paymentMethod === 'CHAPA';
                  const matchedInvoice = sub.invoices && sub.invoices[0];
                  const invoiceNumber = matchedInvoice?.invoiceNumber || `INV-MALL-${sub.storeId}-${sub.id}`;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Store */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center shrink-0">
                            {sub.store?.name?.[0] || 'S'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {sub.store?.name || `Store #${sub.storeId}`}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              /{sub.store?.slug || 'store'} • {sub.store?.category || 'Retail'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Store Owner */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {sub.store?.owner?.name || 'Store Merchant'}
                        </span>
                        <span className="text-slate-400 text-[11px] block">
                          {sub.store?.owner?.email || 'N/A'}
                        </span>
                      </td>

                      {/* Plan & Cycle */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <Badge variant="brand" size="sm">
                            {sub.plan?.name || 'SaaS Plan'}
                          </Badge>
                          <span className="block text-[11px] text-slate-500 font-medium">
                            {sub.billingCycle ? sub.billingCycle.replace('_', ' ') : 'MONTHLY'}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatPrice(sub.amount, 'ETB')}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {invoiceNumber}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4">
                        {isChapa ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200/60 dark:border-emerald-800/40">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Chapa Gateway</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-[11px] border border-sky-200/60 dark:border-sky-800/40">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Bank Transfer</span>
                          </div>
                        )}
                        {sub.chapaTxRef && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
                            {sub.chapaTxRef}
                          </span>
                        )}
                      </td>

                      {/* Approval Date */}
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        <div>{formatDate(sub.updatedAt || sub.createdAt)}</div>
                        {sub.startDate && sub.endDate && (
                          <span className="text-[10px] text-slate-400 block">
                            Valid: {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            sub.status === 'APPROVED'
                              ? 'success'
                              : sub.status === 'PENDING_APPROVAL'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {sub.status === 'APPROVED' ? 'Approved & Paid' : sub.status}
                        </Badge>
                      </td>

                      {/* Digital Receipt */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubForReceipt(sub);
                            setIsReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 bg-brand-50 dark:bg-brand-950/60 rounded-xl border border-brand-200 dark:border-brand-800/50 transition-colors shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verifiable Receipt & Payment Proof Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedSubForReceipt(null);
        }}
        title="Subscription Payment Proof & Digital Receipt"
        description="Verifiable official digital payment receipt and clearance document."
        maxWidth="lg"
      >
        {selectedSubForReceipt && (
          <div className="space-y-5 pt-2">
            {/* Store & Transaction Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 font-bold flex items-center justify-center text-xs">
                    {selectedSubForReceipt.store?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {selectedSubForReceipt.store?.name || `Store #${selectedSubForReceipt.storeId}`}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      /{selectedSubForReceipt.store?.slug} • {selectedSubForReceipt.store?.owner?.email}
                    </p>
                  </div>
                </div>

                <Badge variant="success" size="sm">
                  {selectedSubForReceipt.status === 'APPROVED' ? 'Approved & Paid' : selectedSubForReceipt.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Plan / Cycle</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedSubForReceipt.plan?.name || 'SaaS Tier'} ({selectedSubForReceipt.billingCycle?.replace('_', ' ') || 'MONTHLY'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Amount Received</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {formatPrice(selectedSubForReceipt.amount, 'ETB')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Gateway</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedSubForReceipt.paymentMethod === 'CHAPA' ? 'Chapa Gateway' : 'Direct Bank Transfer'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cleared Timestamp</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatDate(selectedSubForReceipt.updatedAt || selectedSubForReceipt.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Proof Preview / File Download */}
            {selectedSubForReceipt.paymentProofUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Digital Proof Document</span>
                  <a
                    href={getImageUrl(selectedSubForReceipt.paymentProofUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {selectedSubForReceipt.paymentProofUrl.endsWith('.html') ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
                    <iframe
                      src={getImageUrl(selectedSubForReceipt.paymentProofUrl)}
                      title="Digital Receipt File"
                      className="w-full h-80 border-0"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 p-2 text-center">
                    <img
                      src={getImageUrl(selectedSubForReceipt.paymentProofUrl)}
                      alt="Bank Transfer Proof Screenshot"
                      className="max-h-72 mx-auto rounded-xl object-contain shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedSubForReceipt.paymentProofUrl && (
                <a
                  href={getImageUrl(selectedSubForReceipt.paymentProofUrl)}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  <Button
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    className="font-bold shadow-md"
                  >
                    Download Official Proof
                  </Button>
                </a>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsReceiptModalOpen(false);
                  setSelectedSubForReceipt(null);
                }}
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
