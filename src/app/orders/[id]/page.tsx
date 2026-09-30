'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Order, OrderStatus } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  AlertTriangle,
  Upload,
  MessageSquare,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const { t } = useI18n();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dispute modal
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    title: '',
    description: '',
    type: 'ORDER_ISSUE',
  });
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  // Re-upload proof modal
  const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [reuploadPreview, setReuploadPreview] = useState<string | null>(null);
  const [reuploadLoading, setReuploadLoading] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    ApiClient.get(`/orders/${orderId}`)
      .then((res) => {
        if (res.success && res.order) {
          setOrder(res.order);
        }
      })
      .catch(() => {
        // Fallback demo order
        setOrder({
          id: parseInt(orderId, 10) || 101,
          orderNumber: `ORD-MALL-${orderId}`,
          storeId: 1,
          customerName: 'Customer Name',
          customerEmail: 'customer@example.com',
          customerPhone: '+251-91-1234567',
          orderType: 'DELIVERY',
          shippingAddress: 'Bole Atlas, near Edna Mall, Addis Ababa',
          subtotal: 1850,
          taxAmount: 277.5,
          shippingCost: 150,
          totalAmount: 2277.5,
          status: 'AWAITING_VERIFICATION',
          paymentMethod: 'BANK_TRANSFER_SCREENSHOT',
          paymentProofStatus: 'SUBMITTED',
          locationPermissionGranted: true,
          items: [
            {
              id: 1,
              orderId: parseInt(orderId, 10) || 101,
              productId: 1,
              product: {
                id: 1,
                storeId: 1,
                name: 'Oversized Vintage Hoodie',
                slug: 'oversized-vintage-hoodie',
                costPrice: 650,
                sellingPrice: 1850,
                stockQuantity: 45,
                lowStockThreshold: 10,
                unit: 'pcs',
                images: JSON.stringify(['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80']),
                isActive: true,
                hasVariants: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              quantity: 1,
              unitPrice: 1850,
              subtotal: 1850,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      })
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleReuploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reuploadFile) return;

    setReuploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', reuploadFile);
      formData.append('notes', 'Customer re-uploaded receipt');

      const res = await ApiClient.post(`/orders/${orderId}/payment-proof`, formData);
      if (res.success) {
        setIsReuploadModalOpen(false);
        alert('Proof re-uploaded successfully! Store merchant will verify shortly.');
        window.location.reload();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to upload proof');
    } finally {
      setReuploadLoading(false);
    }
  };

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeSubmitting(true);
    try {
      const res = await ApiClient.post('/disputes', {
        ...disputeForm,
        orderId: parseInt(orderId, 10),
        storeId: order?.storeId,
      });
      if (res.success) {
        setDisputeSuccess(true);
        setTimeout(() => {
          setIsDisputeModalOpen(false);
          setDisputeSuccess(false);
        }, 1500);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to file dispute');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading order status...
      </div>
    );
  }

  // 6 Pipeline Stages
  const stages: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Order received in system' },
    { key: 'AWAITING_VERIFICATION', label: 'Verifying Payment', desc: 'Bank transfer receipt under merchant review' },
    { key: 'PAID', label: 'Payment Approved', desc: 'Receipt confirmed by merchant' },
    { key: 'PROCESSING', label: 'Preparing', desc: 'Merchant packaging items' },
    { key: order.orderType === 'PICKUP' ? 'READY_FOR_PICKUP' : 'SHIPPED', label: order.orderType === 'PICKUP' ? 'Ready for Pickup' : 'Out for Delivery', desc: order.orderType === 'PICKUP' ? 'Available at store counter' : 'Dispatched to your address' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Fulfilled & delivered' },
  ];

  const statusOrder: OrderStatus[] = [
    'PENDING',
    'AWAITING_VERIFICATION',
    'PAID',
    'PROCESSING',
    order.orderType === 'PICKUP' ? 'READY_FOR_PICKUP' : 'SHIPPED',
    'COMPLETED',
  ];

  const currentIdx = statusOrder.indexOf(order.status as OrderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            href="/customer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-brand-500 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Order #{order.orderNumber}
            </h1>
            <Badge variant="brand" size="md">
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Dispute & Chat actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
            onClick={() => setIsDisputeModalOpen(true)}
          >
            File a Dispute
          </Button>
        </div>
      </div>

      {/* Visual Pipeline Progress Timeline */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Fulfillment Timeline
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {stages.map((stage, idx) => {
            const isDone = currentIdx >= idx;
            const isCurrent = currentIdx === idx;

            return (
              <div key={stage.key} className="flex flex-col items-center text-center space-y-2 relative">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all shadow-md ${
                    isDone
                      ? 'bg-brand-500 text-white shadow-brand-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-brand-500/20 scale-110' : ''}`}
                >
                  {isDone ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <h5 className={`text-xs font-bold leading-tight ${isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {stage.label}
                </h5>
                <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Proof Status Banner */}
      {order.paymentMethod === 'BANK_TRANSFER_SCREENSHOT' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment Verification
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Proof Status:
              </span>
              <Badge
                variant={
                  order.paymentProofStatus === 'VERIFIED'
                    ? 'success'
                    : order.paymentProofStatus === 'REJECTED'
                    ? 'danger'
                    : 'warning'
                }
                size="sm"
              >
                {order.paymentProofStatus}
              </Badge>
            </div>
            {order.paymentProofNotes && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                Merchant Note: {order.paymentProofNotes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {order.paymentProofUrl && (
              <div
                onClick={() => setIsScreenshotModalOpen(true)}
                className="cursor-pointer group relative w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 hover:ring-2 hover:ring-brand-500 transition-all"
                title="Click to view full payment screenshot"
              >
                <img
                  src={getImageUrl(order.paymentProofUrl)}
                  alt="Payment Receipt"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                  View
                </div>
              </div>
            )}

            {order.paymentProofStatus === 'REJECTED' || order.paymentProofStatus === 'NONE' ? (
              <Button
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => setIsReuploadModalOpen(true)}
              >
                Upload Valid Receipt Screenshot
              </Button>
            ) : (
              <div className="space-y-1">
                <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Receipt Attached
                </span>
                {order.paymentProofUrl && (
                  <button
                    onClick={() => setIsScreenshotModalOpen(true)}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline block"
                  >
                    View Full Screenshot
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      <Modal
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        title="Payment Transfer Screenshot"
        description={`Bank receipt uploaded for Order #${order.orderNumber}`}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          {order.paymentProofUrl ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center p-2">
              <img
                src={getImageUrl(order.paymentProofUrl)}
                alt="Payment Receipt Full"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500">No payment screenshot file found.</p>
          )}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsScreenshotModalOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Items Table & Delivery Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Items in Order
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {item.product.name}
                  </h4>
                  <p className="text-slate-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Total Paid</span>
              <span className="text-brand-600 dark:text-brand-400">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Delivery & Customer
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block">Recipient:</span>
              <span className="font-bold text-slate-900 dark:text-white">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Phone:</span>
              <span className="font-bold text-slate-900 dark:text-white">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Address:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {order.shippingAddress || 'In-store Pickup at Merchant Counter'}
              </span>
            </div>
            {order.deliveryInstructions && (
              <div>
                <span className="text-slate-400 block">Instructions:</span>
                <span className="text-slate-700 dark:text-slate-300 italic">{order.deliveryInstructions}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Re-upload Modal */}
      <Modal
        isOpen={isReuploadModalOpen}
        onClose={() => setIsReuploadModalOpen(false)}
        title="Re-Upload Bank Transfer Proof"
      >
        <form onSubmit={handleReuploadProof} className="space-y-4 pt-2">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center">
            <input
              type="file"
              accept="image/*"
              id="proof-reupload"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setReuploadFile(e.target.files[0]);
                  setReuploadPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="hidden"
            />
            <label htmlFor="proof-reupload" className="cursor-pointer block space-y-2">
              {reuploadPreview ? (
                <img src={reuploadPreview} alt="" className="max-h-36 mx-auto rounded-xl shadow" />
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-brand-500 mx-auto" />
                  <p className="text-xs font-bold">Select transfer screenshot</p>
                </div>
              )}
            </label>
          </div>
          <Button type="submit" isLoading={reuploadLoading} className="w-full">
            Submit for Merchant Review
          </Button>
        </form>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="File a Dispute / Report Issue"
        description="Our platform administration team reviews all disputes between buyers and sellers."
      >
        {disputeSuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold">Dispute Filed</h4>
            <p className="text-xs text-slate-500">Platform admins will review and contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleFileDispute} className="space-y-4 pt-2">
            <Input
              label="Subject / Title"
              value={disputeForm.title}
              onChange={(e) => setDisputeForm({ ...disputeForm, title: e.target.value })}
              placeholder="e.g. Item not delivered or wrong size"
              required
            />
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Detailed Description
              </label>
              <textarea
                rows={3}
                required
                value={disputeForm.description}
                onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Explain the issue with order or payment..."
              />
            </div>
            <Button type="submit" isLoading={disputeSubmitting} className="w-full">
              Submit Dispute
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
