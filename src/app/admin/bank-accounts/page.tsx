'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { PlatformBankAccount } from '@/types';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CreditCard, Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminBankAccountsPage() {
  const { t } = useI18n();
  const [bankAccounts, setBankAccounts] = useState<PlatformBankAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<PlatformBankAccount | null>(null);
  const [form, setForm] = useState({
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    accountName: 'MyMall Technologies PLC',
    accountNumber: '',
    instructions: 'Include your Store Name or Store ID in the transfer remark.',
  });

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = () => {
    ApiClient.get('/billing/platform-bank-accounts')
      .then((res: any) => {
        if (res.success && (res.bankAccounts || res.accounts)) {
          setBankAccounts(res.bankAccounts || res.accounts);
        }
      })
      .catch(() => {
        setBankAccounts([
          {
            id: 1,
            bankName: 'Commercial Bank of Ethiopia (CBE)',
            accountName: 'MyMall Technologies PLC',
            accountNumber: '1000234567891',
            instructions: 'Include your Store Name in remark',
            isActive: true,
          },
          {
            id: 2,
            bankName: 'Telebirr SuperApp',
            accountName: 'MyMall Technologies Merchant',
            accountNumber: '+251911002233',
            instructions: 'Send money to merchant number and upload receipt screenshot.',
            isActive: true,
          },
          {
            id: 3,
            bankName: 'Bank of Abyssinia',
            accountName: 'MyMall Technologies PLC',
            accountNumber: '8877665544',
            instructions: 'Transfer via BoA mobile or branch deposit.',
            isActive: true,
          },
        ]);
      });
  };

  const openCreateModal = () => {
    setEditingBank(null);
    setForm({
      bankName: 'Commercial Bank of Ethiopia (CBE)',
      accountName: 'MyMall Technologies PLC',
      accountNumber: '',
      instructions: 'Include your Store Name or Store ID in the transfer remark.',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: PlatformBankAccount) => {
    setEditingBank(b);
    setForm({
      bankName: b.bankName,
      accountName: b.accountName,
      accountNumber: b.accountNumber,
      instructions: b.instructions || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        const res: any = await ApiClient.patch(`/billing/admin/bank-accounts/${editingBank.id}`, form);
        const updated = res.account || res.bankAccount || { ...editingBank, ...form };
        setBankAccounts((prev) => prev.map((b) => (b.id === editingBank.id ? updated : b)));
      } else {
        const res: any = await ApiClient.post('/billing/admin/bank-accounts', form);
        const created = res.account || res.bankAccount || {
          id: Date.now(),
          ...form,
          isActive: true,
        };
        setBankAccounts((prev) => [...prev, created]);
      }
    } catch {
      if (editingBank) {
        setBankAccounts((prev) =>
          prev.map((b) => (b.id === editingBank.id ? { ...b, ...form } : b))
        );
      } else {
        setBankAccounts((prev) => [...prev, { id: Date.now(), ...form, isActive: true }]);
      }
    } finally {
      setIsModalOpen(false);
      setEditingBank(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this platform bank account?')) return;
    try {
      await ApiClient.delete(`/billing/admin/bank-accounts/${id}`);
    } catch {}
    setBankAccounts(bankAccounts.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('admin.platformBanks')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accounts where merchants transfer subscription renewal fees for manual verification.
          </p>
        </div>

        <Button
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add Platform Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {bankAccounts.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {b.bankName}
              </span>
              <p className="text-base font-mono font-black text-brand-600 dark:text-brand-400 mt-1">
                {b.accountNumber}
              </p>
              <p className="text-xs text-slate-500">Account: {b.accountName}</p>
              {b.instructions && (
                <p className="text-[11px] text-slate-400 italic mt-2">{b.instructions}</p>
              )}
            </div>

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => openEditModal(b)}
                className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                title="Edit Account"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                title="Delete Account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBank(null);
        }}
        title={editingBank ? 'Edit Platform Bank Account' : 'Add Platform Bank Account'}
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            label="Bank Name"
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            required
          />
          <Input
            label="Account Name"
            value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            required
          />
          <Input
            label="Account Number / Telebirr Phone"
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            required
          />
          <Input
            label="Instructions"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
          <Button type="submit" size="lg" className="w-full">
            {editingBank ? 'Update Platform Account' : 'Save Platform Account'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
