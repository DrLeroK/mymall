'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import { ProductCategory } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getImageUrl } from '@/lib/utils';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function MerchantCategoriesPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.get('/products/categories');
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [storeId]);

  const handleOpenAddModal = () => {
    setFormData({ name: '', description: '', imageUrl: '' });
    setError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
    });
    setError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    setError(null);
    setIsDeleteModalOpen(true);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError(null);

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    uploadFormData.append('folder', 'categories');

    try {
      const res = await ApiClient.post('/products/upload-image', uploadFormData);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      } else {
        setError(res.message || 'Image upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Image upload error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await ApiClient.post('/products/categories', {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
      });

      if (res.success) {
        setSuccessMessage(`Category "${formData.name}" created successfully!`);
        setIsAddModalOpen(false);
        fetchCategories();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(res.message || 'Failed to create category');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating category');
    } finally {
      setIsSaving(false);
    }
  };

  // Update Category
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !formData.name.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await ApiClient.patch(`/products/categories/${selectedCategory.id}`, {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        imageUrl: formData.imageUrl.trim() || '',
      });

      if (res.success) {
        setSuccessMessage(`Category "${formData.name}" updated successfully!`);
        setIsEditModalOpen(false);
        fetchCategories();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(res.message || 'Failed to update category');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating category');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await ApiClient.delete(`/products/categories/${selectedCategory.id}`);
      if (res.success) {
        setSuccessMessage(`Category "${selectedCategory.name}" deleted successfully.`);
        setIsDeleteModalOpen(false);
        fetchCategories();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(res.message || 'Failed to delete category');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting category');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    );
  });

  const totalAssignedProducts = categories.reduce(
    (acc, cat) => acc + (cat._count?.products || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Product Categories
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize your storefront catalog into navigable departments and product lines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAddModal} className="flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Active Categories
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {categories.length}
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Categorized Products
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalAssignedProducts}
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Storefront Navigation
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Auto-Synchronized
            </span>
          </div>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category name or slug..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="text-xs text-slate-400 self-end sm:self-center">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Loading store categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FolderTree className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {searchQuery ? 'No categories matching search' : 'No categories created yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword or clear your query.'
                : 'Create your first product category to group and highlight items on your storefront.'}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={handleOpenAddModal} className="mt-2">
                <Plus className="w-4 h-4 mr-1" />
                Add First Category
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug Identifier</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Assigned Products</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0">
                          {cat.imageUrl ? (
                            <img
                              src={getImageUrl(cat.imageUrl)}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <FolderTree className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {cat.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      <Badge variant="outline" className="font-mono">
                        {cat.slug}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {cat.description || (
                        <span className="text-slate-400 italic">No description provided</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <Package className="w-3.5 h-3.5 text-brand-500" />
                        {cat._count?.products || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Category"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-brand-600 dark:text-slate-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteModal(cat)}
                          title="Delete Category"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600 dark:text-slate-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
        description="Create a product category for your store."
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 pt-2">
          <Input
            label="Category Name *"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Footwear, Men's Clothing, Electronics"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of products in this category..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Cover Image
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                {formData.imageUrl ? (
                  <img
                    src={getImageUrl(formData.imageUrl)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FolderTree className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-brand-500" />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Or paste external image URL..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
        description="Update category name, description, and cover photo."
      >
        <form onSubmit={handleUpdateCategory} className="space-y-4 pt-2">
          <Input
            label="Category Name *"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Cover Image
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                {formData.imageUrl ? (
                  <img
                    src={getImageUrl(formData.imageUrl)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FolderTree className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-brand-500" />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Or paste external image URL..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <p className="font-bold">Are you sure you want to delete this category?</p>
              <p>
                Deleting <span className="font-bold underline">{selectedCategory?.name}</span> will{' '}
                <span className="font-bold">NOT</span> delete its products. The{' '}
                {selectedCategory?._count?.products || 0} associated product(s) will simply become{' '}
                <span className="font-bold">Uncategorized</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteCategory}
              isLoading={isSaving}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
