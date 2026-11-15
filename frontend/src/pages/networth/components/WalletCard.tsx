import React from 'react';
import { RiEqualizerLine, RiEditLine, RiDeleteBinLine, RiHistoryLine } from '@remixicon/react';
import { Wallet } from '@/api/walletApi';

interface WalletCardProps {
  wallet: Wallet;
  onAdjust: (wallet: Wallet) => void;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
  onViewTransactions?: (wallet: Wallet) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onAdjust,
  onEdit,
  onDelete,
  onViewTransactions,
}) => {
  const balance = parseFloat(wallet.currentBalance || '0');
  const isAsset = wallet.type === 'asset';

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: wallet.color }}
            />
            <h3 className="font-heading font-bold text-[var(--color-text)] text-base">{wallet.name}</h3>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-semibold uppercase tracking-wider border ${
              isAsset
                ? 'bg-[var(--color-primary-bg)] text-[var(--color-accent)] border-[var(--color-border)]'
                : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20'
            }`}
          >
            {wallet.type}
          </span>
        </div>

        {wallet.description && (
          <p className="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2">{wallet.description}</p>
        )}

        <div className="my-2">
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
            Current Balance
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`text-2xl font-bold font-mono tracking-wide ${
                isAsset ? 'text-[var(--color-text)]' : 'text-[var(--color-danger)]'
              }`}
            >
              {isAsset ? '' : '-'}
              {Math.abs(balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{wallet.defaultCurrency}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {onViewTransactions && (
            <button
              onClick={() => onViewTransactions(wallet)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] hover:bg-[var(--color-border)]/50 text-xs font-semibold transition-colors touch-target"
              title="View wallet transaction history"
            >
              <RiHistoryLine className="w-4 h-4" />
              <span>History</span>
            </button>
          )}
          <button
            onClick={() => onAdjust(wallet)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-base)] hover:bg-[var(--color-primary-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-xs font-medium border border-transparent hover:border-[var(--color-border)] transition-colors touch-target"
          >
            <RiEqualizerLine className="w-4 h-4" />
            <span>Adjust</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(wallet)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] rounded-[var(--radius-base)] hover:bg-[var(--color-primary-bg)] transition-colors touch-target"
            title="Edit wallet details"
          >
            <RiEditLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(wallet)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius-base)] hover:bg-[var(--color-danger)]/10 transition-colors touch-target"
            title="Delete wallet"
          >
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

