import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Access Denied (403)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You do not have the required permissions to access this portal or resource.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              <span>Back Home</span>
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Switch Account</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
