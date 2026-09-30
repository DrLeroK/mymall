'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Star, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface PlatformReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SiteReview {
  id: number;
  reviewerName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export function PlatformReviewModal({ isOpen, onClose }: PlatformReviewModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'view' | 'write'>('view');
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [summary, setSummary] = useState({ avgRating: 5.0, totalReviews: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (!reviewerName && user.name) setReviewerName(user.name);
      if (!reviewerEmail && user.email) setReviewerEmail(user.email);
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await ApiClient.get('/reviews/site');
      if (res.success && res.reviews) {
        setReviews(res.reviews);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await ApiClient.post('/reviews/site', {
        reviewerName,
        reviewerEmail,
        rating,
        title,
        comment,
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setActiveTab('view');
          fetchReviews();
          setTitle('');
          setComment('');
        }, 1500);
      } else {
        alert(res.message || 'Failed to submit review');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MyMall Platform Experience & Reviews"
      description="Share your feedback on the platform or browse what other buyers and sellers are saying."
      maxWidth="lg"
    >
      <div className="space-y-4 pt-2">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'view'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Community Reviews ({summary.totalReviews})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'write'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Write a Review
          </button>
        </div>

        {activeTab === 'view' ? (
          <div className="space-y-4">
            {/* Rating Summary Header */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {summary.avgRating}
                </span>
                <span className="text-xs text-slate-400 ml-1">/ 5.0</span>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(summary.avgRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold ml-1.5">
                    ({summary.totalReviews} verified reviews)
                  </span>
                </div>
              </div>

              <Button size="sm" onClick={() => setActiveTab('write')}>
                Rate Platform
              </Button>
            </div>

            {/* Reviews List */}
            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
              {isLoading ? (
                <p className="text-center py-8 text-xs text-slate-400">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No platform reviews yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Be the first to share your experience with MyMall!</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-sm text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-[10px] flex items-center justify-center">
                          {r.reviewerName?.[0] || 'U'}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{r.reviewerName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                      {r.title && (
                        <span className="font-bold text-slate-900 dark:text-slate-100 ml-1 text-xs">
                          {r.title}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                      {r.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            {isSuccess ? (
              <div className="text-center py-8 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Review Submitted!</h4>
                <p className="text-xs text-slate-500">Thank you for helping us improve MyMall.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Your Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Your Name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                  />
                  <Input
                    label="Your Email"
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Headline / Title"
                  placeholder="e.g. Great multi-tenant marketplace for Ethiopian businesses"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Your Review & Experience
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    placeholder="Tell us what you loved or how we can improve..."
                  />
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Submit Platform Review
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
