'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { Order, CustomerAddress, Dispute } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Package,
  MapPin,
  ShieldAlert,
  Store,
  Plus,
  ArrowRight,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';

export default function CustomerPortalPage() {
  const { t } = useI18n();
  const { user, chooseRole, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'disputes'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  // Personal Info Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!profileName && user.name) setProfileName(user.name);
      if (!profilePhone && user.phone) setProfilePhone(user.phone);
    }
  }, [user]);

  // Sync tab with URL search parameter if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam === 'profile' || tabParam === 'addresses' || tabParam === 'disputes' || tabParam === 'orders') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const res = await ApiClient.patch('/auth/profile', {
        name: profileName,
        phone: profilePhone,
      });
      if (res.success) {
        setProfileMessage('Personal details updated successfully!');
        setTimeout(() => setProfileMessage(null), 3000);
      } else {
        setProfileMessage(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileMessage(err.message || 'Error updating profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Address modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    recipientName: user?.name || '',
    recipientPhone: user?.phone || '+251 9',
    streetAddress: '',
    city: 'Addis Ababa',
    deliveryInstructions: '',
  });

  useEffect(() => {
    if (!ApiClient.getAccessToken()) return;

    // Load customer orders
    ApiClient.get('/orders')
      .then((res) => {
        if (res.success && res.orders) setOrders(res.orders);
      })
      .catch(() => {});

    // Load saved customer addresses
    ApiClient.get('/addresses')
      .then((res) => {
        if (res.success && res.addresses) setAddresses(res.addresses);
      })
      .catch(() => {});

    // Load customer disputes
    ApiClient.get('/disputes')
      .then((res) => {
        if (res.success && res.disputes) setDisputes(res.disputes);
      })
      .catch(() => {});
  }, []);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.post('/addresses', addressForm);
      if (res.success && res.address) {
        setAddresses([...addresses, res.address]);
        setIsAddressModalOpen(false);
      }
    } catch {
      // Fallback local update
      setAddresses([
        ...addresses,
        {
          id: Date.now(),
          userId: user?.id || 1,
          ...addressForm,
          isDefault: addresses.length === 0,
        },
      ]);
      setIsAddressModalOpen(false);
    }
  };

  const handleUpgradeToMerchant = async () => {
    if (confirm('Upgrade your account to Store Owner? You can onboard your store immediately!')) {
      const ok = await chooseRole('STORE_OWNER');
      if (ok) {
        window.location.href = '/merchant/onboard';
      }
    }
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Customer Sign In Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Please sign in to view your order history, track deliveries, manage saved GPS addresses, and file disputes.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full shadow-md font-bold">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {user?.name || 'Customer Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="brand" size="sm">
                Role: {user?.role || 'CUSTOMER'}
              </Badge>
              {user?.isEmailVerified && (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade to Store Owner CTA */}
        {user?.role === 'CUSTOMER' && (
          <div className="p-4 rounded-2xl border border-brand-500/20 bg-brand-50/50 dark:bg-brand-950/40 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Want to sell products?
              </h4>
              <p className="text-[11px] text-slate-500">Open your store & access cashier POS</p>
            </div>
            <Button size="sm" onClick={handleUpgradeToMerchant} leftIcon={<Store className="w-4 h-4" />}>
              Open Store
            </Button>
          </div>
        )}
      </div>

      {/* Tabs: Orders, Addresses, Disputes */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'addresses'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'disputes'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Support & Disputes ({disputes.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-2">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No orders placed yet.
              </h4>
              <p className="text-xs text-slate-400">Browse marketplace stores to make your first purchase!</p>
              <Link href="/explore" className="inline-block pt-2">
                <Button size="sm">Explore Stores</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
              {orders.map((ord) => (
                <div key={ord.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Order #{ord.orderNumber}
                      </span>
                      <Badge variant="brand" size="sm">
                        {ord.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Date: {formatDate(ord.createdAt)} • Type: {ord.orderType}
                    </p>
                    <p className="text-xs font-black text-brand-600 dark:text-brand-400">
                      Total: {formatPrice(ord.totalAmount)}
                    </p>
                  </div>

                  <Link href={`/orders/${ord.id}`}>
                    <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Track & View Proof
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Personal Profile */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Information & Identity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your customer contact details used for orders, communications, and courier delivery handoffs.
            </p>
          </div>

          {profileMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <Input
              label="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Sophia Martinez"
              required
            />

            <Input
              label="Phone Number"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              placeholder="+251-91-9876543"
              required
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address (Account Identity)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Email address cannot be changed as it is securely linked to your account identity, orders, and receipts.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" size="md" isLoading={profileSaving} className="font-bold">
                Save Personal Details
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddressModalOpen(true)}
            >
              Add New Address
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="default" size="sm">
                    {addr.label}
                  </Badge>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-emerald-600">Default</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {addr.recipientName}
                </h4>
                <p className="text-xs text-slate-500">{addr.recipientPhone}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {addr.streetAddress}, {addr.city}
                </p>
                {addr.deliveryInstructions && (
                  <p className="text-[11px] text-slate-400 italic">
                    &quot;{addr.deliveryInstructions}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Disputes */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No active disputes or reports.
              </h4>
              <p className="text-xs text-slate-400">All your transactions are in good standing!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
              {disputes.map((d) => (
                <div key={d.id} className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Case #{d.disputeNumber} - {d.title}
                      </span>
                      <Badge variant={d.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                        {d.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{d.description}</p>
                    {d.resolutionNotes && (
                      <p className="text-xs text-emerald-600 font-semibold">
                        Resolution: {d.resolutionNotes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Delivery Address"
      >
        <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
          <Input
            label="Address Label"
            value={addressForm.label}
            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
            placeholder="e.g. Home, Office, Work"
            required
          />
          <Input
            label="Recipient Name"
            value={addressForm.recipientName}
            onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
            required
          />
          <Input
            label="Recipient Phone"
            value={addressForm.recipientPhone}
            onChange={(e) => setAddressForm({ ...addressForm, recipientPhone: e.target.value })}
            required
          />
          <Input
            label="Street Address"
            value={addressForm.streetAddress}
            onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
            placeholder="e.g. Bole Medhanialem, Next to Mafi City Mall"
            required
          />
          <Input
            label="Delivery Instructions"
            value={addressForm.deliveryInstructions}
            onChange={(e) =>
              setAddressForm({ ...addressForm, deliveryInstructions: e.target.value })
            }
            placeholder="e.g. Call upon arrival at compound gate"
          />
          <Button type="submit" className="w-full">
            Save Address
          </Button>
        </form>
      </Modal>
    </div>
  );
}
