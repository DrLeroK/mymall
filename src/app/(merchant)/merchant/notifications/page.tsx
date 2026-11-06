'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ApiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Bell,
  CheckCheck,
  Check,
  ShoppingBag,
  AlertTriangle,
  CreditCard,
  Info,
  RefreshCw,
  Clock,
  Sparkles,
  Inbox,
  Filter,
} from 'lucide-react';

interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  isSeen: boolean;
  createdAt: string;
}

export default function MerchantNotificationsPage() {
  const { t } = useI18n();
  const { storeId, user } = useAuth();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'ORDERS' | 'STOCK' | 'BILLING'>('ALL');

  useEffect(() => {
    loadAlerts();
  }, [storeId]);

  const loadAlerts = () => {
    setIsLoading(true);
    ApiClient.get('/alerts')
      .then((res) => {
        if (res.success && res.alerts) {
          setAlerts(res.alerts);
          setUnreadCount(res.unreadCount || 0);
        } else {
          setAlerts([]);
          setUnreadCount(0);
        }
      })
      .catch(() => {
        setAlerts([]);
        setUnreadCount(0);
      })
      .finally(() => setIsLoading(false));
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await ApiClient.patch('/alerts/read-all', {});
      if (res.success) {
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
        setUnreadCount(0);
      }
    } catch {}
    finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    try {
      const res = await ApiClient.patch(`/alerts/${id}/read`, {});
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'NEW_ORDER':
        return <ShoppingBag className="w-5 h-5 text-sky-500" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'PAYMENT_RECEIVED':
      case 'SUBSCRIPTION_EXPIRING':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-brand-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'NEW_ORDER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-500/20">
            Order
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            Stock Alert
          </span>
        );
      case 'SUBSCRIPTION_EXPIRING':
      case 'PAYMENT_RECEIVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            Billing
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            System
          </span>
        );
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'UNREAD') return !a.isRead;
    if (filterType === 'ORDERS') return a.type === 'NEW_ORDER';
    if (filterType === 'STOCK') return a.type === 'LOW_STOCK';
    if (filterType === 'BILLING')
      return a.type === 'SUBSCRIPTION_EXPIRING' || a.type === 'PAYMENT_RECEIVED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-500" />
            <span>Notifications & Activity</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-500 text-white">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store updates, sales, low inventory alerts, and billing confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
              onClick={handleMarkAllRead}
              isLoading={isMarkingAll}
            >
              Mark all as read
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadAlerts}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-x-auto shadow-sm">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filterType === 'ALL'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({alerts.length})
        </button>

        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterType === 'UNREAD'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-400" />
          )}
        </button>

        <button
          onClick={() => setFilterType('ORDERS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterType === 'ORDERS'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setFilterType('STOCK')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterType === 'STOCK'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock</span>
        </button>

        <button
          onClick={() => setFilterType('BILLING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterType === 'BILLING'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Billing</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No notifications in this category
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are all caught up! New orders, stock updates, and platform messages will appear here.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !alert.isRead
                  ? 'bg-brand-500/5 dark:bg-brand-950/20'
                  : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-sm ${
                        !alert.isRead
                          ? 'font-black text-slate-900 dark:text-white'
                          : 'font-bold text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {alert.title}
                    </h4>
                    {getAlertBadge(alert.type)}
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(alert.createdAt)}</span>
                  </div>
                </div>
              </div>

              {!alert.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkSingleRead(alert.id)}
                  title="Mark as read"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-500 shrink-0 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
