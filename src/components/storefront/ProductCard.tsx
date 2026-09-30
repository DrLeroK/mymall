'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice, getImageUrl, parseImages } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
  storeSlug?: string;
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const { addItem } = useCart();
  const images = parseImages(product.images);
  const primaryImage = images.length > 0 ? getImageUrl(images[0]) : getImageUrl(null);

  const price = Number(product.sellingPrice);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : null;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  const productUrl = storeSlug
    ? `/store/${storeSlug}/product/${product.id}`
    : `/store/${product.store?.slug || 'urbantrend'}/product/${product.id}`;

  return (
    <div className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-xl hover:border-brand-500/40 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Container */}
      <Link href={productUrl} className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px] uppercase shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <Badge variant="danger" size="sm">
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm">
              Low Stock
            </Badge>
          ) : null}
        </div>

        {/* Quick View Pill on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
            <Eye className="w-3.5 h-3.5 text-brand-500" /> View Details
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Store / Category link */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
            <span>{product.category?.name || 'General'}</span>
            {product.store && (
              <span className="text-brand-600 dark:text-brand-400 font-bold truncate max-w-[120px]">
                {product.store.name}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link href={productUrl} className="block">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h4>
          </Link>

          {/* Reviews Rating summary */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>5.0</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              ({product.reviews?.length || 1})
            </span>
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-base font-black text-brand-600 dark:text-brand-400">
              {formatPrice(price, product.store?.currency || 'ETB')}
            </span>
            {compareAt && (
              <span className="ml-2 text-xs text-slate-400 line-through">
                {formatPrice(compareAt, product.store?.currency || 'ETB')}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            disabled={isOutOfStock}
            className="p-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
