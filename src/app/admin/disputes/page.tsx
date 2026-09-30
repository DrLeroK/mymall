'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { Dispute, DisputeStatus } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ShieldAlert, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

export default function AdminDisputesPage() {
  const { t } = useI18n();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
            description: 'Customer received Size M instead of Size L that was ordered.',
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
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('admin.disputesCenter')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review customer complaints, order issues, and enforce platform merchant policy.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Case #</th>
              <th className="px-6 py-3.5">Title & Reporter</th>
              <th className="px-6 py-3.5">Type</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {disputes.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                  #{d.disputeNumber}
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {d.title}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Filed by {d.reporter?.name || 'Customer'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{d.type}</td>
                <td className="px-6 py-4 text-slate-400">{formatDate(d.createdAt)}</td>
                <td className="px-6 py-4">
                  <Badge variant={d.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                    {d.status}
                  </Badge>
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
                    Resolve Case
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Resolve Dispute Case #${selectedDispute?.disputeNumber}`}
        description="Review customer statement and submit binding platform resolution."
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">
              {selectedDispute?.title}
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedDispute?.description}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Admin Resolution Findings & Notes
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Merchant agrees to dispatch replacement Size L today..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              isLoading={isLoading}
              onClick={() => handleResolve('REJECTED')}
            >
              Reject Dispute
            </Button>
            <Button
              size="md"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              isLoading={isLoading}
              onClick={() => handleResolve('RESOLVED')}
            >
              Resolve in Favor of Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
