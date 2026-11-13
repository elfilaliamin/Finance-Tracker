import React, { useState, useEffect } from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { Wallet, CreateWalletInput } from '@/api/walletApi';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onSubmit: (data: CreateWalletInput) => Promise<void>;
  defaultCurrency: string;
}

const WALLET_COLORS = [
  '#4f46e5', '#2563eb', '#0891b2', '#059669', '#16a34a',
  '#ca8a04', '#d97706', '#dc2626', '#9333ea', '#475569'
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onSubmit,
  defaultCurrency,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [type, setType] = useState<'asset' | 'liability'>('asset');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setDescription(wallet.description || '');
      setColor(wallet.color || '#4f46e5');
      setType(wallet.type);
      setCurrency(wallet.defaultCurrency);
    } else {
      setName('');
      setDescription('');
      setColor('#4f46e5');
      setType('asset');
      setCurrency(defaultCurrency);
    }
  }, [wallet, defaultCurrency, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        type,
        defaultCurrency: currency,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={wallet ? 'Edit Wallet' : 'Create New Wallet'}
      description="Wallets represent named financial pools used by Net Worth, Spending, and Budgets."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type: Asset vs Liability */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setType('asset')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all touch-target ${
              type === 'asset'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Asset (Savings, Cash, Checking)
          </button>
          <button
            type="button"
            onClick={() => setType('liability')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all touch-target ${
              type === 'liability'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Liability (Debt, Credit Card)
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Wallet Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Attijariwafa Checking, Cash Wallet, Visa Card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm shadow-sm"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Default Currency *
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm shadow-sm"
          >
            <option value="MAD">MAD - Moroccan Dirham</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Main account for bills, emergency fund..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm shadow-sm"
          />
        </div>

        {/* Color Swatch */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Wallet Color
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {WALLET_COLORS.map((c) => (
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
            {isSubmitting ? 'Saving...' : wallet ? 'Update Wallet' : 'Create Wallet'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

