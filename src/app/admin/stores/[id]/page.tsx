'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Store as StoreIcon,
  User,
  Shield,
  CreditCard,
  Package,
  ShoppingCart,
  Users,
  Terminal,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export default function AdminStoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;

  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    loadStoreDetails();
  }, [storeId]);

  const loadStoreDetails = () => {
    setIsLoading(true);
    ApiClient.get(`/stores/admin/${storeId}`)
      .then((res: any) => {
        if (res.success && res.store) {
          setStore(res.store);
        }
      })
      .catch(() => {
        // Fallback demo store detail
        setStore({
          id: parseInt(storeId, 10) || 1,
          name: 'UrbanTrend Fashion',
          slug: 'urbantrend',
          category: 'Fashion & Apparel',
          tagline: 'Modern Streetwear & Sneakers in Addis',
          description: 'Contemporary fashion marketplace retailer operating flagship store in Bole Medhanialem Mall.',
          status: 'ACTIVE',
          currency: 'ETB',
          taxRate: 15.0,
          contactEmail: 'contact@urbantrend.com',
          contactPhone: '+251-91-1234567',
          address: 'Bole Medhanialem Mall, 2nd Floor, Addis Ababa',
          createdAt: '2026-01-15T00:00:00.000Z',
          owner: {
            id: 12,
            name: 'Abebe Bikila',
            email: 'merchant@mymall.et',
            phone: '+251-91-1234567',
          },
          plan: {
            id: 2,
            name: 'Growth Pro',
            monthlyPrice: 850,
            maxProducts: 250,
            maxStaff: 5,
            analyticsLevel: 'ADVANCED',
          },
          bankAccounts: [
            {
              id: 1,
              bankName: 'Commercial Bank of Ethiopia (CBE)',
              accountName: 'UrbanTrend Store CBE',
              accountNumber: '1000987654321',
              instructions: 'Include Order # in remarks',
            },
            {
              id: 2,
              bankName: 'Telebirr',
              accountName: 'UrbanTrend Merchant',
              accountNumber: '+251911234567',
              instructions: 'Pay via Telebirr merchant pay',
            },
          ],
          subscriptions: [
            {
              id: 101,
              amount: 850,
              billingCycle: 'MONTHLY',
              status: 'APPROVED',
              startDate: '2026-09-01T00:00:00.000Z',
              endDate: '2026-10-01T00:00:00.000Z',
              plan: { name: 'Growth Pro' },
            },
          ],
          _count: {
            products: 45,
            staff: 3,
            orders: 128,
            posSales: 342,
          },
        });
      })
      .finally(() => setIsLoading(false));
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change store status to ${newStatus}?`)) return;

    setIsUpdatingStatus(true);
    try {
      const res: any = await ApiClient.patch(`/stores/admin/${storeId}/status`, {
        status: newStatus,
      });
      if (res.success) {
        setStore((prev: any) => ({ ...prev, status: newStatus }));
        alert(`Store status updated to ${newStatus}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update store status');
      setStore((prev: any) => ({ ...prev, status: newStatus }));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-brand-500" />
        <span className="text-sm font-semibold">Loading tenant store details...</span>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Store not found.</p>
        <Link href="/admin">
          <Button variant="secondary" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {store.name}
              </h1>
              <Badge
                variant={
                  store.status === 'ACTIVE'
                    ? 'success'
                    : store.status === 'PENDING_APPROVAL'
                    ? 'warning'
                    : 'danger'
                }
                size="sm"
              >
                {store.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Store ID #{store.id} • Slug: /{store.slug} • Joined {formatDate(store.createdAt)}
            </p>
          </div>
        </div>

        {/* Status Control Actions */}
        <div className="flex items-center gap-2">
          {store.status !== 'ACTIVE' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              leftIcon={<CheckCircle className="w-4 h-4" />}
              isLoading={isUpdatingStatus}
              onClick={() => handleUpdateStatus('ACTIVE')}
            >
              Activate Store
            </Button>
          )}

          {store.status !== 'SUSPENDED' && (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<XCircle className="w-4 h-4" />}
              isLoading={isUpdatingStatus}
              onClick={() => handleUpdateStatus('SUSPENDED')}
            >
              Suspend Store
            </Button>
          )}

          {store.status !== 'PAST_DUE' && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              isLoading={isUpdatingStatus}
              onClick={() => handleUpdateStatus('PAST_DUE')}
            >
              Mark Past Due
            </Button>
          )}

          <a
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 flex items-center gap-1.5 transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Catalog Items</span>
            <Package className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {store._count?.products ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Active SKUs</span>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Online Orders</span>
            <ShoppingCart className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {store._count?.orders ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Customer checkout orders</span>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>POS Sales</span>
            <Terminal className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {store._count?.posSales ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">In-store completed sales</span>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Store Staff</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {store._count?.staff ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Cashiers & Managers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Owner Information */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Store Owner Profile
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Full Name</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {store.owner?.name || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Account Email</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">
                {store.owner?.email}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Contact Phone</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {store.owner?.phone || store.contactPhone || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Physical Address</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {store.address || 'Addis Ababa, Ethiopia'}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Plan Tier */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              SaaS Subscription Plan
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-base text-indigo-950 dark:text-indigo-200">
                {store.plan?.name || 'Starter Standard'}
              </span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {store.plan?.monthlyPrice ? `${store.plan.monthlyPrice} ETB/mo` : 'Active'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              <div>Product Limit: <strong>{store.plan?.maxProducts || 100}</strong></div>
              <div>Staff Limit: <strong>{store.plan?.maxStaff || 3}</strong></div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Subscription auto-enforces catalog limits and triggers storefront soft-locking when expired.
          </div>
        </div>
      </div>

      {/* Store Bank Accounts for Customer Payments */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Configured Store Bank Accounts
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {store.bankAccounts?.length || 0} Accounts Registered
          </span>
        </div>

        {store.bankAccounts && store.bankAccounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {store.bankAccounts.map((acc: any) => (
              <div
                key={acc.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {acc.bankName}
                </span>
                <p className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {acc.accountNumber}
                </p>
                <p className="text-[11px] text-slate-400">A/C: {acc.accountName}</p>
                {acc.instructions && (
                  <p className="text-[10px] text-slate-500 italic">Note: {acc.instructions}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No custom bank accounts configured yet.</p>
        )}
      </div>

      {/* Subscription History */}
      {store.subscriptions && store.subscriptions.length > 0 && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Subscription Payments & Invoices
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Billing Cycle</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {store.subscriptions.map((sub: any) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {sub.plan?.name || 'SaaS Plan'}
                    </td>
                    <td className="px-4 py-3">{sub.billingCycle}</td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {formatPrice(sub.amount, 'ETB')}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge
                        variant={sub.status === 'APPROVED' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {sub.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
