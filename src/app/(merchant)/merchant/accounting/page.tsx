'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Search,
  Filter,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Layers,
  Scale,
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  date: string;
  type: 'CREDIT' | 'DEBIT';
  category: string;
  reference: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

interface LedgerSummary {
  totalCredits: number;
  totalDebits: number;
  netCashFlow: number;
  totalEntries: number;
  currency: string;
}

export default function MerchantAccountingPage() {
  const { t } = useI18n();
  const { storeId, user } = useAuth();

  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLedger();
  }, [storeId, filterType]);

  const loadLedger = () => {
    setIsLoading(true);
    let url = '/billing/accounting-ledger?';
    if (filterType !== 'ALL') {
      url += `type=${filterType}&`;
    }

    ApiClient.get(url)
      .then((res) => {
        if (res.success) {
          setEntries(res.entries || []);
          setSummary(res.summary || null);
        } else {
          setEntries([]);
        }
      })
      .catch(() => {
        setEntries([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredEntries = entries.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.reference.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.paymentMethod.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-brand-500" />
            <span>Accounting & General Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time double-entry transaction record: Credits (sales income) and Debits (cost of goods & fees).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            Print Ledger
          </Button>

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadLedger}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Inflow (Credits) */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Inflow (Credits)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              +{formatPrice(summary.totalCredits)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Online store sales and POS cash/card receipts
            </p>
          </div>

          {/* Total Outflow (Debits) */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Outflow (Debits)
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
              -{formatPrice(summary.totalDebits)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Inventory procurement costs & platform subscription fees
            </p>
          </div>

          {/* Net Cash Position */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Net Operating Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p
              className={`text-2xl font-black ${
                summary.netCashFlow >= 0
                  ? 'text-slate-900 dark:text-white'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {summary.netCashFlow >= 0 ? '+' : ''}
              {formatPrice(summary.netCashFlow)}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Audited net cash flow across {summary.totalEntries} entries
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filterType === 'ALL'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Ledger Entries
          </button>
          <button
            onClick={() => setFilterType('CREDIT')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              filterType === 'CREDIT'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Credits (Inflow)</span>
          </button>
          <button
            onClick={() => setFilterType('DEBIT')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              filterType === 'DEBIT'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Debits (Outflow)</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Journal Ledger Entries ({filteredEntries.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Currency: ETB</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Reference #</th>
                <th className="px-6 py-3.5">Ledger Category</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Payment Channel</th>
                <th className="px-6 py-3.5 text-right">Debit (-)</th>
                <th className="px-6 py-3.5 text-right">Credit (+)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No accounting entries recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {formatDate(entry.date)}
                    </td>

                    <td className="px-6 py-4">
                      {entry.type === 'CREDIT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          CREDIT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                          DEBIT
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {entry.reference}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {entry.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {entry.description}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {entry.paymentMethod}
                    </td>

                    {/* Debit Column */}
                    <td className="px-6 py-4 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      {entry.type === 'DEBIT' ? `-${formatPrice(entry.amount)}` : '—'}
                    </td>

                    {/* Credit Column */}
                    <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {entry.type === 'CREDIT' ? `+${formatPrice(entry.amount)}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
