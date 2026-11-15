import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { IncomeSource, IncomeCategory, CreateIncomeInput } from '@/api/incomeApi';

const incomeSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  currency: z.enum(['MAD', 'USD', 'EUR']),
  sourceId: z.string().uuid('Please select an income source'),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIncomeInput) => Promise<void>;
  sources: IncomeSource[];
  categories: IncomeCategory[];
  defaultCurrency: string;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sources,
  categories,
  defaultCurrency,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      currency: (defaultCurrency as any) || 'MAD',
      sourceId: sources[0]?.id || '',
    },
  });

  const handleFormSubmit = async (values: IncomeFormData) => {
    await onSubmit({
      ...values,
      categoryId: values.categoryId ? values.categoryId : undefined,
    });
    reset();
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Record New Income"
      description="Add a revenue transaction. Strictly decoupled from wallet balances."
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Date & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            />
            {errors.date && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Currency *
            </label>
            <select
              {...register('currency')}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            >
              <option value="MAD">MAD - Moroccan Dirham</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount')}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm font-mono"
          />
          {errors.amount && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.amount.message}</p>}
        </div>

        {/* Income Source */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Income Source *
          </label>
          <select
            {...register('sourceId')}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          >
            <option value="">Select a source...</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.title} {!(s.isActive ?? s.status === 'active') ? '(Inactive)' : ''}
              </option>
            ))}
          </select>
          {errors.sourceId && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.sourceId.message}</p>}
        </div>

        {/* Category (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Category (Optional)
          </label>
          <select
            {...register('categoryId')}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          >
            <option value="">None (Uncategorized)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            type="text"
            placeholder="e.g. November Consulting Invoice #104"
            {...register('description')}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            rows={2}
            placeholder="Additional context or payment reference..."
            {...register('notes')}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-primary-bg)] touch-target"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-semibold shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-60 touch-target"
          >
            {isSubmitting ? 'Saving...' : 'Save Income'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

