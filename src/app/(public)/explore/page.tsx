'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Product, Store } from '@/types';
import { ApiClient } from '@/lib/api';
import { useI18n } from '@/context/I18nContext';
import { Search, Filter, Store as StoreIcon, SlidersHorizontal, Sparkles } from 'lucide-react';
import Link from 'next/link';

function ExploreContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 16;

  // Sync search input if URL query param q changes
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    setSearch(qParam);
    setPage(1);
  }, [searchParams]);

  const categories = [
    'All',
    'Fashion & Apparel',
    'Footwear',
    'Electronics',
    'Beauty & Cosmetics',
    'Home & Lifestyle',
    'Supermarket & Groceries',
  ];

  useEffect(() => {
    setIsLoading(true);
    const categoryParam = selectedCategory === 'All' ? '' : encodeURIComponent(selectedCategory);
    ApiClient.get(`/storefront/search/all?q=${encodeURIComponent(search.trim())}&category=${categoryParam}&page=${page}&limit=${limit}`)
      .then((res) => {
        if (res.success) {
          setStores(res.stores || []);
          setProducts(res.products || []);
          setTotalPages(res.totalPages || 1);
          setTotalProducts(res.total || res.counts?.products || (res.products || []).length);
        }
      })
      .catch(() => {
        // Fallback demo data
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [search, selectedCategory, page]);

  const filteredProducts = products.filter(
    (p) => Number(p.sellingPrice) <= maxPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Search Bar */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal Marketplace Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Discover Stores & Products
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ranked with subscription boost priority across Addis Ababa and nationwide.
        </p>

        {/* Big Search Input */}
        <div className="relative max-w-xl mx-auto mt-4">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores, brands, apparel, electronics..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-lg shadow-brand-500/5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Matching Stores Section */}
      {stores.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-brand-500" />
            <span>Marketplace Stores ({stores.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/store/${store.slug}`}
                className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-xl hover:border-brand-500/40 transition-all flex items-center gap-4"
              >
                <img
                  src={store.logoUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80'}
                  alt={store.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                    {store.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {store.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                    {store.tagline || store.address || 'Visit store'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Catalog Grid with Price Filter */}
      <div className="space-y-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Catalog Items ({filteredProducts.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filtered by selected category and maximum price.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Max Price: <strong className="text-brand-600 dark:text-brand-400">{maxPrice.toLocaleString()} ETB</strong>
            </span>
            <input
              type="range"
              min="100"
              max="15000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-brand-500 w-36 sm:w-48 cursor-pointer"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No products found matching your search.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or raising the maximum price.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalProducts} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-slate-400">Loading catalog...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
