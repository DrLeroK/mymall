'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Product, ProductCategory, ProductVariant } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice, getImageUrl, parseImages } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import {
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Layers,
  AlertTriangle,
  ExternalLink,
  FolderPlus,
  ImageIcon,
  Link as LinkIcon,
  X,
  Loader2,
  Star,
  Sparkles,
  Info,
  Tag,
} from 'lucide-react';

export default function MerchantProductsPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Add/Edit Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    slug: '',
    categoryId: '',
    sku: '',
    barcode: '',
    costPrice: '',
    sellingPrice: '',
    compareAtPrice: '',
    stockQuantity: '0',
    lowStockThreshold: '5',
    unit: 'pcs',
    description: '',
    images: [] as string[],
    urlInput: '',
    isOnlineVisible: true,
    hasVariants: false,
    variants: [] as { name: string; sku: string; price: string; stockQuantity: string }[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', imageUrl: '' });
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);

  // Image Source Mode: 'url' | 'upload'
  const [imageSourceMode, setImageSourceMode] = useState<'url' | 'upload'>('url');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // CSV Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    loadProducts(1);
    loadCategories();
    checkSubscription();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === '1' || params.get('action') === 'new') {
        setIsModalOpen(true);
      }
    }
  }, [storeId]);

  const checkSubscription = () => {
    ApiClient.get('/stores/me')
      .then((res: any) => {
        if (res.success) {
          setHasSubscription(res.hasActiveSubscription ?? true);
        }
      })
      .catch(() => {
        setHasSubscription(true);
      });
  };

  const loadProducts = (pageToLoad = currentPage) => {
    setIsLoading(true);
    ApiClient.get(`/products?page=${pageToLoad}&limit=${limit}`)
      .then((res) => {
        if (res.success && res.products) {
          setProducts(res.products);
          setTotalCount(res.total ?? res.products.length);
          setTotalPages(res.totalPages ?? 1);
          setCurrentPage(res.page ?? pageToLoad);
        } else {
          setProducts([]);
        }
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  };

  const loadCategories = () => {
    ApiClient.get('/products/categories')
      .then((res) => {
        if (res.success && res.categories) setCategories(res.categories);
      })
      .catch(() => {});
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCategory(true);
    setCategoryModalError(null);
    try {
      const res = await ApiClient.post('/products/categories', categoryForm);
      if (res.success && res.category) {
        setCategories((prev) => [...prev, res.category]);
        setProductForm((prev) => ({ ...prev, categoryId: res.category.id.toString() }));
        setIsCategoryModalOpen(false);
        setCategoryForm({ name: '', description: '', imageUrl: '' });
      }
    } catch (err: any) {
      setCategoryModalError(err.message || 'Failed to create category');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleLocalImageUpload = async (file: File) => {
    if (productForm.images.length >= 3) {
      setUploadError('Maximum 3 images allowed per product.');
      return;
    }
    setIsUploadingImage(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('productImages', file);
      formData.append('file', file);
      formData.append('image', file);
      formData.append('folder', 'products');
      const res = await ApiClient.post('/products/upload-image', formData);
      if (res.success && res.url) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, res.url],
        }));
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image. Please check file type.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = productForm.urlInput.trim();
    if (!trimmed) return;
    if (productForm.images.length >= 3) {
      setUploadError('Maximum 3 images allowed per product.');
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
      urlInput: '',
    }));
    setUploadError(null);
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setProductForm((prev) => {
      const copy = [...prev.images];
      const [selected] = copy.splice(index, 1);
      return { ...prev, images: [selected, ...copy] };
    });
  };

  const handleRemoveImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const applyVariantPreset = (type: 'clothes' | 'shoes' | 'electronics' | 'groceries' | 'custom') => {
    const basePrice = productForm.sellingPrice || '0';
    const baseSku = productForm.sku || 'PROD';
    let newVariants: { name: string; sku: string; price: string; stockQuantity: string }[] = [];

    if (type === 'clothes') {
      const sizes = ['S', 'M', 'L', 'XL', '2XL'];
      newVariants = sizes.map((s) => ({
        name: `Size ${s}`,
        sku: `${baseSku}-${s}`,
        price: basePrice,
        stockQuantity: '10',
      }));
    } else if (type === 'shoes') {
      const sizes = ['38', '39', '40', '41', '42', '43', '44', '45'];
      newVariants = sizes.map((s) => ({
        name: `EU ${s}`,
        sku: `${baseSku}-${s}`,
        price: basePrice,
        stockQuantity: '8',
      }));
    } else if (type === 'electronics') {
      const tiers = ['128GB', '256GB', '512GB', '1TB'];
      newVariants = tiers.map((t) => ({
        name: t,
        sku: `${baseSku}-${t}`,
        price: basePrice,
        stockQuantity: '5',
      }));
    } else if (type === 'groceries') {
      const weights = ['250g', '500g', '1kg', '2kg'];
      newVariants = weights.map((w) => ({
        name: w,
        sku: `${baseSku}-${w.toUpperCase()}`,
        price: basePrice,
        stockQuantity: '20',
      }));
    } else {
      const count = productForm.variants.length + 1;
      newVariants = [
        ...productForm.variants,
        {
          name: `Custom Option ${count}`,
          sku: `${baseSku}-${count}`,
          price: basePrice,
          stockQuantity: '10',
        },
      ];
    }

    setProductForm((prev) => ({
      ...prev,
      hasVariants: true,
      variants: newVariants,
    }));
  };

  const openCreateModal = () => {
    if (hasSubscription === false) {
      alert('Active subscription required: Your store needs an approved paid plan before you can add products. Please activate your subscription in Merchant Billing.');
      return;
    }
    setModalError(null);
    setUploadError(null);
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: '',
      slug: '',
      categoryId: '',
      sku: '',
      barcode: '',
      costPrice: '',
      sellingPrice: '',
      compareAtPrice: '',
      stockQuantity: '0',
      lowStockThreshold: '5',
      unit: 'pcs',
      description: '',
      images: [],
      urlInput: '',
      isOnlineVisible: true,
      hasVariants: false,
      variants: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setModalError(null);
    setUploadError(null);
    setEditingProduct(p);
    const imgs = parseImages(p.images);
    setProductForm({
      name: p.name,
      brand: p.brand || '',
      slug: p.slug,
      categoryId: p.categoryId ? p.categoryId.toString() : '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      costPrice: p.costPrice.toString(),
      sellingPrice: p.sellingPrice.toString(),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : '',
      stockQuantity: p.stockQuantity.toString(),
      lowStockThreshold: p.lowStockThreshold.toString(),
      unit: p.unit,
      description: p.description || '',
      images: imgs.slice(0, 3),
      urlInput: '',
      isOnlineVisible: p.isOnlineVisible !== false,
      hasVariants: !!p.hasVariants,
      variants: ((p as any).variants || []).map((v: any) => ({
        name: v.name || '',
        sku: v.sku || '',
        price: v.price?.toString() || '',
        stockQuantity: v.stockQuantity?.toString() || '0',
      })),
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...productForm,
      storeId: storeId || 1,
      brand: productForm.brand.trim() || null,
      costPrice: parseFloat(productForm.costPrice) || 0,
      sellingPrice: parseFloat(productForm.sellingPrice) || 0,
      compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice) : null,
      stockQuantity: parseFloat(productForm.stockQuantity) || 0,
      lowStockThreshold: parseFloat(productForm.lowStockThreshold) || 5,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId, 10) : null,
      images: productForm.images,
      hasVariants: productForm.hasVariants,
      variants: productForm.hasVariants
        ? productForm.variants.map((v) => ({
            name: v.name,
            sku: v.sku || `${productForm.sku || 'VAR'}-${v.name.toLowerCase().replace(/\s+/g, '-')}`,
            price: parseFloat(v.price) || parseFloat(productForm.sellingPrice) || 0,
            stockQuantity: parseInt(v.stockQuantity, 10) || 0,
          }))
        : [],
    };

    try {
      if (editingProduct) {
        await ApiClient.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await ApiClient.post('/products', payload);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save product. Please check plan limits and required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await ApiClient.delete(`/products/${id}`);
    } catch {}
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setCsvLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const res = await ApiClient.post('/products/import-csv', formData);
      if (res.success) {
        alert(res.message || 'Products imported successfully!');
        setIsCsvModalOpen(false);
        loadProducts();
      }
    } catch (e: any) {
      alert(e.message || 'CSV Import failed. Please check column format.');
    } finally {
      setCsvLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/backend-api/products/export-csv', '_blank');
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search);
    const matchesCategory =
      selectedCategory === 'All' || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('merchant.products')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your store catalog, pricing, SKUs, and in-stock inventory.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            {t('merchant.exportCsv')}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setIsCsvModalOpen(true)}
          >
            {t('merchant.importCsv')}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<FolderPlus className="w-4 h-4" />}
            onClick={() => {
              setCategoryModalError(null);
              setCategoryForm({ name: '', description: '', imageUrl: '' });
              setIsCategoryModalOpen(true);
            }}
          >
            + Add Category
          </Button>

          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
            {t('merchant.addProduct')}
          </Button>
        </div>
      </div>

      {/* Subscription Requirement Banner */}
      {hasSubscription === false && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Active Subscription Plan Required</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                Your store does not have an active approved subscription. Upgrade or activate your plan to unlock adding products, POS sales, and marketplace storefront visibility.
              </p>
            </div>
          </div>
          <Link
            href="/merchant/billing"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition flex items-center gap-2 whitespace-nowrap shadow-sm shrink-0"
          >
            <span>Activate Plan</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or barcode..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['All', ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">SKU / Barcode</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Cost</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const isOut = p.stockQuantity <= 0;
                const isLow = !isOut && p.stockQuantity <= p.lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={getImageUrl(p.images)}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white block truncate max-w-xs">
                            {p.name}
                          </span>
                          {p.brand && (
                            <span className="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 font-extrabold text-[9px] uppercase tracking-wider">
                              {p.brand}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {p.category?.name || 'General'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px]">
                      <div>{p.sku || '—'}</div>
                      <div className="text-slate-400 text-[10px]">{p.barcode || ''}</div>
                    </td>

                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(p.sellingPrice)}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {formatPrice(p.costPrice)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-black ${
                            isOut
                              ? 'text-rose-500'
                              : isLow
                              ? 'text-amber-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {p.stockQuantity} {p.unit}
                        </span>
                        {isOut ? (
                          <Badge variant="danger" size="sm">
                            Out
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" size="sm">
                            Low
                          </Badge>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {p.isOnlineVisible !== false ? (
                        <Badge variant="success" size="sm">
                          Online & POS
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          POS Only
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * limit, totalCount)}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> products
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => {
                  const prev = Math.max(1, currentPage - 1);
                  setCurrentPage(prev);
                  loadProducts(prev);
                }}
              >
                Previous
              </Button>
              <span className="font-bold text-slate-700 dark:text-slate-300 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  const next = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(next);
                  loadProducts(next);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
          {modalError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{modalError}</div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Product Name"
                value={productForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  setProductForm({ ...productForm, name, slug });
                }}
                placeholder="e.g. Royal Hand-Woven Habesha Kemis"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryModalError(null);
                    setCategoryForm({ name: '', description: '', imageUrl: '' });
                    setIsCategoryModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ New</span>
                </button>
              </div>
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Brand / Maker"
              value={productForm.brand}
              onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              placeholder="e.g. Apple, Samsung, Shewa Heritage, Addis Leather"
            />
            <Input
              label="URL Slug"
              value={productForm.slug}
              onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="SKU Code"
              value={productForm.sku}
              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              placeholder="APP-001"
            />
            <Input
              label="Barcode"
              value={productForm.barcode}
              onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
              placeholder="890123..."
            />
            <Input
              label="Unit (pcs, pair, kg)"
              value={productForm.unit}
              onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Selling Price (ETB)"
              type="number"
              step="any"
              value={productForm.sellingPrice}
              onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
              required
            />
            <Input
              label="Cost Price (ETB)"
              type="number"
              step="any"
              value={productForm.costPrice}
              onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
              required
            />
            <Input
              label="Compare At Price (Sale)"
              type="number"
              step="any"
              value={productForm.compareAtPrice}
              onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              step="any"
              value={productForm.stockQuantity}
              onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
              required
            />
            <Input
              label="Low Stock Alert Threshold"
              type="number"
              step="any"
              value={productForm.lowStockThreshold}
              onChange={(e) =>
                setProductForm({ ...productForm, lowStockThreshold: e.target.value })
              }
              required
            />
          </div>

          {/* Variants Toggle & Items */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.hasVariants}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setProductForm({
                        ...productForm,
                        hasVariants: enabled,
                        variants:
                          enabled && productForm.variants.length === 0
                            ? [
                                {
                                  name: 'Default Variant',
                                  sku: `${productForm.sku || 'SKU'}-1`,
                                  price: productForm.sellingPrice || '0',
                                  stockQuantity: productForm.stockQuantity || '0',
                                },
                              ]
                            : productForm.variants,
                      });
                    }}
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>Enable Product Variants (Size, Color, Capacity, Weight)</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Allows customers to choose options with distinct prices, SKUs, and stock quantities.
                </p>
              </div>

              {productForm.hasVariants && (
                <button
                  type="button"
                  onClick={() => applyVariantPreset('custom')}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors self-start sm:self-auto"
                >
                  + Add Custom Variant
                </button>
              )}
            </div>

            {/* Smart Category Presets */}
            {productForm.hasVariants && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Variant Presets (Click to autofill):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyVariantPreset('clothes')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    👗 Clothes (S, M, L, XL, 2XL)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyVariantPreset('shoes')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    👟 Shoes (EU 38–45)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyVariantPreset('electronics')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    📱 Tech (128GB, 256GB, 512GB, 1TB)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyVariantPreset('groceries')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    ☕ Food & Groceries (250g, 500g, 1kg, 2kg)
                  </button>
                </div>
              </div>
            )}

            {productForm.hasVariants && (
              <div className="space-y-2 pt-1">
                {productForm.variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 items-center text-xs"
                  >
                    <div className="col-span-4">
                      <input
                        placeholder="Variant Name (e.g. Size L / Midnight Black)"
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...productForm.variants];
                          updated[idx].name = e.target.value;
                          setProductForm({ ...productForm, variants: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        placeholder="SKU"
                        value={v.sku}
                        onChange={(e) => {
                          const updated = [...productForm.variants];
                          updated[idx].sku = e.target.value;
                          setProductForm({ ...productForm, variants: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...productForm.variants];
                          updated[idx].price = e.target.value;
                          setProductForm({ ...productForm, variants: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Stock"
                        value={v.stockQuantity}
                        onChange={(e) => {
                          const updated = [...productForm.variants];
                          updated[idx].stockQuantity = e.target.value;
                          setProductForm({ ...productForm, variants: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs"
                        required
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = productForm.variants.filter((_, i) => i !== idx);
                          setProductForm({
                            ...productForm,
                            variants: updated,
                            hasVariants: updated.length > 0,
                          });
                        }}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Remove variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Multi-Image Section (Up to 3 Images) */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand-500" />
                  <span>Product Gallery ({productForm.images.length}/3 Images)</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Attach up to 3 high-resolution photos. The first image is the Primary Cover displayed across catalog listings.
                </p>
              </div>

              {/* Source Mode Toggle */}
              {productForm.images.length < 3 && (
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('url')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      imageSourceMode === 'url'
                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Web URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('upload')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      imageSourceMode === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              )}
            </div>

            {/* Input by Mode (disabled if 3 images already added) */}
            {productForm.images.length < 3 ? (
              imageSourceMode === 'url' ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      label="Paste Image Web URL"
                      value={productForm.urlInput}
                      onChange={(e) => setProductForm({ ...productForm, urlInput: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="mt-6 px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shrink-0"
                  >
                    Add Image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-colors">
                    <input
                      type="file"
                      id="local-product-image"
                      accept="image/*,.avif,.webp,.png,.jpg,.jpeg,.svg,.bmp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleLocalImageUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="local-product-image" className="cursor-pointer block space-y-1">
                      {isUploadingImage ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-brand-500 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading image to server / cloud storage...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-brand-500 mx-auto" />
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Click to upload from device
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Supports AVIF, WEBP, PNG, JPG, SVG up to 10MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Maximum 3 gallery images attached. Reorder or remove images below if needed.</span>
              </div>
            )}

            {uploadError && (
              <p className="text-[11px] font-bold text-rose-500">{uploadError}</p>
            )}

            {/* Thumbnail Cards Gallery */}
            {productForm.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {productForm.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative group rounded-xl border p-2 bg-white dark:bg-slate-900 flex flex-col justify-between gap-2 ${
                      idx === 0
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={getImageUrl(img)}
                        alt={`Product image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
                        }}
                      />
                      {idx === 0 && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Primary</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] truncate max-w-[120px]">
                        Image #{idx + 1}
                      </span>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          <span>Set Primary</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          {/* Online Storefront Visibility Channel Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Show on Online Storefront
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Disable to make this product exclusive to in-store POS register (hidden from website & marketplace).
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.isOnlineVisible}
                onChange={(e) => setProductForm({ ...productForm, isOnlineVisible: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            {editingProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Import Catalog via CSV"
        description="Upload a CSV spreadsheet to bulk import products with SKUs, prices, and stock quantities."
      >
        <form onSubmit={handleCsvImport} className="space-y-4 pt-2">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center">
            <input
              type="file"
              accept=".csv"
              id="csv-file-upload"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setCsvFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label htmlFor="csv-file-upload" className="cursor-pointer block space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-brand-500 mx-auto" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {csvFile ? csvFile.name : 'Select .csv file to import'}
              </p>
              <p className="text-[10px] text-slate-400">
                Headers required: name, price, costPrice, stockQuantity, sku
              </p>
            </label>
          </div>

          <Button type="submit" isLoading={csvLoading} disabled={!csvFile} className="w-full">
            Process CSV Import
          </Button>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add New Category"
        description="Create a product category for your store catalog."
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 pt-2">
          {categoryModalError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{categoryModalError}</div>
            </div>
          )}

          <Input
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="e.g. Shoes, Electronics, Groceries"
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Brief description of items in this category"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <Input
            label="Category Cover Image URL (Optional)"
            value={categoryForm.imageUrl}
            onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingCategory}
            >
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
