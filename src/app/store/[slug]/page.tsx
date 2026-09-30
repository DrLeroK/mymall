'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Store, Product, StoreBankAccount, StoreReview } from '@/types';
import { ApiClient } from '@/lib/api';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import {
  Store as StoreIcon,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Copy,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function StorefrontPage() {
  const { t } = useI18n();
  const params = useParams();
  const slug = params.slug as string;

  const { user } = useAuth();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [bankAccounts, setBankAccounts] = useState<StoreBankAccount[]>([]);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedBankId, setCopiedBankId] = useState<number | null>(null);

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    reviewerName: '',
    reviewerEmail: '',
    rating: 5,
    title: '',
    comment: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setReviewForm((prev) => ({
        ...prev,
        reviewerName: prev.reviewerName || user.name || '',
        reviewerEmail: prev.reviewerEmail || user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!slug) return;

    // Load store profile & branding
    ApiClient.get(`/storefront/${slug}`)
      .then((res) => {
        if (res.success && res.store) {
          setStore(res.store);
        }
      })
      .catch((err) => console.error(err));

    // Load store products catalog
    ApiClient.get(`/storefront/${slug}/products`)
      .then((res) => {
        if (res.success && res.products) {
          setProducts(res.products);
        }
      })
      .catch((err) => console.error(err));

    // Load store bank accounts for manual transfers
    ApiClient.get(`/storefront/${slug}/bank-accounts`)
      .then((res) => {
        if (res.success && res.bankAccounts) {
          setBankAccounts(res.bankAccounts);
        }
      })
      .catch((err) => console.error(err));

    // Load store reviews
    ApiClient.get(`/storefront/${slug}/reviews`)
      .then((res) => {
        if (res.success && res.reviews) {
          setReviews(res.reviews);
        }
      })
      .catch((err) => console.error(err));
  }, [slug]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await ApiClient.post(`/storefront/${slug}/reviews`, reviewForm);
      if (res.success) {
        setReviewSuccess(true);
        ApiClient.get(`/storefront/${slug}/reviews`).then((r) => {
          if (r.success && r.reviews) setReviews(r.reviews);
        }).catch(() => {});
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewSuccess(false);
          setReviewForm({ reviewerName: user?.name || '', reviewerEmail: user?.email || '', rating: 5, title: '', comment: '' });
        }, 1500);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // If store is suspended due to subscription expiration
  if (store?.status === 'SUSPENDED') {
    return (
      <div className="max-w-2xl mx-auto my-24 p-8 rounded-3xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Store Temporarily Suspended</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('storefront.storeSuspended')}
        </p>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Banner & Brand Header */}
      <div className="relative">
        <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-900 relative">
          <img
            src={store?.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80'}
            alt={store?.name || 'Store Banner'}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Store Profile Card Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 sm:p-8 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={store?.logoUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80'}
                alt={store?.name || 'Store Logo'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white dark:border-slate-800 object-cover shadow-lg flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900">
                    {store?.category || 'Fashion'}
                  </span>
                  <Badge variant="success" size="sm">
                    Verified Merchant
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {store?.name || 'Store Name'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                  {store?.tagline || store?.description || 'Authentic products and reliable delivery.'}
                </p>
              </div>
            </div>

            {/* Contact & Hours Quick Strip */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              {store?.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>{store.address}</span>
                </div>
              )}
              {store?.contactPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-500" />
                  <span>{store.contactPhone}</span>
                </div>
              )}
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  {t('storefront.writeReview')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Storefront Body: Left Column (Bank Accounts & Info) + Right Column (Catalog) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Bank Transfer Details & Store Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Bank Accounts Box */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Official Bank Accounts
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              For manual bank screenshot checkout, use any of these verified accounts:
            </p>

            <div className="space-y-3">
              {(bankAccounts.length > 0 ? bankAccounts : [
                {
                  id: 1,
                  storeId: 1,
                  bankName: 'Commercial Bank of Ethiopia (CBE)',
                  accountName: store?.name || 'Store Account',
                  accountNumber: '1000987654321',
                  instructions: 'Include your Order # in the transfer remark.',
                  isActive: true,
                },
                {
                  id: 2,
                  storeId: 1,
                  bankName: 'Telebirr',
                  accountName: store?.name || 'Store Account',
                  accountNumber: '+251911234567',
                  instructions: 'Direct transfer to merchant phone.',
                  isActive: true,
                },
              ]).map((bank) => (
                <div
                  key={bank.id}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {bank.bankName}
                    </span>
                    <button
                      onClick={() => handleCopy(bank.id, bank.accountNumber)}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 font-semibold"
                    >
                      {copiedBankId === bank.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedBankId === bank.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    {bank.accountNumber}
                  </p>
                  <p className="text-[10px] text-slate-400">A/C: {bank.accountName}</p>
                  {bank.instructions && (
                    <p className="text-[10px] text-slate-500 italic mt-1">{bank.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Store Return Policy & Hours */}
          {store?.returnPolicy && (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Return & Refund Policy
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {store.returnPolicy}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Catalog Products Grid */}
        <div className="space-y-6 lg:col-span-3">
          {/* Search in Store & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('storefront.searchInStore')}
                className="w-full pl-3.5 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {['All', 'Apparel', 'Footwear', 'Accessories'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No items found in this store.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} storeSlug={slug} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>Store Reviews & Feedback ({reviews.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verified shopping experiences from shoppers at {store?.name || 'this store'}.
            </p>
          </div>

          <Button
            size="sm"
            leftIcon={<Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
            onClick={() => setIsReviewModalOpen(true)}
          >
            {t('storefront.writeReview')}
          </Button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No store reviews yet</h4>
            <p className="text-xs text-slate-400">Be the first customer to share your thoughts on this store!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r: any) => (
              <div
                key={r.id}
                className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-black text-xs flex items-center justify-center">
                      {r.reviewerName?.[0] || 'C'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {r.reviewerName}
                      </h4>
                      {r.isVerifiedPurchase && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  ))}
                  {r.title && (
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 ml-1 truncate">
                      {r.title}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Leave a Store Review"
        description={`Share your shopping experience with ${store?.name || 'this store'}.`}
      >
        {reviewSuccess ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Review Submitted!</h4>
            <p className="text-xs text-slate-500">Thank you for helping other shoppers with your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        reviewForm.rating >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Your Name"
              value={reviewForm.reviewerName}
              onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={reviewForm.reviewerEmail}
              onChange={(e) => setReviewForm({ ...reviewForm, reviewerEmail: e.target.value })}
              required
            />

            <Input
              label="Review Title"
              placeholder="e.g. Excellent fabric quality & fast delivery"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
            />

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Comments</label>
              <textarea
                rows={3}
                required
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                placeholder="Write your review here..."
              />
            </div>

            <Button type="submit" isLoading={reviewSubmitting} className="w-full">
              Submit Review
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
