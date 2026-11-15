import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RiAddLine, RiDeleteBinLine, RiReceiptLine, RiSubtractLine, RiAlertLine } from '@remixicon/react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { SpendingCategory, SpendingRecord, CreateSpendingInput } from '@/api/spendingApi';
import { Wallet } from '@/api/walletApi';

const spendingItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  categoryId: z.string().optional().nullable(),
  unitPrice: z.coerce.number().positive('Price must be greater than 0'),
  quantity: z.coerce.number().int().positive('Quantity must be >= 1'),
});

const spendingBillSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  currency: z.enum(['MAD', 'USD', 'EUR']),
  paidFromWalletId: z.string().uuid().optional().or(z.literal('')),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(spendingItemSchema).min(1, 'At least one item is required'),
});

type SpendingBillFormData = z.infer<typeof spendingBillSchema>;

interface SpendingBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSpendingInput) => Promise<void>;
  categories: SpendingCategory[];
  wallets: Wallet[];
  defaultCurrency: string;
  spending?: SpendingRecord | null;
}

export const SpendingBillModal: React.FC<SpendingBillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  wallets,
  defaultCurrency,
  spending,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpendingBillFormData>({
    resolver: zodResolver(spendingBillSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      currency: (defaultCurrency as any) || 'MAD',
      paidFromWalletId: '',
      categoryId: '',
      notes: '',
      items: [{ name: '', categoryId: '', unitPrice: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items') || [];
  const selectedCurrency = watch('currency') || 'MAD';

  // Compute live subtotal
  const grandTotal = watchedItems.reduce((sum, itm) => {
    const price = typeof itm?.unitPrice === 'number' ? itm.unitPrice : parseFloat(itm?.unitPrice || '0') || 0;
    const qty = typeof itm?.quantity === 'number' ? itm.quantity : parseInt(itm?.quantity || '1', 10) || 1;
    return sum + price * qty;
  }, 0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (spending) {
        const initialCatId =
          spending.categoryId ||
          spending.items?.find((i) => i.categoryId)?.categoryId ||
          categories.find((c) => c.name.toLowerCase() === (spending.storeMerchant || '').toLowerCase())?.id ||
          '';

        reset({
          date: spending.date,
          currency: (spending.currency as any) || 'MAD',
          paidFromWalletId: spending.paidFromWalletId || '',
          categoryId: initialCatId,
          notes: spending.notes || '',
          items:
            spending.items && spending.items.length > 0
              ? spending.items.map((i) => ({
                  name: i.name,
                  categoryId: i.categoryId || initialCatId || '',
                  unitPrice: typeof i.unitPrice === 'number' ? i.unitPrice : parseFloat(i.unitPrice as any) || 0,
                  quantity: typeof i.quantity === 'number' ? i.quantity : parseInt(i.quantity as any, 10) || 1,
                }))
              : [{ name: '', categoryId: initialCatId || '', unitPrice: 0, quantity: 1 }],
        });
      } else {
        reset({
          date: new Date().toISOString().split('T')[0],
          currency: (defaultCurrency as any) || 'MAD',
          paidFromWalletId: '',
          categoryId: categories[0]?.id || '',
          notes: '',
          items: [{ name: '', categoryId: categories[0]?.id || '', unitPrice: 0, quantity: 1 }],
        });
      }
      setErrorMessage(null);
    }
  }, [isOpen, spending, reset, defaultCurrency, categories]);

  const handleFormSubmit = async (values: SpendingBillFormData) => {
    try {
      setErrorMessage(null);
      const selectedCat = categories.find((c) => c.id === values.categoryId);

      await onSubmit({
        date: values.date,
        currency: values.currency,
        paidFromWalletId: values.paidFromWalletId ? values.paidFromWalletId : undefined,
        categoryId: values.categoryId ? values.categoryId : undefined,
        storeMerchant: selectedCat?.name || undefined,
        notes: values.notes ? values.notes.trim() : undefined,
        items: values.items.map((i) => ({
          name: i.name.trim(),
          categoryId: values.categoryId ? values.categoryId : undefined,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
      });
      reset();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save spending bill. Please check your inputs.');
    }
  };

  const isEditMode = !!spending;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Spending Bill' : 'New Spending Bill'}
      description={
        isEditMode
          ? 'Update articles on this receipt. Automatically recalculates wallet balances.'
          : 'Itemize articles on this receipt. Deducts automatically from selected wallet.'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col space-y-4">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 flex items-center gap-2.5 text-[var(--color-danger)] text-xs sm:text-sm">
            <RiAlertLine className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Header Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[var(--color-primary-bg)] rounded-[var(--radius-base)] border border-[var(--color-border)]">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            />
            {errors.date && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Paid From Wallet (Optional)
            </label>
            <select
              {...register('paidFromWalletId')}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            >
              <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">No Wallet (Label Only)</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  {w.name} ({w.currentBalance} {w.defaultCurrency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            >
              <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Currency *
            </label>
            <select
              {...register('currency')}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            >
              <option value="MAD" className="bg-[var(--color-surface)] text-[var(--color-text)]">MAD</option>
              <option value="USD" className="bg-[var(--color-surface)] text-[var(--color-text)]">USD</option>
              <option value="EUR" className="bg-[var(--color-surface)] text-[var(--color-text)]">EUR</option>
            </select>
          </div>
        </div>

        {/* Itemized Lines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
              <RiReceiptLine className="w-4 h-4 text-[var(--color-accent)]" /> Line Items ({fields.length})
            </span>
            <button
              type="button"
              onClick={() => append({ name: '', categoryId: '', unitPrice: 0, quantity: 1 })}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] hover:underline touch-target px-2 py-1"
            >
              <RiAddLine className="w-4 h-4" /> Add Item
            </button>
          </div>

          {errors.items?.message && (
            <p className="text-xs text-[var(--color-danger)]">{errors.items.message}</p>
          )}

          <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
            {fields.map((field, idx) => {
              const currentQty = watchedItems[idx]?.quantity || 1;
              const currentPrice = watchedItems[idx]?.unitPrice || 0;
              const lineTotal = currentPrice * currentQty;

              return (
                <div
                  key={field.id}
                  className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] shadow-[var(--shadow-sm)] space-y-2 relative"
                >
                  {/* Article Name and Quantity Stepper side by side */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] w-5 shrink-0">#{idx + 1}</span>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="Article name (e.g. Carrots 1KG)"
                        {...register(`items.${idx}.name` as const)}
                        className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
                      />
                      {errors.items?.[idx]?.name && (
                        <p className="text-[11px] text-[var(--color-danger)] mt-0.5">{errors.items[idx]?.name?.message}</p>
                      )}
                    </div>

                    {/* Quantity Stepper right beside the article name */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setValue(`items.${idx}.quantity`, Math.max(1, currentQty - 1))}
                        className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] hover:bg-[var(--color-border)]/50 text-[var(--color-text)] font-bold flex items-center justify-center touch-target"
                      >
                        <RiSubtractLine className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        {...register(`items.${idx}.quantity` as const)}
                        className="w-12 text-center py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-[var(--radius-base)] text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setValue(`items.${idx}.quantity`, currentQty + 1)}
                        className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] hover:bg-[var(--color-border)]/50 text-[var(--color-text)] font-bold flex items-center justify-center touch-target"
                      >
                        <RiAddLine className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1.5 rounded-[var(--radius-base)] hover:bg-[var(--color-danger)]/10 touch-target shrink-0"
                        title="Remove item"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Unit Price & Line Total */}
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--color-text-muted)] font-medium">Price:</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register(`items.${idx}.unitPrice` as const)}
                        className="w-24 px-2.5 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-[var(--radius-base)] text-sm font-mono text-right"
                      />
                      {errors.items?.[idx]?.unitPrice && (
                        <p className="text-[11px] text-[var(--color-danger)]">{errors.items[idx]?.unitPrice?.message}</p>
                      )}
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-mono font-bold text-sm text-[var(--color-text)]">
                        {lineTotal.toFixed(2)} {selectedCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <input
            type="text"
            placeholder="Bill notes or reference (optional)..."
            {...register('notes')}
            className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs"
          />
        </div>

        {/* Pinned Running Total & Actions */}
        <div className="pt-3 border-t-2 border-[var(--color-border)] flex items-center justify-between gap-3 bg-[var(--color-surface)] sticky bottom-0">
          <div>
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
              Grand Total
            </span>
            <span className="text-2xl font-heading font-extrabold font-mono text-[var(--color-danger)]">
              {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">{selectedCurrency}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
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
              {isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Recording...'
                : isEditMode
                ? 'Update Bill'
                : 'Record Bill'}
            </button>
          </div>
        </div>
      </form>
    </ResponsiveModal>
  );
};
