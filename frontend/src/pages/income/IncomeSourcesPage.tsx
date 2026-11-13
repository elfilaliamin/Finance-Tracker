import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { incomeApi, IncomeSource } from '@/api/incomeApi';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#f59e0b', '#14b8a6', '#06b6d4', '#84cc16', '#64748b'
];

export const IncomeSourcesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);

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
    mutationFn: (data: { name: string; description?: string; color: string; isActive?: boolean }) =>
      incomeApi.createSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      incomeApi.updateSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incomeApi.deleteSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingSource(null);
    setName('');
    setDescription('');
    setColor('#10b981');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (src: IncomeSource) => {
    setEditingSource(src);
    setName(src.name);
    setDescription(src.description || '');
    setColor(src.color);
    setIsActive(src.isActive);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSource(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSource) {
      updateMutation.mutate({
        id: editingSource.id,
        data: { name, description, color, isActive },
      });
    } else {
      createMutation.mutate({ name, description, color, isActive });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Income Sources</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Define your employers, clients, investments, and revenue channels.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all touch-target"
        >
          <Plus size={18} />
          <span>New Source</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-slate-400">Loading sources...</div>
      ) : sources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500 text-sm">No income sources created yet.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Plus size={16} /> Create your first income source
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: src.color }}
                    />
                    <h3 className="font-bold text-slate-900 text-base">{src.name}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      src.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {src.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{src.isActive ? 'Active' : 'Inactive'}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                  {src.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(src)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors touch-target"
                  title="Edit source"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete source "${src.name}"? Historical income will retain this source name.`)) {
                      deleteMutation.mutate(src.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors touch-target"
                  title="Delete source"
                >
                  <Trash2 size={16} />
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Source Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp, Upwork, Dividend Portfolio"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary salary, contract client, etc."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Color Swatch
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Active Source (shows in dropdowns)
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md touch-target"
            >
              {editingSource ? 'Update Source' : 'Create Source'}
            </button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
};

