'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Bell, X, AlertTriangle, ShoppingBag, CreditCard, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AlertItem {
  id: number;
  title: string;
  message: string;
  type: string;
  targetType: string;
  createdAt: string;
}

export function UnseenAlertsModal() {
  const { user } = useAuth();
  const { latestPopup, clearLatestPopup } = useSocket();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchUnseen = async () => {
      try {
        const res = await ApiClient.get('/alerts/unseen');
        const list = res.popups || res.alerts;
        if (isMounted && res.success && Array.isArray(list) && list.length > 0) {
          setAlerts(list);
          setCurrentIndex(0);
          setIsOpen(true);
        }
      } catch (err) {
        // Silently ignore if unauthenticated or network error
      }
    };

    // Small delay to ensure auth state and token are fully hydrated
    const timer = setTimeout(fetchUnseen, 800);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user]);

  // Handle incoming live alerts in real-time when user is logged in
  useEffect(() => {
    if (latestPopup) {
      const incoming: AlertItem = {
        id: Number(latestPopup.id) || Date.now(),
        title: latestPopup.title,
        message: latestPopup.message,
        type: latestPopup.type,
        targetType: 'REALTIME',
        createdAt: latestPopup.timestamp,
      };
      setAlerts((prev) => [incoming, ...prev]);
      setCurrentIndex(0);
      setIsOpen(true);
    }
  }, [latestPopup]);

  if (!isOpen || alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];
  if (!currentAlert) return null;

  const handleClose = async () => {
    clearLatestPopup();
    setIsOpen(false);
    try {
      await ApiClient.patch('/alerts/seen-all', {});
    } catch {}
  };

  const handleNext = () => {
    if (currentIndex + 1 < alerts.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'ORDER':
        return <ShoppingBag className="w-6 h-6 text-emerald-500" />;
      case 'INVENTORY':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'BILLING':
        return <CreditCard className="w-6 h-6 text-indigo-500" />;
      case 'CHAT':
        return <MessageSquare className="w-6 h-6 text-sky-500" />;
      default:
        return <Info className="w-6 h-6 text-brand-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
              {getTypeIcon(currentAlert.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300">
                  {currentAlert.type || 'ALERT'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {alerts.length > 1 ? `${currentIndex + 1} of ${alerts.length}` : 'New Notification'}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {currentAlert.title}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {currentAlert.message}
        </div>

        {/* Action */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            size="md"
            onClick={handleNext}
            className="w-full sm:w-auto font-bold shadow-md shadow-brand-500/20"
          >
            {currentIndex + 1 < alerts.length ? 'Next Notification' : 'Acknowledge'}
          </Button>
        </div>
      </div>
    </div>
  );
}
