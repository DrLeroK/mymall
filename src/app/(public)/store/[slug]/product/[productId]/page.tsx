'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice, getImageUrl, parseImages } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  ShoppingCart,
  Star,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  Share2,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const productId = params.productId as string;

  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  // Product Reviews
  const [reviews, setReviews] = useState<any[]>([]);
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
    if (!slug || !productId) return;

    ApiClient.get(`/storefront/${slug}/products/${productId}`)
      .then((res) => {
        if (res.success && res.product) {
          setProduct(res.product);
          if (res.product.reviews) {
            setReviews(res.product.reviews);
          }
          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [slug, productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await ApiClient.post(`/storefront/${slug}/products/${productId}/reviews`, reviewForm);
      if (res.success) {
        setReviewSuccess(true);
        // Refresh product details/reviews
        ApiClient.get(`/storefront/${slug}/products/${productId}`).then((r) => {
          if (r.success && r.product?.reviews) {
            setReviews(r.product.reviews);
          }
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400 text-sm">Loading product details...</p>
      </div>
    );
  }

  const images = parseImages(product.images);
  const primaryImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'];

  const currentPrice = selectedVariant?.price
    ? Number(selectedVariant.price)
    : Number(product.sellingPrice);

  const currentStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product.stockQuantity;

  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= product.lowStockThreshold;

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <Link
        href={`/store/${slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to {product.store?.name || 'Store'}</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 relative shadow-sm">
            <img
              src={getImageUrl(primaryImages[activeImageIndex])}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {isOutOfStock ? (
              <div className="absolute top-4 left-4">
                <Badge variant="danger" size="md">
                  Out of Stock
                </Badge>
              </div>
            ) : isLowStock ? (
              <div className="absolute top-4 left-4">
                <Badge variant="warning" size="md">
                  Only {currentStock} left!
                </Badge>
              </div>
            ) : null}
          </div>

          {/* Thumbnails */}
          {primaryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {primaryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-brand-500 shadow-md scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {product.brand && (
                <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-300 font-extrabold text-xs uppercase tracking-wider">
                  Brand: {product.brand}
                </span>
              )}
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {product.category?.name || 'Catalog'}
              </span>
              {(selectedVariant?.sku || product.sku) && (
                <span className="text-xs text-slate-400 font-mono ml-auto">
                  SKU: {selectedVariant?.sku || product.sku}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">5.0</span>
              <span className="text-xs text-slate-400">
                ({product.reviews?.length || 1} verified customer reviews)
              </span>
            </div>
          </div>

          {/* Price display */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
              {formatPrice(currentPrice, product.store?.currency || 'ETB')}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.compareAtPrice, product.store?.currency || 'ETB')}
              </span>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
              Per {product.unit || 'pcs'}
            </span>
          </div>

          {/* Variants Selector */}
          {product.hasVariants && product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Option / Variant:
                </label>
                {selectedVariant && (
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">
                    Selected: {selectedVariant.name}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isVarOut = v.stockQuantity <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span>{v.name}</span>
                      {v.price && (
                        <span className={`text-[11px] font-mono ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                          ({formatPrice(Number(v.price), product.store?.currency || 'ETB')})
                        </span>
                      )}
                      {isVarOut && (
                        <span className="text-[10px] text-rose-500 font-bold">(Out)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  +
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1"
                leftIcon={<ShoppingCart className="w-5 h-5" />}
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Shopping Cart'}
              </Button>
            </div>

            {/* Added confirmation feedback */}
            {addedToast && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Added {quantity}x to cart!
                </span>
                <Link href="/cart" className="underline hover:text-emerald-800">
                  View Cart & Checkout
                </Link>
              </div>
            )}
          </div>

          {/* Delivery & Assurance Perks */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Doorstep Delivery / In-Store Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Verified Merchant Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-500" />
              <span>Store Return Policy Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-brand-500" />
              <span>Direct Merchant Chat Available</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Product Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Customer Reviews & Feedback Section */}
      <div className="pt-10 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>Customer Reviews & Ratings ({reviews.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Feedback from verified buyers and customers who purchased this item.
            </p>
          </div>

          <Button
            size="sm"
            leftIcon={<Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
            onClick={() => setIsReviewModalOpen(true)}
          >
            Write a Review
          </Button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No reviews yet for this product</h4>
            <p className="text-xs text-slate-400">Be the first customer to share your thoughts!</p>
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

      {/* Product Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review this Product"
        description={`Share your thoughts on ${product.name}.`}
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
              placeholder="e.g. Great quality, fits true to size"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
            />

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Comments</label>
              <textarea
                rows={3}
                required
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-slate-900 dark:text-slate-100"
                placeholder="Share more details about your experience with this item..."
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
