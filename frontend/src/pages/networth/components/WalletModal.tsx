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
  '#047857', '#10b981', '#34d399', '#059669', '#0d9488',
  '#0284c7', '#2563eb', '#7c3aed', '#db2777', '#d97706'
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
  const [color, setColor] = useState('#047857');
  const [type, setType] = useState<'asset' | 'liability'>('asset');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setDescription(wallet.description || '');
      setColor(wallet.color || '#047857');
      setType(wallet.type);
      setCurrency(wallet.defaultCurrency);
    } else {
      setName('');
      setDescription('');
      setColor('#047857');
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
        <div className="flex rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] p-1 border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setType('asset')}
            className={`flex-1 py-2 rounded-[var(--radius-base)] text-xs font-semibold transition-all touch-target ${
              type === 'asset'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Asset (Savings, Cash, Checking)
          </button>
          <button
            type="button"
            onClick={() => setType('liability')}
            className={`flex-1 py-2 rounded-[var(--radius-base)] text-xs font-semibold transition-all touch-target ${
              type === 'liability'
                ? 'bg-[var(--color-surface)] text-[var(--color-danger)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Liability (Debt, Credit Card)
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Wallet Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Attijariwafa Checking, Cash Wallet, Visa Card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Default Currency *
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          >
            <option value="MAD" className="bg-[var(--color-surface)] text-[var(--color-text)]">MAD - Moroccan Dirham</option>
            <option value="USD" className="bg-[var(--color-surface)] text-[var(--color-text)]">USD - US Dollar</option>
            <option value="EUR" className="bg-[var(--color-surface)] text-[var(--color-text)]">EUR - Euro</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Main account for bills, emergency fund..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-ring)] focus:outline-none text-sm"
          />
        </div>

        {/* Color Swatch */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Wallet Color
          </label>
          <div className="flex flex-wrap items-center gap-3.5 py-1.5">
            {WALLET_COLORS.map((c) => {
              const isSelected = color.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'ring-2 ring-[var(--color-ring)] ring-offset-2 ring-offset-[var(--color-surface)] shadow-xs scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
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
            {isSubmitting ? 'Saving...' : wallet ? 'Update Wallet' : 'Create Wallet'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

