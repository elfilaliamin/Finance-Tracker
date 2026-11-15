import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { walletApi, Wallet, CreateTransferInput } from '@/api/walletApi';
import { parsePastedDate } from '@/utils/date';
import { RiSwapLine, RiArrowRightLine, RiInformationLine, RiAlertLine } from '@remixicon/react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  defaultFromWalletId?: string;
  defaultToWalletId?: string;
  onTransferSuccess?: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  wallets,
  defaultFromWalletId,
  defaultToWalletId,
  onTransferSuccess,
}) => {
  const [fromWalletId, setFromWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset selections when modal opens or defaults change
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setAmount('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);

      if (wallets.length >= 2) {
        const initialFrom =
          defaultFromWalletId && wallets.some((w) => w.id === defaultFromWalletId)
            ? defaultFromWalletId
            : wallets[0].id;

        setFromWalletId(initialFrom);

        const possibleTo = wallets.filter((w) => w.id !== initialFrom);
        const initialTo =
          defaultToWalletId && possibleTo.some((w) => w.id === defaultToWalletId)
            ? defaultToWalletId
            : possibleTo[0]?.id || '';

        setToWalletId(initialTo);
      } else if (wallets.length === 1) {
        setFromWalletId(wallets[0].id);
        setToWalletId('');
      }
    }
  }, [isOpen, defaultFromWalletId, defaultToWalletId, wallets]);

  // When fromWalletId changes, ensure toWalletId is not the same
  const handleFromWalletChange = (newFromId: string) => {
    setFromWalletId(newFromId);
    if (toWalletId === newFromId) {
      const remaining = wallets.find((w) => w.id !== newFromId);
      setToWalletId(remaining ? remaining.id : '');
    }
  };

  const fromWallet = useMemo(() => wallets.find((w) => w.id === fromWalletId), [wallets, fromWalletId]);
  const toWallet = useMemo(() => wallets.find((w) => w.id === toWalletId), [wallets, toWalletId]);

  const fromBalance = fromWallet ? parseFloat(fromWallet.currentBalance || '0') : 0;
  const isDiffCurrency =
    fromWallet && toWallet && fromWallet.defaultCurrency !== toWallet.defaultCurrency;

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
        // Fallback
      }
    }
  };

  const handleSetMaxAmount = () => {
    if (fromBalance > 0) {
      setAmount(fromBalance.toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid transfer amount greater than 0.');
      return;
    }

    if (!fromWalletId || !toWalletId) {
      setError('Please select both a source and destination wallet.');
      return;
    }

    if (fromWalletId === toWalletId) {
      setError('Source and destination wallets must be different.');
      return;
    }

    if (fromWallet && fromWallet.type === 'asset' && parsedAmount > fromBalance) {
      setError(
        `Insufficient balance in ${fromWallet.name}. Current balance is ${fromBalance.toFixed(2)} ${fromWallet.defaultCurrency}.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: CreateTransferInput = {
        fromWalletId,
        toWalletId,
        amount: parsedAmount,
        transferDate: date,
        notes: notes.trim() || undefined,
      };

      await walletApi.transfer(payload);

      if (onTransferSuccess) {
        onTransferSuccess();
      }
      onClose();
    } catch (err: any) {
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        const issues = err.details
          .map((d: any) => (d.issue ? (d.field ? `${d.field}: ${d.issue}` : d.issue) : ''))
          .filter(Boolean)
          .join(', ');
        setError(issues || err.message || 'Failed to complete transfer');
      } else {
        setError(err.message || 'Failed to complete transfer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Money Between Wallets"
      description="Move funds seamlessly between your cash reserves, bank accounts, and cards."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-[var(--radius-base)] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-start gap-2">
            <RiAlertLine className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Source & Destination Wallets Visual Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          {/* Source Wallet (Gives / Red in history) */}
          <div className="space-y-1.5 p-3 rounded-[var(--radius-base)] border border-rose-500/30 bg-rose-50/30 dark:bg-rose-950/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <span>From (Sender)</span>
              </label>
              {fromWallet && (
                <span className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)]">
                  Bal: {fromBalance.toFixed(2)} {fromWallet.defaultCurrency}
                </span>
              )}
            </div>

            <select
              value={fromWalletId}
              onChange={(e) => handleFromWalletChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-1 focus:ring-rose-500 focus:outline-none"
              required
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({parseFloat(w.currentBalance).toFixed(2)} {w.defaultCurrency})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
              Funds will be deducted (recorded in red)
            </p>
          </div>

          {/* Destination Wallet (Receives / Blue in history) */}
          <div className="space-y-1.5 p-3 rounded-[var(--radius-base)] border border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                <span>To (Receiver)</span>
              </label>
              {toWallet && (
                <span className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)]">
                  Bal: {parseFloat(toWallet.currentBalance).toFixed(2)} {toWallet.defaultCurrency}
                </span>
              )}
            </div>

            <select
              value={toWalletId}
              onChange={(e) => setToWalletId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="" disabled>Select destination wallet</option>
              {wallets
                .filter((w) => w.id !== fromWalletId)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({parseFloat(w.currentBalance).toFixed(2)} {w.defaultCurrency})
                  </option>
                ))}
            </select>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              Funds will be credited (recorded in blue)
            </p>
          </div>
        </div>

        {/* Currency Difference Note */}
        {isDiffCurrency && (
          <div className="p-2.5 rounded-[var(--radius-base)] bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
            <RiInformationLine className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <p className="font-semibold">Multi-Currency Transfer</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                From {fromWallet?.defaultCurrency} to {toWallet?.defaultCurrency}. Automatic conversion at the effective exchange rate will be calculated.
              </p>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--color-text)]">
              Amount to Transfer *
            </label>
            {fromBalance > 0 && (
              <button
                type="button"
                onClick={handleSetMaxAmount}
                className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline"
              >
                Transfer Max ({fromBalance.toFixed(2)} {fromWallet?.defaultCurrency})
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-3 pr-16 py-2 text-sm font-mono font-bold rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
              required
            />
            <span className="absolute right-3 top-2.5 text-xs font-bold text-[var(--color-text-muted)]">
              {fromWallet?.defaultCurrency || 'MAD'}
            </span>
          </div>
        </div>

        {/* Transfer Date Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-text)]">
            Transfer Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onPaste={handleDatePaste}
            onKeyDown={handleDateKeyDown}
            className="w-full px-3 py-2 text-xs rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none font-mono"
            required
          />
        </div>

        {/* Optional Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-text)]">
            Notes / Reference (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Monthly savings allocation, ATM withdrawal..."
            className="w-full px-3 py-2 text-xs rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-medium hover:bg-[var(--color-primary-bg)] touch-target transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || wallets.length < 2}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed touch-target shadow-xs transition-colors"
          >
            <RiSwapLine size={14} />
            <span>{isSubmitting ? 'Transferring...' : 'Execute Transfer'}</span>
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};
