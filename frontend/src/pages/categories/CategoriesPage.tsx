import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiLockLine,
  RiPriceTag3Line,
  RiAlertLine,
} from '@remixicon/react';
import { spendingApi, SpendingCategory } from '@/api/spendingApi';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';

const PRESET_COLORS = [
  '#059669', // Emerald
  '#10b981', // Green
  '#0284c7', // Sky
  '#2563eb', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#e11d48', // Rose
  '#ea580c', // Orange
  '#d97706', // Amber
  '#4b5563', // Gray
  '#0f766e', // Teal
];

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SpendingCategory | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#059669');

  // Queries
  const { data: spendingCategories = [], isLoading } = useQuery({
    queryKey: ['spendingCategories'],
    queryFn: () => spendingApi.getCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; color: string }) =>
      spendingApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendingCategories'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to create category.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; description?: string; color: string };
    }) => spendingApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendingCategories'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to update category.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => spendingApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendingCategories'] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete category.');
    },
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('#059669');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: SpendingCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || '#059669');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName('');
    setDescription('');
    setErrorMessage(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage('Category name is required.');
      return;
    }

    const desc = description.trim() || undefined;

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: { name: trimmed, description: desc, color } });
    } else {
      createMutation.mutate({ name: trimmed, description: desc, color });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)] flex items-center gap-2">
            <RiPriceTag3Line className="w-6 h-6 text-[var(--color-primary)]" />
            <span>Spending Categories</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Classify and organize articles and items across your spending receipts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
        >
          <RiAddLine className="w-5 h-5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories List (Each in a separate line) */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading categories...
        </div>
      ) : spendingCategories.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)]">
          No categories found. Click &quot;New Category&quot; to add one.
        </div>
      ) : (
        <div className="space-y-2.5">
          {spendingCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-3.5 sm:p-4 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] flex items-center justify-between gap-4 group hover:border-[var(--color-ring)] transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.color || '#059669' }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-[var(--color-text)] truncate">
                      {cat.name}
                    </h3>
                    {cat.isSystem && (
                      <span
                        title="Default System Category"
                        className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-[var(--radius-pill)] border border-emerald-200 dark:border-emerald-800 shrink-0"
                      >
                        <RiLockLine className="w-2.5 h-2.5" />
                        System
                      </span>
                    )}
                  </div>
                  {cat.description ? (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1 sm:line-clamp-2">
                      {cat.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-text-muted)]/50 italic mt-0.5">
                      No description provided
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 rounded-[var(--radius-base)] hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors touch-target"
                  title="Edit Category"
                >
                  <RiEditLine className="w-4 h-4" />
                </button>
                {!cat.isSystem && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete category "${cat.name}"? Existing transactions will keep their records.`
                        )
                      ) {
                        deleteMutation.mutate(cat.id);
                      }
                    }}
                    className="p-2 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 rounded-[var(--radius-base)] hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors touch-target"
                    title="Delete Category"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Spending Category' : 'New Spending Category'}
        description="Categorize items in your spending bills and receipts."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 flex items-center gap-2.5 text-[var(--color-danger)] text-xs sm:text-sm">
              <RiAlertLine className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries, Restaurants, Utilities"
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Daily market items, supermarket groceries"
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2.5 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform border-2 ${
                    color.toLowerCase() === c.toLowerCase()
                      ? 'scale-110 border-[var(--color-text)] shadow-sm'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-[var(--radius-base)] border border-[var(--color-border)] cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#059669"
                pattern="^#[0-9a-fA-F]{6}$"
                className="px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-mono text-xs w-28 uppercase"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-primary-bg)] touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-semibold shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-60 touch-target flex items-center gap-2"
            >
              {isSaving && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isSaving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
};
