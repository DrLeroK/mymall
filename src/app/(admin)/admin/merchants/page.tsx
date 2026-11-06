'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import {
  Users,
  Store,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Package,
  ShoppingBag,
  CreditCard,
  Building,
  RefreshCw,
  Eye,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface OwnedStore {
  id: number;
  name: string;
  slug: string;
  status: string;
  category?: string;
  createdAt: string;
  plan?: {
    id: number;
    name: string;
    monthlyPrice: number;
  };
  _count: {
    products: number;
    orders: number;
    staff: number;
    posSales?: number;
  };
  subscriptions?: Array<{
    id: number;
    status: string;
    startDate: string;
    endDate: string;
    plan?: {
      name: string;
      monthlyPrice: number;
    };
  }>;
}

interface StoreOwner {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  ownedStores: OwnedStore[];
}

export default function AdminStoreOwnersPage() {
  const [owners, setOwners] = useState<StoreOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<StoreOwner | null>(null);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get<any>('/stores/admin/owners');
      if (res && res.owners) {
        setOwners(res.owners);
      }
    } catch (err) {
      console.error('Failed to load store owners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // Filtered owners
  const filteredOwners = owners.filter((owner) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      owner.name.toLowerCase().includes(term) ||
      owner.email.toLowerCase().includes(term) ||
      (owner.phone && owner.phone.toLowerCase().includes(term)) ||
      owner.ownedStores.some(
        (s) => s.name.toLowerCase().includes(term) || s.slug.toLowerCase().includes(term)
      );

    const matchesVerified =
      verifiedFilter === 'all'
        ? true
        : verifiedFilter === 'verified'
        ? owner.isEmailVerified
        : !owner.isEmailVerified;

    return matchesSearch && matchesVerified;
  });

  // Analytics Metrics
  const totalOwners = owners.length;
  const verifiedCount = owners.filter((o) => o.isEmailVerified).length;
  const totalStores = owners.reduce((sum, o) => sum + (o.ownedStores ? o.ownedStores.length : 0), 0);
  const totalProducts = owners.reduce(
    (sum, o) =>
      sum +
      (o.ownedStores
        ? o.ownedStores.reduce((sSum, s) => sSum + (s._count?.products || 0), 0)
        : 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Store Owners & Merchants Directory
            </h1>
            <Badge variant="outline" className="font-bold border-brand-500/30 text-brand-600 bg-brand-50 dark:bg-brand-950/40">
              Platform Registry
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete records of registered store proprietors, multi-tenant portfolios, verification status, and store volume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchOwners}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
          <Link href="/admin">
            <Button size="sm" variant="outline">
              Back to Overview
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Store Owners</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalOwners}</h3>
            <p className="text-[10px] text-slate-400">Registered merchants</p>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Profiles</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{verifiedCount}</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {totalOwners > 0 ? Math.round((verifiedCount / totalOwners) * 100) : 0}% verification rate
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Stores Managed</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalStores}</h3>
            <p className="text-[10px] text-slate-400">Multi-tenant instances</p>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Platform Catalog Items</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalProducts}</h3>
            <p className="text-[10px] text-slate-400">Across all store inventories</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by owner name, email, phone, or store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Verification:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setVerifiedFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  verifiedFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({owners.length})
              </button>
              <button
                onClick={() => setVerifiedFilter('verified')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  verifiedFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-emerald-600'
                }`}
              >
                Verified ({verifiedCount})
              </button>
              <button
                onClick={() => setVerifiedFilter('unverified')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  verifiedFilter === 'unverified'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-amber-600'
                }`}
              >
                Unverified ({owners.length - verifiedCount})
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Owners Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading store owners registry...</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Store Owners Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchTerm ? 'No registered merchant matches your search term.' : 'There are currently no registered store owners in the system.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Owner Identity</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Owned Stores</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredOwners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Owner Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                          {owner.name ? owner.name.substring(0, 2) : 'SO'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{owner.name}</p>
                          <span className="text-[10px] text-slate-400">UID: #{owner.id} &bull; {owner.role}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium truncate max-w-[180px]">{owner.email}</span>
                      </div>
                      {owner.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{owner.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Verification */}
                    <td className="py-3.5 px-4">
                      {owner.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Owned Stores */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="font-bold text-[10px]">
                            {owner.ownedStores?.length || 0} Stores
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {owner.ownedStores?.slice(0, 2).map((store) => (
                            <span
                              key={store.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              <Store className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate max-w-[100px]">{store.name}</span>
                            </span>
                          ))}
                          {(owner.ownedStores?.length || 0) > 2 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{owner.ownedStores.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatDate(owner.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOwner(owner)}
                        className="font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Owner Detail & Store Portfolio Modal */}
      {selectedOwner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm uppercase">
                  {selectedOwner.name ? selectedOwner.name.substring(0, 2) : 'SO'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedOwner.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Proprietor Profile &bull; ID #{selectedOwner.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOwner(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Email Address</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {selectedOwner.email}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Phone Number</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedOwner.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Email Status</p>
                <p className="mt-0.5">
                  {selectedOwner.isEmailVerified ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Pending Verification
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Account Role</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedOwner.role}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Member Since</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatDate(selectedOwner.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Total Stores</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedOwner.ownedStores?.length || 0} Instances
                </p>
              </div>
            </div>

            {/* Owned Stores List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Managed Store Instances ({selectedOwner.ownedStores?.length || 0})
              </h4>

              {(!selectedOwner.ownedStores || selectedOwner.ownedStores.length === 0) ? (
                <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  This owner has not created or onboarded any stores yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedOwner.ownedStores.map((store) => (
                    <div
                      key={store.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-brand-500" />
                          <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                            {store.name}
                          </h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            /{store.slug}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              store.status === 'ACTIVE'
                                ? 'success'
                                : store.status === 'SUSPENDED'
                                ? 'danger'
                                : 'warning'
                            }
                            className="text-[10px] uppercase font-bold"
                          >
                            {store.status}
                          </Badge>
                          <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                            {store.plan?.name || 'Standard Plan'}
                          </span>
                        </div>
                      </div>

                      {/* Store Metrics Grid */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-center text-xs">
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Products</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                            {store._count?.products || 0}
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Orders</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                            {store._count?.orders || 0}
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Staff</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                            {store._count?.staff || 0}
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">POS Sales</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                            {store._count?.posSales || 0}
                          </p>
                        </div>
                      </div>

                      {/* Active Subscription Details if available */}
                      {store.subscriptions && store.subscriptions.length > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                          <div className="flex items-center gap-1.5 font-medium">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Active Subscription: <strong className="text-slate-800 dark:text-slate-200">{store.subscriptions[0].plan?.name}</strong></span>
                          </div>
                          <span>
                            Valid until: {formatDate(store.subscriptions[0].endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" variant="secondary" onClick={() => setSelectedOwner(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
