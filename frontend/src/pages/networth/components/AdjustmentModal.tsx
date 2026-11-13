import React, { useState } from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { Wallet, CreateAdjustmentInput } from '@/api/walletApi';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onSubmit: (input: CreateAdjustmentInput) => Promise<void>;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onSubmit,
}) => {
  const [mode, setMode] = useState<'delta' | 'reconcile'>('reconcile');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!wallet) return null;

  const currentBal = parseFloat(wallet.currentBalance || '0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      setError('Please enter a valid amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        date,
        amount: parsedAmount,
        type: mode,
        notes: notes.trim() || undefined,
      });
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Balance: ${wallet.name}`}
      description="Record a manual balance update or count reconciliation."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('reconcile')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all touch-target ${
              mode === 'reconcile'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reconciliation (Exact Count)
          </button>
          <button
            type="button"
            onClick={() => setMode('delta')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all touch-target ${
              mode === 'delta'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delta (+/- Adjustment)
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Current Registered Balance:</span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            {currentBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {wallet.defaultCurrency}
          </span>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Snapshot Date *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm shadow-sm"
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {mode === 'reconcile' ? 'New Counted Balance *' : 'Delta (+ / - Amount) *'}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              required
              placeholder={mode === 'reconcile' ? 'e.g. 15400.00' : 'e.g. 500.00 or -200.00'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm shadow-sm pr-16"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">
              {wallet.defaultCurrency}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {mode === 'reconcile'
              ? 'Sets the wallet balance exactly to this value.'
              : 'Adds to or subtracts from the current balance.'}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Notes / Reason
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. End of month statement check, cash count"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
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
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md disabled:opacity-60 touch-target"
          >
            {isSubmitting ? 'Recording...' : 'Save Adjustment'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

