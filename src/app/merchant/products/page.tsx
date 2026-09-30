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
  Barcode,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function MerchantProductsPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
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
    imageUrl: '',
    hasVariants: false,
    variants: [] as { name: string; sku: string; price: string; stockQuantity: string }[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
    checkSubscription();
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

  const loadProducts = () => {
    setIsLoading(true);
    ApiClient.get('/products')
      .then((res) => {
        if (res.success && res.products) {
          setProducts(res.products);
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

  const openCreateModal = () => {
    if (hasSubscription === false) {
      alert('Active subscription required: Your store needs an approved paid plan before you can add products. Please activate your subscription in Merchant Billing.');
      return;
    }
    setEditingProduct(null);
    setProductForm({
      name: '',
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
      imageUrl: '',
      hasVariants: false,
      variants: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    const imgs = parseImages(p.images);
    setProductForm({
      name: p.name,
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
      imageUrl: imgs[0] || '',
      hasVariants: p.hasVariants,
      variants: [],
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...productForm,
      storeId: storeId || 1,
      costPrice: parseFloat(productForm.costPrice) || 0,
      sellingPrice: parseFloat(productForm.sellingPrice) || 0,
      compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice) : null,
      stockQuantity: parseFloat(productForm.stockQuantity) || 0,
      lowStockThreshold: parseFloat(productForm.lowStockThreshold) || 5,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId, 10) : null,
      images: productForm.imageUrl ? [productForm.imageUrl] : [],
    };

    try {
      if (editingProduct) {
        await ApiClient.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await ApiClient.post('/products', payload);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch {
      // Local fallback simulation
      const fallbackImages = JSON.stringify(payload.images);
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: payload.name,
                  slug: payload.slug,
                  categoryId: payload.categoryId,
                  sku: payload.sku,
                  barcode: payload.barcode,
                  costPrice: payload.costPrice,
                  sellingPrice: payload.sellingPrice,
                  compareAtPrice: payload.compareAtPrice,
                  stockQuantity: payload.stockQuantity,
                  lowStockThreshold: payload.lowStockThreshold,
                  unit: payload.unit,
                  description: payload.description,
                  images: fallbackImages,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );
      } else {
        const newProduct: Product = {
          id: Date.now(),
          storeId: storeId || 1,
          name: payload.name,
          slug: payload.slug,
          categoryId: payload.categoryId,
          sku: payload.sku,
          barcode: payload.barcode,
          costPrice: payload.costPrice,
          sellingPrice: payload.sellingPrice,
          compareAtPrice: payload.compareAtPrice,
          stockQuantity: payload.stockQuantity,
          lowStockThreshold: payload.lowStockThreshold,
          unit: payload.unit,
          description: payload.description,
          images: fallbackImages,
          hasVariants: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProducts((prev) => [...prev, newProduct]);
      }
      setIsModalOpen(false);
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

        <div className="flex items-center gap-2">
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
          {['All', 'Apparel', 'Footwear'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
                        <span className="font-bold text-slate-900 dark:text-white block truncate max-w-xs">
                          {p.name}
                        </span>
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
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              value={productForm.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                setProductForm({ ...productForm, name, slug });
              }}
              required
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

          <Input
            label="Image URL (Unsplash or direct image link)"
            value={productForm.imageUrl}
            onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />

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
    </div>
  );
}
