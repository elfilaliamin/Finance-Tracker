import React, { useState, useEffect } from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { CreateBudgetInput, Budget } from '@/api/budgetApi';
import { SpendingCategory } from '@/api/spendingApi';
import { Wallet } from '@/api/walletApi';
import { RiAlertLine } from '@remixicon/react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBudgetInput) => Promise<void>;
  categories: SpendingCategory[];
  wallets: Wallet[];
  defaultCurrency: string;
  budget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  wallets,
  defaultCurrency,
  budget,
}) => {
  const [type, setType] = useState<'spending_limit' | 'saving_goal'>('spending_limit');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [period, setPeriod] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (budget) {
        setType(budget.type);
        setName(budget.name);
        setTargetAmount(budget.targetAmount);
        setCurrency(budget.currency || defaultCurrency);
        setPeriod(budget.period || 'monthly');
        setStartDate(budget.startDate || new Date().toISOString().split('T')[0]);
        setCategoryId(budget.categoryId || budget.spendingCategoryId || '');
        setWalletId(budget.walletId || budget.wallet?.id || '');
        setEndDate(budget.endDate || '');
        setNotes(budget.notes || '');
      } else {
        setType('spending_limit');
        setName('');
        setTargetAmount('');
        setCurrency(defaultCurrency);
        setPeriod('monthly');
        setStartDate(new Date().toISOString().split('T')[0]);
        setCategoryId('');
        setWalletId('');
        setEndDate('');
        setNotes('');
      }
    }
  }, [isOpen, budget, defaultCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount);
    if (!name.trim() || isNaN(amount) || amount <= 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onSubmit({
        name: name.trim(),
        type,
        targetAmount: amount,
        currency,
        period,
        categoryId: categoryId || undefined,
        spendingCategoryId: categoryId || undefined,
        walletId: walletId || undefined,
        startDate,
        endDate: endDate || undefined,
        notes: notes.trim() || undefined,
      });
      setName('');
      setTargetAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create budget plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        budget
          ? budget.type === 'spending_limit'
            ? 'Edit Spending Limit'
            : 'Edit Saving Goal'
          : type === 'spending_limit'
          ? 'Create Spending Limit'
          : 'Create Saving Goal'
      }
      description={
        budget
          ? 'Update your target amounts, timeline, or restrictions.'
          : 'Plan your financial boundaries and future milestones.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 flex items-center gap-2.5 text-[var(--color-danger)] text-xs sm:text-sm">
            <RiAlertLine className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Type Toggle (only when creating new) */}
        {!budget && (
          <div className="flex rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] p-1 border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setType('spending_limit')}
              className={`flex-1 py-2 rounded-[var(--radius-base)] text-xs font-semibold transition-all touch-target ${
                type === 'spending_limit'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Spending Limit (Expense Cap)
            </button>
            <button
              type="button"
              onClick={() => setType('saving_goal')}
              className={`flex-1 py-2 rounded-[var(--radius-base)] text-xs font-semibold transition-all touch-target ${
                type === 'saving_goal'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Saving Goal (Target Balance)
            </button>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            {type === 'spending_limit' ? 'Budget Name *' : 'Goal Name *'}
          </label>
          <input
            type="text"
            required
            placeholder={type === 'spending_limit' ? 'e.g. Monthly Dining Out' : 'e.g. Emergency Fund 2026'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          />
        </div>

        {/* Target Amount & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Target Amount *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Currency *
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
            >
              <option value="MAD" className="bg-[var(--color-surface)] text-[var(--color-text)]">MAD</option>
              <option value="USD" className="bg-[var(--color-surface)] text-[var(--color-text)]">USD</option>
              <option value="EUR" className="bg-[var(--color-surface)] text-[var(--color-text)]">EUR</option>
            </select>
          </div>
        </div>

        {type === 'spending_limit' ? (
          <>
            {/* Period & Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Period
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
                >
                  <option value="monthly" className="bg-[var(--color-surface)] text-[var(--color-text)]">Monthly Reset</option>
                  <option value="yearly" className="bg-[var(--color-surface)] text-[var(--color-text)]">Yearly Reset</option>
                  <option value="custom" className="bg-[var(--color-surface)] text-[var(--color-text)]">Custom Duration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Spending Category (Optional)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
                >
                  <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Restricted to Wallet (Optional)
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
                >
                  <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">All Wallets</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Target Wallet for Saving Goal */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Target Wallet *
              </label>
              <select
                value={walletId}
                onChange={(e) => {
                  const selId = e.target.value;
                  setWalletId(selId);
                  const selWallet = wallets.find((w) => w.id === selId);
                  if (selWallet?.defaultCurrency) {
                    setCurrency(selWallet.defaultCurrency);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
              >
                <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">Select a wallet...</option>
                {wallets
                  .filter((w) => w.type === 'asset')
                  .map((w) => (
                    <option key={w.id} value={w.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                      {w.name} ({w.currentBalance} {w.defaultCurrency})
                    </option>
                  ))}
              </select>
            </div>

            {/* Start Date & Target Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
                />
              </div>
            </div>
          </>
        )}

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
            {isSubmitting ? 'Saving...' : budget ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

