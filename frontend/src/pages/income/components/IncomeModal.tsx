import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { IncomeSource, IncomeRecord, CreateIncomeInput } from '@/api/incomeApi';
import { parsePastedDate } from '@/utils/date';

const incomeSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  currency: z.enum(['MAD', 'USD', 'EUR']),
  sourceId: z.string().uuid('Please select an income source'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIncomeInput) => Promise<void>;
  sources: IncomeSource[];
  defaultCurrency: string;
  income?: IncomeRecord | null;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sources,
  defaultCurrency,
  income,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: '' as any,
      currency: (defaultCurrency as any) || 'MAD',
      sourceId: sources[0]?.id || '',
      description: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (income) {
        reset({
          date: income.date,
          amount: parseFloat(income.amount || '0'),
          currency: (income.currency as any) || 'MAD',
          sourceId: income.sourceId || '',
          description: income.description || '',
          notes: income.notes || '',
        });
      } else {
        reset({
          date: new Date().toISOString().split('T')[0],
          amount: '' as any,
          currency: (defaultCurrency as any) || 'MAD',
          sourceId: sources[0]?.id || '',
          description: '',
          notes: '',
        });
      }
      setErrorMessage(null);
    }
  }, [isOpen, income, reset, defaultCurrency, sources]);

  const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const parsed = parsePastedDate(text);
    if (parsed) {
      e.preventDefault();
      setValue('date', parsed, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleDateKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      try {
        const text = await navigator.clipboard.readText();
        const parsed = parsePastedDate(text);
        if (parsed) {
          e.preventDefault();
          setValue('date', parsed, { shouldValidate: true, shouldDirty: true });
        }
      } catch {
        // Fallback to native onPaste
      }
    }
  };

  const handleFormSubmit = async (values: IncomeFormData) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      await onSubmit({
        date: values.date,
        amount: values.amount,
        currency: values.currency,
        sourceId: values.sourceId,
        description: values.description?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      });
      reset();
      onClose();
    } catch (err: any) {
      console.error('Failed to save income:', err);
      const detailsMsg =
        err?.details && Array.isArray(err.details)
          ? err.details.map((d: any) => d.issue || d.message).filter(Boolean).join(', ')
          : null;
      setErrorMessage(detailsMsg || err?.message || 'Failed to save income. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  const isEditMode = !!income;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Income Record' : 'Record New Income'}
      description={
        isEditMode
          ? 'Update the recorded revenue details. Strictly decoupled from wallet balances.'
          : 'Add a revenue transaction. Strictly decoupled from wallet balances.'
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-[var(--radius-base)] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
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

        {/* Date & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <input
              type="date"
              {...register('date')}
              onPaste={handleDatePaste}
              onKeyDown={handleDateKeyDown}
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
            onClick={handleClose}
            className="px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-primary-bg)] touch-target"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || isSubmitting}
            className="px-5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-semibold shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-60 touch-target flex items-center gap-2"
          >
            {(isSaving || isSubmitting) && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {isSaving || isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Saving...'
                : isEditMode
                ? 'Update Income'
                : 'Save Income'}
            </span>
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};
