'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Bell, X, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export function NotificationBanner() {
  const { notifications } = useSocket();
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const latest = notifications[0];

  useEffect(() => {
    if (latest && latest.id !== dismissedId) {
      const timer = setTimeout(() => {
        setDismissedId(latest.id);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [latest, dismissedId]);

  if (!latest || latest.id === dismissedId) return null;

  const icons = {
    order: <Package className="w-4 h-4 text-brand-500" />,
    inventory: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    billing: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    chat: <Bell className="w-4 h-4 text-sky-500" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border border-brand-500/30 bg-white dark:bg-slate-900 p-4 shadow-2xl backdrop-blur-md flex items-start gap-3">
        <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex-shrink-0">
          {icons[latest.type] || <Bell className="w-4 h-4 text-brand-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {latest.title}
            </h5>
            <button
              onClick={() => setDismissedId(latest.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
            {latest.message}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Real-time alert</span>
        </div>
      </div>
    </div>
  );
}
