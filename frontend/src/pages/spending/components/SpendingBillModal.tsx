import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Receipt, Minus } from 'lucide-react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { SpendingCategory, CreateSpendingInput } from '@/api/spendingApi';
import { Wallet } from '@/api/walletApi';

const spendingItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  unitPrice: z.coerce.number().positive('Price must be greater than 0'),
  quantity: z.coerce.number().int().positive('Quantity must be >= 1'),
});

const spendingBillSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  currency: z.enum(['MAD', 'USD', 'EUR']),
  paidFromWalletId: z.string().uuid().optional().or(z.literal('')),
  storeMerchant: z.string().optional(),
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
}

export const SpendingBillModal: React.FC<SpendingBillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  wallets,
  defaultCurrency,
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
      storeMerchant: '',
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

  const handleFormSubmit = async (values: SpendingBillFormData) => {
    await onSubmit({
      date: values.date,
      currency: values.currency,
      paidFromWalletId: values.paidFromWalletId ? values.paidFromWalletId : undefined,
      storeMerchant: values.storeMerchant ? values.storeMerchant.trim() : undefined,
      notes: values.notes ? values.notes.trim() : undefined,
      items: values.items.map((i) => ({
        name: i.name.trim(),
        categoryId: i.categoryId ? i.categoryId : undefined,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    });
    reset();
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="New Spending Bill"
      description="Itemize articles on this receipt. Deducts automatically from selected wallet."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col space-y-4">
        {/* Header Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm shadow-sm"
            />
            {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Paid From Wallet (Optional)
            </label>
            <select
              {...register('paidFromWalletId')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm shadow-sm"
            >
              <option value="">No Wallet (Label Only)</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.currentBalance} {w.defaultCurrency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Merchant / Store
            </label>
            <input
              type="text"
              placeholder="e.g. Carrefour, Marjane, Amazon"
              {...register('storeMerchant')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Currency *
            </label>
            <select
              {...register('currency')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm shadow-sm"
            >
              <option value="MAD">MAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Itemized Lines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Receipt size={16} /> Line Items ({fields.length})
            </span>
            <button
              type="button"
              onClick={() => append({ name: '', categoryId: '', unitPrice: 0, quantity: 1 })}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 touch-target px-2 py-1"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          {errors.items?.message && (
            <p className="text-xs text-rose-600">{errors.items.message}</p>
          )}

          <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
            {fields.map((field, idx) => {
              const currentQty = watchedItems[idx]?.quantity || 1;
              const currentPrice = watchedItems[idx]?.unitPrice || 0;
              const lineTotal = currentPrice * currentQty;

              return (
                <div
                  key={field.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 touch-target"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Article name (e.g. Milk 1L)"
                        {...register(`items.${idx}.name` as const)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                      />
                      {errors.items?.[idx]?.name && (
                        <p className="text-[11px] text-rose-600 mt-0.5">{errors.items[idx]?.name?.message}</p>
                      )}
                    </div>

                    <div>
                      <select
                        {...register(`items.${idx}.categoryId` as const)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                      >
                        <option value="">Select Category...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    {/* Quantity with +/- touch buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setValue(`items.${idx}.quantity`, Math.max(1, currentQty - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center touch-target"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        {...register(`items.${idx}.quantity` as const)}
                        className="w-12 text-center py-1.5 border border-slate-300 rounded-lg text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setValue(`items.${idx}.quantity`, currentQty + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center touch-target"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Unit Price */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 font-medium">Price:</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register(`items.${idx}.unitPrice` as const)}
                        className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-mono text-right"
                      />
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-xs font-bold text-slate-800 font-mono">
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
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs shadow-sm"
          />
        </div>

        {/* Pinned Running Total & Actions */}
        <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between gap-3 bg-white sticky bottom-0">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Grand Total
            </span>
            <span className="text-2xl font-extrabold font-mono text-rose-600">
              {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs font-semibold text-slate-500">{selectedCurrency}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md disabled:opacity-60 touch-target"
            >
              {isSubmitting ? 'Recording...' : 'Record Bill'}
            </button>
          </div>
        </div>
      </form>
    </ResponsiveModal>
  );
};

