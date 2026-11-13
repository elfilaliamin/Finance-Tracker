import React, { useState } from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { CreateBudgetInput } from '@/api/budgetApi';
import { SpendingCategory } from '@/api/spendingApi';
import { Wallet } from '@/api/walletApi';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBudgetInput) => Promise<void>;
  categories: SpendingCategory[];
  wallets: Wallet[];
  defaultCurrency: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  wallets,
  defaultCurrency,
}) => {
  const [type, setType] = useState<'spending_limit' | 'saving_goal'>('spending_limit');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [period, setPeriod] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount);
    if (!name.trim() || isNaN(amount) || amount <= 0) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        type,
        targetAmount: amount,
        currency,
        period,
        spendingCategoryId: categoryId || undefined,
        walletId: walletId || undefined,
        endDate: endDate || undefined,
        notes: notes.trim() || undefined,
      });
      setName('');
      setTargetAmount('');
      setNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'spending_limit' ? 'Create Spending Limit' : 'Create Saving Goal'}
      description="Plan your financial boundaries and future milestones."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setType('spending_limit')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all touch-target ${
              type === 'spending_limit'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spending Limit (Expense Cap)
          </button>
          <button
            type="button"
            onClick={() => setType('saving_goal')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all touch-target ${
              type === 'saving_goal'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saving Goal (Target Balance)
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {type === 'spending_limit' ? 'Budget Name *' : 'Goal Name *'}
          </label>
          <input
            type="text"
            required
            placeholder={type === 'spending_limit' ? 'e.g. Monthly Dining Out' : 'e.g. Emergency Fund 2026'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm shadow-sm"
          />
        </div>

        {/* Target Amount & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Amount *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Currency *
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm shadow-sm"
            >
              <option value="MAD">MAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {type === 'spending_limit' ? (
          <>
            {/* Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Period
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm shadow-sm"
                >
                  <option value="monthly">Monthly Reset</option>
                  <option value="yearly">Yearly Reset</option>
                  <option value="custom">Custom Duration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Spending Category (Optional)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm shadow-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Restricted to Wallet (Optional)
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm shadow-sm"
              >
                <option value="">All Wallets</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Target Wallet for Saving Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Wallet *
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm shadow-sm"
              >
                <option value="">Select a wallet...</option>
                {wallets
                  .filter((w) => w.type === 'asset')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.currentBalance} {w.defaultCurrency})
                    </option>
                  ))}
              </select>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm shadow-sm"
              />
            </div>
          </>
        )}

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
            {isSubmitting ? 'Saving...' : 'Create Plan'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

