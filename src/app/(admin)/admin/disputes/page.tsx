'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { Dispute, DisputeStatus } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Clock,
  Store,
  User,
  ShoppingBag,
  Check,
} from 'lucide-react';

export default function AdminDisputesPage() {
  const { t } = useI18n();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = () => {
    ApiClient.get('/disputes')
      .then((res) => {
        if (res.success && res.disputes) setDisputes(res.disputes);
      })
      .catch(() => {
        setDisputes([
          {
            id: 1,
            disputeNumber: 'DISP-8921',
            type: 'ORDER_ISSUE',
            status: 'OPEN',
            title: 'Incorrect hoodie size received',
            description: 'Customer received Size M instead of Size L that was ordered from UrbanTrend.',
            reporterId: 4,
            reporter: {
              id: 4,
              name: 'Sophia Martinez',
              email: 'sophia@example.com',
              role: 'CUSTOMER',
              isEmailVerified: true,
              createdAt: '',
              updatedAt: '',
            },
            storeId: 1,
            orderId: 2001,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      });
  };

  const handleResolve = async (status: DisputeStatus) => {
    if (!selectedDispute) return;
    setIsLoading(true);

    try {
      await ApiClient.patch(`/disputes/${selectedDispute.id}/resolve`, {
        status,
        resolutionNotes,
      });
      setDisputes(
        disputes.map((d) =>
          d.id === selectedDispute.id ? { ...d, status, resolutionNotes } : d
        )
      );
    } catch {
      setDisputes(
        disputes.map((d) =>
          d.id === selectedDispute.id ? { ...d, status, resolutionNotes } : d
        )
      );
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const openCount = disputes.filter((d) => d.status === 'OPEN').length;
  const underReviewCount = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;
  const resolvedCount = disputes.filter((d) => d.status === 'RESOLVED').length;
  const rejectedCount = disputes.filter((d) => d.status === 'REJECTED').length;

  const filteredDisputes = disputes.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      d.disputeNumber.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      (d.reporter?.name || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-brand-500" />
            <span>Disputes & Claims Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review customer claims, resolve merchant conflicts, and issue binding platform decisions.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadDisputes}
        >
          Refresh Disputes
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Total Disputes</span>
            <ShieldAlert className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{disputes.length}</p>
          <p className="text-[11px] text-slate-500">Historical customer claims</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Open & Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{openCount}</p>
          <p className="text-[11px] text-slate-500">Awaiting admin intervention</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Under Review</span>
            <AlertTriangle className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400">{underReviewCount}</p>
          <p className="text-[11px] text-slate-500">Evidence requested from store</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
          <p className="text-[11px] text-slate-500">Successfully settled cases</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold w-full md:w-auto overflow-x-auto">
          {['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case #, customer, title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Disputes Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Case #</th>
                <th className="px-6 py-3.5">Title & Customer</th>
                <th className="px-6 py-3.5">Dispute Type</th>
                <th className="px-6 py-3.5">Linked Order</th>
                <th className="px-6 py-3.5">Date Filed</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No disputes found for this filter.
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      #{d.disputeNumber}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {d.title}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Reporter: {d.reporter?.name || 'Customer'} ({d.reporter?.email})
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {d.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                      {d.orderId ? `Order #${d.orderId}` : 'General Store'}
                    </td>

                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {formatDate(d.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          d.status === 'RESOLVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                            : d.status === 'REJECTED'
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-500/20'
                            : d.status === 'UNDER_REVIEW'
                            ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-500/20'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDispute(d);
                          setResolutionNotes(d.resolutionNotes || '');
                          setIsModalOpen(true);
                        }}
                      >
                        {d.status === 'RESOLVED' || d.status === 'REJECTED' ? 'View Details' : 'Resolve Claim'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Dispute Case #${selectedDispute?.disputeNumber}`}
        description="Review customer statement, store evidence, and record binding platform verdict."
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedDispute?.title}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Type: {selectedDispute?.type}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedDispute?.description}
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Customer: {selectedDispute?.reporter?.name}</span>
              <span>Order Ref: #{selectedDispute?.orderId || 'N/A'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Admin Resolution Findings & Formal Verdict
            </label>
            <textarea
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Evidence verified: merchant agreed to issue replacement item or customer refunded..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <Button
              variant="danger"
              size="sm"
              isLoading={isLoading}
              onClick={() => handleResolve('REJECTED')}
            >
              Reject Claim
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={isLoading}
              onClick={() => handleResolve('UNDER_REVIEW')}
            >
              Mark Under Review
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              isLoading={isLoading}
              onClick={() => handleResolve('RESOLVED')}
            >
              Resolve Favor of Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
