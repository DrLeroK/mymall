'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { SubscriptionPlan } from '@/types';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Zap, Plus, Edit2, Check, Sparkles } from 'lucide-react';

export default function AdminPlansPage() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    monthlyPrice: '29.99',
    threeMonthsPrice: '79.99',
    sixMonthsPrice: '149.99',
    yearlyPrice: '299.99',
    maxProducts: '100',
    maxStaff: '3',
    searchRankBoost: '1',
    analyticsLevel: 'BASIC',
    customDomainAllowed: false,
  });

  useEffect(() => {
    ApiClient.get('/billing/plans')
      .then((res) => {
        if (res.success && res.plans) setPlans(res.plans);
      })
      .catch(() => {
        setPlans([
          {
            id: 1,
            name: 'Starter',
            description: 'Small retail shops getting started online & in-store.',
            monthlyPrice: 29.99,
            threeMonthsPrice: 79.99,
            sixMonthsPrice: 149.99,
            yearlyPrice: 299.99,
            maxProducts: 50,
            maxStaff: 2,
            searchRankBoost: 1,
            analyticsLevel: 'BASIC',
            customDomainAllowed: false,
            isActive: true,
          },
          {
            id: 2,
            name: 'Professional',
            description: 'Growing brands needing marketplace boost & POS.',
            monthlyPrice: 79.99,
            threeMonthsPrice: 219.99,
            sixMonthsPrice: 419.99,
            yearlyPrice: 799.99,
            maxProducts: 500,
            maxStaff: 10,
            searchRankBoost: 5,
            analyticsLevel: 'ADVANCED',
            customDomainAllowed: true,
            isActive: true,
          },
          {
            id: 3,
            name: 'Enterprise',
            description: 'Unlimited volume, top search boost, and 24/7 dedicated support.',
            monthlyPrice: 199.99,
            threeMonthsPrice: 539.99,
            sixMonthsPrice: 999.99,
            yearlyPrice: 1999.99,
            maxProducts: 10000,
            maxStaff: 50,
            searchRankBoost: 10,
            analyticsLevel: 'PRO',
            customDomainAllowed: true,
            isActive: true,
          },
        ]);
      });
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      description: '',
      monthlyPrice: '49.99',
      threeMonthsPrice: '129.99',
      sixMonthsPrice: '249.99',
      yearlyPrice: '499.99',
      maxProducts: '200',
      maxStaff: '5',
      searchRankBoost: '3',
      analyticsLevel: 'ADVANCED',
      customDomainAllowed: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: SubscriptionPlan) => {
    setEditingPlan(p);
    setForm({
      name: p.name,
      description: p.description || '',
      monthlyPrice: p.monthlyPrice.toString(),
      threeMonthsPrice: p.threeMonthsPrice.toString(),
      sixMonthsPrice: p.sixMonthsPrice.toString(),
      yearlyPrice: p.yearlyPrice.toString(),
      maxProducts: p.maxProducts.toString(),
      maxStaff: p.maxStaff.toString(),
      searchRankBoost: p.searchRankBoost.toString(),
      analyticsLevel: p.analyticsLevel,
      customDomainAllowed: p.customDomainAllowed,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      monthlyPrice: parseFloat(form.monthlyPrice),
      threeMonthsPrice: parseFloat(form.threeMonthsPrice),
      sixMonthsPrice: parseFloat(form.sixMonthsPrice),
      yearlyPrice: parseFloat(form.yearlyPrice),
      maxProducts: parseInt(form.maxProducts, 10),
      maxStaff: parseInt(form.maxStaff, 10),
      searchRankBoost: parseInt(form.searchRankBoost, 10),
    };

    if (editingPlan) {
      setPlans(plans.map((p) => (p.id === editingPlan.id ? { ...p, ...payload } : p)));
    } else {
      setPlans([...plans, { id: Date.now(), ...payload, isActive: true }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('admin.plansManagement')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure subscription tiers, multi-cycle discounts, and search ranking boost multipliers.
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h3>
                <button
                  onClick={() => openEditModal(plan)}
                  className="p-1 text-slate-400 hover:text-brand-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{plan.description}</p>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs shadow-inner">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Monthly:</span>
                  <span className="text-brand-600 dark:text-brand-400 font-extrabold">${plan.monthlyPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>3 Months:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${plan.threeMonthsPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>6 Months:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${plan.sixMonthsPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Yearly:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">${plan.yearlyPrice}</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5 font-bold text-brand-600">
                  <Sparkles className="w-3.5 h-3.5" /> {plan.searchRankBoost}x Search Boost Multiplier
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Max Products: {plan.maxProducts}
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Max Staff: {plan.maxStaff}
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Analytics: {plan.analyticsLevel}
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            label="Plan Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Input
              label="1 Month ($)"
              value={form.monthlyPrice}
              onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
              required
            />
            <Input
              label="3 Months ($)"
              value={form.threeMonthsPrice}
              onChange={(e) => setForm({ ...form, threeMonthsPrice: e.target.value })}
              required
            />
            <Input
              label="6 Months ($)"
              value={form.sixMonthsPrice}
              onChange={(e) => setForm({ ...form, sixMonthsPrice: e.target.value })}
              required
            />
            <Input
              label="12 Months ($)"
              value={form.yearlyPrice}
              onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Max Products"
              type="number"
              value={form.maxProducts}
              onChange={(e) => setForm({ ...form, maxProducts: e.target.value })}
              required
            />
            <Input
              label="Max Staff"
              type="number"
              value={form.maxStaff}
              onChange={(e) => setForm({ ...form, maxStaff: e.target.value })}
              required
            />
            <Input
              label="Search Boost (1-10)"
              type="number"
              value={form.searchRankBoost}
              onChange={(e) => setForm({ ...form, searchRankBoost: e.target.value })}
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            Save Plan
          </Button>
        </form>
      </Modal>
    </div>
  );
}
