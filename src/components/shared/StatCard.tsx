import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: any;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, icon: Icon, change, trend = 'neutral' }: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{title}</span>
        <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
        {change && (
          <span
            className={`text-[10px] font-bold ${
              trend === 'up'
                ? 'text-emerald-500'
                : trend === 'down'
                ? 'text-rose-500'
                : 'text-slate-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
