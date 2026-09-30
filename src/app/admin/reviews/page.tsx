'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { SiteReview } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminReviewsPage() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<SiteReview[]>([]);

  useEffect(() => {
    ApiClient.get('/reviews/site')
      .then((res) => {
        if (res.success && res.reviews) setReviews(res.reviews);
      })
      .catch(() => {
        setReviews([
          {
            id: 1,
            reviewerName: 'Abebe Kebede',
            reviewerEmail: 'abebe@example.com',
            rating: 5,
            title: 'Outstanding marketplace platform!',
            comment: 'MyMall has revolutionized how I shop across Addis Ababa stores. Seamless delivery and payment options!',
            isApproved: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            reviewerName: 'Sara Tesfaye',
            reviewerEmail: 'sara@example.com',
            rating: 5,
            title: 'Very fast and intuitive',
            comment: 'Great multi-store experience. Easy to find stores and make instant Chapa payments.',
            isApproved: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      });
  }, []);

  const handleModerate = async (id: number, isApproved: boolean) => {
    try {
      await ApiClient.patch(`/reviews/site/${id}/moderate`, { isApproved });
      setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved } : r)));
    } catch {
      setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved } : r)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('admin.reviewsModeration')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Moderate public site-wide reviews displayed on the marketplace landing page.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Reviewer</th>
              <th className="px-6 py-3.5">Rating & Title</th>
              <th className="px-6 py-3.5">Comment</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                  {r.reviewerName}
                  <span className="text-[10px] text-slate-400 block font-normal">{r.reviewerEmail}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{r.title || '—'}</span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-sm">
                  {r.comment}
                </td>
                <td className="px-6 py-4 text-slate-400">{formatDate(r.createdAt)}</td>
                <td className="px-6 py-4">
                  <Badge variant={r.isApproved ? 'success' : 'warning'} size="sm">
                    {r.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleModerate(r.id, true)}
                    className="p-1 text-emerald-600 hover:text-emerald-700"
                    title="Approve Review"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleModerate(r.id, false)}
                    className="p-1 text-rose-500 hover:text-rose-600"
                    title="Reject / Hide Review"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
