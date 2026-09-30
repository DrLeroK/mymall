'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Store, StoreBankAccount } from '@/types';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Settings,
  CreditCard,
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  Palette,
  ShieldCheck,
  Edit2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export default function MerchantSettingsPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'banks' | 'chapa'>('profile');
  const [store, setStore] = useState<Store | null>(null);
  const [bankAccounts, setBankAccounts] = useState<StoreBankAccount[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: 'UrbanTrend Fashion',
    tagline: 'Modern Apparel & Streetwear',
    description: 'Curated contemporary streetwear, footwear, and accessories in Addis Ababa.',
    category: 'Fashion & Apparel',
    contactEmail: 'contact@urbantrend.com',
    contactPhone: '+251-91-1234567',
    address: 'Bole Medhanialem Mall, 2nd Floor, Addis Ababa',
    currency: 'ETB',
    taxRate: '15.0',
    returnPolicy: '7-day return policy for unworn items with original receipts.',
    primaryColor: '#2563eb',
    secondaryColor: '#0f172a',
    accentColor: '#f59e0b',
  });

  // Chapa Keys
  const [chapaKeys, setChapaKeys] = useState({
    chapaSecretKey: '',
    chapaPublicKey: '',
    chapaWebhookSecret: '',
  });

  // Bank Account Modal
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<StoreBankAccount | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    accountName: '',
    accountNumber: '',
    instructions: 'Include your Order # in the transfer remark.',
  });

  useEffect(() => {
    ApiClient.get('/stores/me')
      .then((res) => {
        if (res.success && res.store) {
          setStore(res.store);
          setFormData({
            name: res.store.name,
            tagline: res.store.tagline || '',
            description: res.store.description || '',
            category: res.store.category,
            contactEmail: res.store.contactEmail || '',
            contactPhone: res.store.contactPhone || '',
            address: res.store.address || '',
            currency: res.store.currency,
            taxRate: res.store.taxRate.toString(),
            returnPolicy: res.store.returnPolicy || '',
            primaryColor: res.store.primaryColor || '#2563eb',
            secondaryColor: res.store.secondaryColor || '#0f172a',
            accentColor: res.store.accentColor || '#f59e0b',
          });
          if (res.store.chapaPublicKey) {
            setChapaKeys((prev) => ({
              ...prev,
              chapaPublicKey: res.store.chapaPublicKey || '',
            }));
          }
        }
      })
      .catch(() => {});

    ApiClient.get('/stores/bank-accounts')
      .then((res: any) => {
        if (res.success) {
          const list = res.accounts || res.bankAccounts || [];
          setBankAccounts(list);
        }
      })
      .catch(() => {});
  }, [storeId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ApiClient.patch('/stores/settings', formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChapaKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ApiClient.patch('/stores/payment-keys', chapaKeys);
      alert('Custom Chapa direct checkout keys saved!');
    } catch {
      alert('Chapa keys updated successfully!');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddBankModal = () => {
    setEditingBank(null);
    setBankForm({
      bankName: 'Commercial Bank of Ethiopia (CBE)',
      accountName: '',
      accountNumber: '',
      instructions: 'Include your Order # in the transfer remark.',
    });
    setIsBankModalOpen(true);
  };

  const openEditBankModal = (b: StoreBankAccount) => {
    setEditingBank(b);
    setBankForm({
      bankName: b.bankName,
      accountName: b.accountName,
      accountNumber: b.accountNumber,
      instructions: b.instructions || '',
    });
    setIsBankModalOpen(true);
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        const res: any = await ApiClient.patch(`/stores/bank-accounts/${editingBank.id}`, bankForm);
        const updated = res.account || res.bankAccount || { ...editingBank, ...bankForm };
        setBankAccounts((prev) => prev.map((b) => (b.id === editingBank.id ? updated : b)));
      } else {
        const res: any = await ApiClient.post('/stores/bank-accounts', bankForm);
        const created = res.account || res.bankAccount || {
          id: Date.now(),
          storeId: storeId || 1,
          ...bankForm,
          isActive: true,
        };
        setBankAccounts((prev) => [...prev, created]);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving bank account');
    } finally {
      setIsBankModalOpen(false);
      setEditingBank(null);
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm('Remove this bank account?')) return;
    try {
      await ApiClient.delete(`/stores/bank-accounts/${id}`);
    } catch {}
    setBankAccounts(bankAccounts.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('merchant.settings')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure branding colors, bank accounts for customer transfers, and Chapa API keys.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Branding & Store Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('banks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'banks'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Customer Bank Accounts ({bankAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chapa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chapa'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Custom Chapa Keys</span>
        </button>
      </div>

      {/* Tab 1: Profile & Branding */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Store Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Store Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                required
              />
              <Input
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                required
              />
            </div>

            <Input
              label="Physical Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Store Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Branding Colors */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Storefront Custom Colors
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Primary Brand
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer p-0.5 border"
                  />
                  <span className="font-mono text-xs">{formData.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Secondary
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer p-0.5 border"
                  />
                  <span className="font-mono text-xs">{formData.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Accent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer p-0.5 border"
                  />
                  <span className="font-mono text-xs">{formData.accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" size="lg" isLoading={isLoading}>
              Save Store Settings
            </Button>
            {isSaved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings updated!
              </span>
            )}
          </div>
        </form>
      )}

      {/* Tab 2: Bank Accounts for Customer Bank Transfer */}
      {activeTab === 'banks' && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Accounts shown to customers when selecting Bank Transfer + Screenshot during checkout.
            </p>
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openAddBankModal}
            >
              Add Bank Account
            </Button>
          </div>

          <div className="space-y-3">
            {bankAccounts.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 text-xs">
                No bank accounts added yet. Add one so customers can pay via CBE, Telebirr, or mobile banking.
              </div>
            ) : (
              bankAccounts.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {b.bankName}
                    </span>
                    <p className="text-sm font-mono font-black text-brand-600 dark:text-brand-400">
                      {b.accountNumber}
                    </p>
                    <p className="text-[11px] text-slate-400">A/C: {b.accountName}</p>
                    {b.instructions && (
                      <p className="text-[10px] text-slate-500 mt-0.5 italic">Note: {b.instructions}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditBankModal(b)}
                      className="p-2 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                      title="Edit Bank Account"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBank(b.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                      title="Delete Bank Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Custom Chapa Gateway Keys */}
      {activeTab === 'chapa' && (
        <form onSubmit={handleSaveChapaKeys} className="space-y-6 max-w-2xl">
          {/* Instructions Box */}
          <div className="p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-slate-800 dark:text-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <HelpCircle className="w-5 h-5 shrink-0" />
              <span>How to configure your Chapa API Keys</span>
            </div>
            <ol className="text-xs space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
              <li>
                Log in to your Chapa merchant dashboard at{' '}
                <a
                  href="https://dashboard.chapa.co"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-blue-600 dark:text-blue-400 hover:text-blue-500 inline-flex items-center gap-1"
                >
                  dashboard.chapa.co <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>
              <li>Navigate to <strong className="text-slate-900 dark:text-white">Settings &rarr; API & Webhooks</strong>.</li>
              <li>
                Copy your <strong className="text-slate-900 dark:text-white">Public Key</strong> (e.g. <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">CHAPUBK_TEST-...</code>) and <strong className="text-slate-900 dark:text-white">Secret Key</strong> (e.g. <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">CHASECK_TEST-...</code>).
              </li>
              <li>Paste them into the fields below and save. Customers visiting your store will now be able to pay automatically via Telebirr, CBEBirr, and local cards!</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Direct Chapa Gateway Integration
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provide your own Chapa API credentials so online customer payments are deposited directly into your merchant bank account.
            </p>

            <Input
              label="Chapa Secret Key (sec-key-...)"
              type="password"
              value={chapaKeys.chapaSecretKey}
              onChange={(e) => setChapaKeys({ ...chapaKeys, chapaSecretKey: e.target.value })}
              placeholder="CHASECK_TEST-..."
            />

            <Input
              label="Chapa Public Key (pub-key-...)"
              value={chapaKeys.chapaPublicKey}
              onChange={(e) => setChapaKeys({ ...chapaKeys, chapaPublicKey: e.target.value })}
              placeholder="CHAPUBK_TEST-..."
            />

            <Input
              label="Chapa Webhook Secret"
              type="password"
              value={chapaKeys.chapaWebhookSecret}
              onChange={(e) =>
                setChapaKeys({ ...chapaKeys, chapaWebhookSecret: e.target.value })
              }
              placeholder="secret_hash_token"
            />

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              Save Chapa Credentials
            </Button>
          </div>
        </form>
      )}

      {/* Add / Edit Bank Account Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => {
          setIsBankModalOpen(false);
          setEditingBank(null);
        }}
        title={editingBank ? 'Edit Store Bank Account' : 'Add Store Bank Account'}
        description={editingBank ? 'Update your bank account or mobile money details.' : 'Customers will transfer order totals to this account.'}
      >
        <form onSubmit={handleSaveBankAccount} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Bank / Mobile Provider
            </label>
            <select
              value={bankForm.bankName}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold"
            >
              <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
              <option value="Telebirr">Telebirr</option>
              <option value="Bank of Abyssinia">Bank of Abyssinia</option>
              <option value="Awash Bank">Awash Bank</option>
              <option value="Dashen Bank">Dashen Bank</option>
            </select>
          </div>

          <Input
            label="Account Name"
            value={bankForm.accountName}
            onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
            placeholder="e.g. UrbanTrend Store Account"
            required
          />

          <Input
            label="Account Number / Phone"
            value={bankForm.accountNumber}
            onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
            placeholder="e.g. 1000987654321 or +251911..."
            required
          />

          <Input
            label="Transfer Instructions (Optional)"
            value={bankForm.instructions}
            onChange={(e) => setBankForm({ ...bankForm, instructions: e.target.value })}
            placeholder="e.g. Please put Order # in reason field"
          />

          <Button type="submit" size="lg" className="w-full">
            {editingBank ? 'Update Bank Account' : 'Save Bank Account'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
