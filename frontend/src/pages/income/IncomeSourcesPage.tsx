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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: src.color }}
                    />
                    <h3 className="font-heading font-bold text-[var(--color-text)] text-base">{src.name || src.title}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-semibold border ${
                      (src.isActive ?? src.status === 'active')
                        ? 'bg-[var(--color-primary-bg)] text-[var(--color-accent)] border-[var(--color-border)]'
                        : 'bg-[var(--color-border)]/50 text-[var(--color-text-muted)] border-transparent'
                    }`}
                  >
                    {(src.isActive ?? src.status === 'active') ? (
                      <RiCheckboxCircleLine className="w-3.5 h-3.5" />
                    ) : (
                      <RiCloseCircleLine className="w-3.5 h-3.5" />
                    )}
                    <span>{(src.isActive ?? src.status === 'active') ? 'Active' : 'Inactive'}</span>
                  </span>
                </div>

                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 min-h-[2rem]">
                  {src.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(src)}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] rounded-[var(--radius-base)] hover:bg-[var(--color-primary-bg)] transition-colors touch-target"
                  title="Edit source"
                >
                  <RiEditLine className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const displayName = src.name || src.title || 'this source';
                    if (confirm(`Delete source "${displayName}"? Historical income will retain this source name.`)) {
                      deleteMutation.mutate(src.id);
                    }
                  }}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius-base)] hover:bg-[var(--color-danger)]/10 transition-colors touch-target"
                  title="Delete source"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-[var(--radius-base)] border border-[var(--color-border)] cursor-pointer p-0.5 bg-[var(--color-surface)] shrink-0"
                title="Pick custom color"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-28 px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-mono font-semibold"
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

