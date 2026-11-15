import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from '@remixicon/react';
import { incomeApi, IncomeSource } from '@/api/incomeApi';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';

const PRESET_COLORS = [
  '#047857', '#10b981', '#34d399', '#059669', '#0d9488',
  '#0284c7', '#2563eb', '#7c3aed', '#db2777', '#d97706'
];

export const IncomeSourcesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10b981');
  const [isActive, setIsActive] = useState(true);

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['incomeSources'],
    queryFn: () => incomeApi.getSources(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; title: string; description?: string; color: string; isActive?: boolean; status?: string }) =>
      incomeApi.createSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to create income source.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      incomeApi.updateSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to update income source.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incomeApi.deleteSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete income source.');
    },
  });

  const handleOpenCreate = () => {
    setEditingSource(null);
    setName('');
    setDescription('');
    setColor('#10b981');
    setIsActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (src: IncomeSource) => {
    setEditingSource(src);
    setName(src.name || src.title || '');
    setDescription(src.description || '');
    setColor(src.color || '#10b981');
    setIsActive(src.isActive ?? src.status === 'active');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSource(null);
    setErrorMessage(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Source name is required.');
      return;
    }
    setErrorMessage(null);

    const payload = {
      name: trimmedName,
      title: trimmedName,
      description: description.trim() || undefined,
      color,
      isActive,
      status: isActive ? 'active' : 'inactive',
    };

    if (editingSource) {
      updateMutation.mutate({
        id: editingSource.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">Income Sources</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Define your employers, clients, investments, and revenue channels.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
        >
          <RiAddLine className="w-5 h-5" />
          <span>New Source</span>
        </button>
      </div>

      {/* Sources List (Each in a separate line) */}
      {isLoading ? (
        <div className="py-12 flex justify-center text-[var(--color-text-muted)]">Loading sources...</div>
      ) : sources.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-8 text-center">
          <p className="text-[var(--color-text-muted)] text-sm">No income sources created yet.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            <RiAddLine className="w-4 h-4" /> Create your first income source
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sources.map((src) => {
            const isSrcActive = src.isActive ?? src.status === 'active';
            const displayName = src.name || src.title || 'Untitled Source';

            return (
              <div
                key={src.id}
                className="p-3.5 sm:p-4 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] flex items-center justify-between gap-4 group hover:border-[var(--color-ring)] transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: src.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-sm sm:text-base text-[var(--color-text)] truncate">
                        {displayName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                          isSrcActive
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {isSrcActive ? (
                          <RiCheckboxCircleLine className="w-3 h-3" />
                        ) : (
                          <RiCloseCircleLine className="w-3 h-3" />
                        )}
                        <span>{isSrcActive ? 'Active' : 'Inactive'}</span>
                      </span>
                    </div>

                    {src.description ? (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1 sm:line-clamp-2">
                        {src.description}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--color-text-muted)]/50 italic mt-0.5">
                        No description provided.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(src)}
                    className="p-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 rounded-[var(--radius-base)] hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors touch-target"
                    title="Edit source"
                  >
                    <RiEditLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(`Delete source "${displayName}"? Historical income will retain this source name.`)
                      ) {
                        deleteMutation.mutate(src.id);
                      }
                    }}
                    className="p-2 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 rounded-[var(--radius-base)] hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors touch-target"
                    title="Delete source"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Source Modal */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSource ? 'Edit Income Source' : 'New Income Source'}
        description="Used to categorize and color-code revenues."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-[var(--radius-base)] bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="font-medium underline ml-2 hover:opacity-80"
              >
                Dismiss
              </button>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Source Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp, Upwork, Dividend Portfolio"
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary salary, contract client, etc."
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Color Swatch
            </label>
            <div className="flex flex-wrap items-center gap-3.5 py-2 mb-3">
              {PRESET_COLORS.map((c) => {
                const isSelected = color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'ring-2 ring-[var(--color-ring)] ring-offset-2 ring-offset-[var(--color-surface)] shadow-xs scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <label
                className="relative w-8 h-8 rounded-full border-2 border-[var(--color-border)] shadow-xs cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 transition-transform shrink-0"
                style={{ backgroundColor: color }}
                title="Pick custom color"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-28 px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-mono font-semibold uppercase"
                placeholder="#10b981"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-ring)]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-[var(--color-text)]">
              Active Source (shows in dropdowns)
            </label>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-primary-bg)] touch-target disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-semibold shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingSource
                  ? 'Update Source'
                  : 'Create Source'}
              </span>
            </button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
};

