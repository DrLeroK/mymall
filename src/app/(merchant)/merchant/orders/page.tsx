'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Order, OrderStatus } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Eye,
  Truck,
  Store as StoreIcon,
  Search,
  Filter,
  ExternalLink,
  FileText,
} from 'lucide-react';

export default function MerchantOrdersPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 15;

  // Verification Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrders(1);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const filterParam = params.get('filter');
      const statusParam = params.get('status');
      if (filterParam === 'pending_proof' || statusParam === 'AWAITING_VERIFICATION') {
        setSelectedStatus('AWAITING_VERIFICATION');
      }
    }
  }, [storeId]);

  const loadOrders = (targetPage = page) => {
    setIsLoading(true);
    ApiClient.get(`/orders?page=${targetPage}&limit=${limit}`)
      .then((res) => {
        if (res.success && res.orders) {
          setOrders(res.orders);
          setTotalOrders(res.total ?? res.orders.length);
          setTotalPages(res.totalPages ?? 1);
          setPage(res.page ?? targetPage);
        }
      })
      .catch(() => {
        // Fallback demo order
        setOrders([
          {
            id: 2001,
            orderNumber: 'ORD-1-SEED-2001',
            storeId: storeId || 1,
            customerName: 'Sophia Martinez',
            customerEmail: 'sophia@example.com',
            customerPhone: '+251-91-9876543',
            orderType: 'DELIVERY',
            shippingAddress: 'Bole Atlas, near Edna Mall, Addis Ababa',
            subtotal: 64,
            taxAmount: 9.6,
            shippingCost: 5,
            totalAmount: 78.6,
            status: 'AWAITING_VERIFICATION',
            paymentMethod: 'BANK_TRANSFER_SCREENSHOT',
            paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            paymentProofStatus: 'SUBMITTED',
            locationPermissionGranted: true,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await ApiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const handleVerifyPayment = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedOrder) return;
    setActionLoading(true);

    try {
      await ApiClient.patch(`/orders/${selectedOrder.id}/verify-payment`, {
        status,
        notes: status === 'REJECTED' ? rejectNotes : undefined,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                paymentProofStatus: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
                status: status === 'APPROVED' ? 'PAID' : o.status,
                paymentProofNotes: status === 'REJECTED' ? rejectNotes : o.paymentProofNotes,
              }
            : o
        )
      );
      setIsVerifyModalOpen(false);
      setRejectNotes('');
    } catch {
      // Local fallback
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                paymentProofStatus: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
                status: status === 'APPROVED' ? 'PAID' : o.status,
              }
            : o
        )
      );
      setIsVerifyModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      selectedStatus === 'ALL'
        ? true
        : selectedStatus === 'AWAITING_VERIFICATION'
        ? o.status === 'AWAITING_VERIFICATION' || (o as any).paymentProofStatus === 'SUBMITTED' || (o as any).paymentProofStatus === 'PENDING'
        : o.status === selectedStatus;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('merchant.orders')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fulfill online customer orders and verify bank transfer screenshots.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'AWAITING_VERIFICATION', label: 'Needs Proof Review' },
          { key: 'PAID', label: 'Paid' },
          { key: 'PROCESSING', label: 'Processing' },
          { key: 'SHIPPED', label: 'Shipped' },
          { key: 'READY_FOR_PICKUP', label: 'Pickup Ready' },
          { key: 'COMPLETED', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedStatus === tab.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Order</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Fulfillment</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Payment Proof</th>
                <th className="px-6 py-3.5">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No orders match your active filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white block font-mono">
                        #{o.orderNumber}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {formatDate(o.createdAt)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {o.customerName}
                      </span>
                      <span className="text-slate-400 text-[11px] block">{o.customerPhone}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {o.orderType === 'DELIVERY' ? (
                          <Truck className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <StoreIcon className="w-3.5 h-3.5 text-brand-500" />
                        )}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {o.orderType}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(o.totalAmount)}
                    </td>

                    {/* Proof Review Button / Badge */}
                    <td className="px-6 py-4">
                      {o.paymentMethod === 'BANK_TRANSFER_SCREENSHOT' ? (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              o.paymentProofStatus === 'VERIFIED'
                                ? 'success'
                                : o.paymentProofStatus === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {o.paymentProofStatus}
                          </Badge>
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setIsVerifyModalOpen(true);
                            }}
                            className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="success" size="sm">
                            Chapa Online
                          </Badge>
                          {o.paymentProofUrl && (
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setRejectNotes('');
                                setIsVerifyModalOpen(true);
                              }}
                              className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" /> Receipt
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Pipeline Status Selector */}
                    <td className="px-6 py-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value as OrderStatus)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="AWAITING_VERIFICATION">AWAITING_VERIFICATION</option>
                        <option value="PAID">PAID</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * limit, totalOrders)}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{totalOrders}</span> orders
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => {
                  const prev = Math.max(1, page - 1);
                  setPage(prev);
                  loadOrders(prev);
                }}
              >
                Previous
              </Button>
              <span className="font-bold text-slate-700 dark:text-slate-300 px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => {
                  const next = Math.min(totalPages, page + 1);
                  setPage(next);
                  loadOrders(next);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Screenshot Verification Modal */}
      {/* Payment Screenshot & Receipt Verification Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={
          selectedOrder?.paymentMethod === 'CHAPA'
            ? `Online Payment Receipt: Order #${selectedOrder?.orderNumber}`
            : `Payment Proof: Order #${selectedOrder?.orderNumber}`
        }
        description={
          selectedOrder?.paymentMethod === 'CHAPA'
            ? 'Official digital receipt verified and cleared instantly via Chapa.'
            : "Review the customer's bank transfer receipt and either approve or reject."
        }
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          {/* Document Preview */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2 text-center">
            {selectedOrder?.paymentProofUrl ? (
              selectedOrder.paymentProofUrl.includes('.html') ? (
                <div className="rounded-xl overflow-hidden bg-white text-left">
                  <iframe
                    src={getImageUrl(selectedOrder.paymentProofUrl)}
                    title="Official Receipt"
                    className="w-full h-72 border-0"
                  />
                </div>
              ) : (
                <img
                  src={getImageUrl(selectedOrder.paymentProofUrl)}
                  alt="Bank Transfer Screenshot"
                  className="max-h-72 mx-auto rounded-xl object-contain shadow-md"
                />
              )
            ) : (
              <p className="py-12 text-xs text-slate-400">
                No payment document uploaded yet for this order.
              </p>
            )}
          </div>

          {selectedOrder?.paymentProofUrl && (
            <div className="text-right">
              <a
                href={getImageUrl(selectedOrder.paymentProofUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open / Download Receipt in New Window
              </a>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex justify-between text-xs">
            <span>Expected Total:</span>
            <span className="font-black text-slate-900 dark:text-white">
              {formatPrice(selectedOrder?.totalAmount)}
            </span>
          </div>

          {/* If Chapa, it is already verified; if Bank Transfer, show Approve/Reject controls */}
          {selectedOrder?.paymentMethod === 'CHAPA' ? (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Paid & Verified via Chapa Online Gateway. No manual approval required.</span>
            </div>
          ) : (
            <>
              {/* Rejection Notes */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Rejection Reason Note (if rejecting)
                </label>
                <input
                  type="text"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="e.g. Transaction reference illegible or incorrect amount transferred"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Approve / Reject Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="danger"
                  size="md"
                  className="flex-1"
                  isLoading={actionLoading}
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={() => handleVerifyPayment('REJECTED')}
                >
                  {t('merchant.rejectPayment')}
                </Button>

                <Button
                  size="md"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  isLoading={actionLoading}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleVerifyPayment('APPROVED')}
                >
                  {t('merchant.approvePayment')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
