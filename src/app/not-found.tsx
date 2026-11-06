import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Page Not Found (404)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The page or storefront you are looking for does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              <span>Return to Marketplace</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
