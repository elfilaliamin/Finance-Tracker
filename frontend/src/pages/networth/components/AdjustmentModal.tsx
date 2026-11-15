import React, { useState } from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { Wallet, CreateAdjustmentInput } from '@/api/walletApi';
import { parsePastedDate } from '@/utils/date';

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

  const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const parsed = parsePastedDate(text);
    if (parsed) {
      e.preventDefault();
      setDate(parsed);
    }
  };

  const handleDateKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      try {
        const text = await navigator.clipboard.readText();
        const parsed = parsePastedDate(text);
        if (parsed) {
          e.preventDefault();
          setDate(parsed);
        }
      } catch {
        // Fallback to native onPaste
      }
    }
  };

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
        adjustmentDate: date,
        amount: parsedAmount,
        type: mode,
        adjustmentType: mode,
        notes: notes.trim() || undefined,
      });
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        const issues = err.details
          .map((d: any) => (d.issue ? (d.field ? `${d.field}: ${d.issue}` : d.issue) : ''))
          .filter(Boolean)
          .join(', ');
        setError(issues || err.message || 'Failed to record adjustment');
      } else {
        setError(err.message || 'Failed to record adjustment');
      }
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
        <div className="flex rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] p-1 border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setMode('reconcile')}
            className={`flex-1 py-2 rounded-[var(--radius-base)] text-xs font-semibold transition-all touch-target ${
              mode === 'reconcile'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Reconciliation (Exact Count)
          </button>
          <button
            type="button"
            onClick={() => setMode('delta')}
            className={`flex-1 py-2 rounded-[var(--radius-base)] text-xs font-semibold transition-all touch-target ${
              mode === 'delta'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Delta (+/- Adjustment)
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="p-3 bg-[var(--color-primary-bg)] rounded-[var(--radius-base)] border border-[var(--color-border)] flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-muted)] font-medium">Current Registered Balance:</span>
          <span className="font-bold text-[var(--color-text)] font-mono text-sm">
            {currentBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {wallet.defaultCurrency}
          </span>
        </div>

        {error && (
          <div className="p-2.5 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-xs text-[var(--color-danger)]">
            {error}
          </div>
        )}

        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Snapshot Date *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onPaste={handleDatePaste}
            onKeyDown={handleDateKeyDown}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none font-mono text-sm pr-16"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-[var(--color-text-muted)]">
              {wallet.defaultCurrency}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            {mode === 'reconcile'
              ? 'Sets the wallet balance exactly to this value.'
              : 'Adds to or subtracts from the current balance.'}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Notes / Reason
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. End of month statement check, cash count"
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[var(--color-border)] flex justify-end gap-3">
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
            {isSubmitting ? 'Recording...' : 'Save Adjustment'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

