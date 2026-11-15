import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RiCloseLine,
  RiArrowRightDownLine,
  RiArrowRightUpLine,
  RiShoppingBag3Line,
  RiEqualizerLine,
  RiSearchLine,
  RiCalendarLine,
  RiSwapLine,
  RiHistoryLine,
  RiAddLine,
} from '@remixicon/react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { walletApi, Wallet, WalletTransactionItem } from '@/api/walletApi';

interface WalletTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onOpenAdjust?: (wallet: Wallet) => void;
  onOpenTransfer?: (wallet: Wallet) => void;
}

export const WalletTransactionsModal: React.FC<WalletTransactionsModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onOpenAdjust,
  onOpenTransfer,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'in' | 'spending' | 'transfer' | 'adjustment'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['walletTransactions', wallet?.id],
    queryFn: () => (wallet ? walletApi.getTransactions(wallet.id) : null),
    enabled: isOpen && !!wallet?.id,
  });

  const transactions = data?.transactions || [];
  const summary = data?.summary || {
    totalAdded: '0.00',
    totalSpent: '0.00',
    netChange: '0.00',
    transactionCount: 0,
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type filtering
      if (filterType === 'in' && t.direction !== 'in') return false;
      if (filterType === 'spending' && t.source !== 'spending') return false;
      if (filterType === 'transfer' && t.source !== 'transfer') return false;
      if (filterType === 'adjustment' && t.source !== 'adjustment') return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query);
        const matchesStore = t.spendingDetails?.store?.toLowerCase().includes(query);
        const matchesTransfer = t.transferDetails?.otherWalletName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesNotes && !matchesStore && !matchesTransfer) return false;
      }

      return true;
    });
  }, [transactions, filterType, searchQuery]);

  if (!wallet) return null;

  const balanceNum = parseFloat(wallet.currentBalance || '0');
  const isAsset = wallet.type === 'asset';

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="2xl"
    >
      <div className="space-y-5 -mt-2">
        {/* Header with Wallet Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-xs ring-2 ring-[var(--color-surface)] ring-offset-1"
              style={{ backgroundColor: wallet.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-heading font-bold text-[var(--color-text)]">
                  {wallet.name}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-semibold uppercase tracking-wider border ${
                    isAsset
                      ? 'bg-[var(--color-primary-bg)] text-[var(--color-accent)] border-[var(--color-border)]'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  }`}
                >
                  {wallet.type}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {wallet.description || 'Full transaction history: money added and spendings.'}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-[var(--color-primary-bg)] sm:bg-transparent p-2.5 sm:p-0 rounded-[var(--radius-base)] border sm:border-0 border-[var(--color-border)]">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Current Balance
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-bold font-mono tracking-wide ${
                  isAsset ? 'text-[var(--color-text)]' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isAsset ? '' : '-'}
                {Math.abs(balanceNum).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs font-bold text-[var(--color-text-muted)]">
                {wallet.defaultCurrency}
              </span>
            </div>
          </div>
        </div>

        {/* High-Level Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium mb-1">
              <RiArrowRightDownLine className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Money Added</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              +{parseFloat(summary.totalAdded).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-[11px] font-medium text-[var(--color-text-muted)]">{wallet.defaultCurrency}</span>
            </div>
          </div>

          <div className="p-3 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium mb-1">
              <RiShoppingBag3Line className="w-3.5 h-3.5 text-rose-500" />
              <span>Total Spending</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
              -{parseFloat(summary.totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-[11px] font-medium text-[var(--color-text-muted)]">{wallet.defaultCurrency}</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium mb-1">
              <RiHistoryLine className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Net History</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[var(--color-text)]">
              {parseFloat(summary.netChange) >= 0 ? '+' : ''}
              {parseFloat(summary.netChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-[11px] font-medium text-[var(--color-text-muted)]">{wallet.defaultCurrency}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          {/* Tabs */}
          <div className="flex items-center rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] p-1 border border-[var(--color-border)] text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 ${
                filterType === 'all'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('in')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 flex items-center gap-1 ${
                filterType === 'in'
                  ? 'bg-[var(--color-surface)] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span>Added (+)</span>
            </button>
            <button
              onClick={() => setFilterType('spending')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 flex items-center gap-1 ${
                filterType === 'spending'
                  ? 'bg-[var(--color-surface)] text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span>Spending (-)</span>
            </button>
            <button
              onClick={() => setFilterType('transfer')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 flex items-center gap-1 ${
                filterType === 'transfer'
                  ? 'bg-[var(--color-surface)] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span>Transfers</span>
            </button>
            <button
              onClick={() => setFilterType('adjustment')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 ${
                filterType === 'adjustment'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Adjustments
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <RiSearchLine className="absolute left-3 top-2.5 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store, note..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 divide-y divide-[var(--color-border)]">
          {isLoading ? (
            <div className="py-12 flex justify-center text-xs text-[var(--color-text-muted)]">
              Loading wallet transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
              <RiHistoryLine className="w-10 h-10 mx-auto text-[var(--color-text-muted)]/40 mb-2" />
              <p className="text-sm font-medium">No transactions found.</p>
              <p className="text-xs mt-1">
                {searchQuery || filterType !== 'all'
                  ? 'Try clearing the search or filter.'
                  : 'Money added to this wallet and spendings paid from it will be tracked here.'}
              </p>
              {onOpenAdjust && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdjust(wallet);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  <RiAddLine size={14} />
                  <span>Add Money / Adjust</span>
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map((t) => {
              const isTransfer = t.source === 'transfer';
              const isTransferReceiver = isTransfer && t.direction === 'in';
              const isTransferSender = isTransfer && t.direction === 'out';
              const isSpending = t.source === 'spending';
              const isReconcile = t.type === 'reconcile';
              const isAdded = !isTransfer && t.direction === 'in';

              // Visual styling mapping per user requirements:
              // Receiver: in blue
              // Sender (wallet that gives): in red
              // Spending: in red
              // Regular added: in green
              let badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
              let badgeLabel = 'Transfer In';
              let iconColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
              let amountColor = 'text-blue-600 dark:text-blue-400';
              let IconComponent = RiArrowRightDownLine;

              if (isTransferReceiver) {
                // Receiver wallet: in BLUE
                badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
                badgeLabel = t.transferDetails?.otherWalletName
                  ? `From ${t.transferDetails.otherWalletName}`
                  : 'Transfer In';
                iconColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                amountColor = 'text-blue-600 dark:text-blue-400';
                IconComponent = RiArrowRightDownLine;
              } else if (isTransferSender) {
                // Wallet that gives (sender): in RED
                badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                badgeLabel = t.transferDetails?.otherWalletName
                  ? `To ${t.transferDetails.otherWalletName}`
                  : 'Transfer Out';
                iconColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
                amountColor = 'text-rose-600 dark:text-rose-400';
                IconComponent = RiArrowRightUpLine;
              } else if (isSpending) {
                badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                badgeLabel = 'Spending';
                iconColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
                amountColor = 'text-rose-600 dark:text-rose-400';
                IconComponent = RiShoppingBag3Line;
              } else if (isReconcile) {
                badgeColor = 'bg-[var(--color-primary-bg)] text-[var(--color-accent)] border-[var(--color-border)]';
                badgeLabel = 'Reconciliation';
                iconColor = 'bg-[var(--color-primary-bg)] text-[var(--color-accent)]';
                amountColor =
                  t.direction === 'in'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400';
                IconComponent = RiEqualizerLine;
              } else if (isAdded) {
                badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                badgeLabel = 'Money Added';
                iconColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                amountColor = 'text-emerald-600 dark:text-emerald-400';
                IconComponent = RiArrowRightDownLine;
              } else {
                badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                badgeLabel = 'Deduction';
                iconColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
                amountColor = 'text-rose-600 dark:text-rose-400';
                IconComponent = RiArrowRightUpLine;
              }

              return (
                <div
                  key={`${t.source}-${t.id}`}
                  className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[var(--color-text)] truncate">
                          {t.title}
                        </h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-[var(--radius-pill)] border ${badgeColor}`}
                        >
                          {badgeLabel}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                          {t.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <RiCalendarLine className="w-3 h-3" />
                          {t.date}
                        </span>
                        {t.adjustmentDetails && (
                          <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                            Balance: {parseFloat(t.adjustmentDetails.resultingBalance).toFixed(2)} {t.currency}
                          </span>
                        )}
                        {t.transferDetails?.exchangeRate && t.transferDetails.exchangeRate !== '1' && (
                          <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                            Rate: {parseFloat(t.transferDetails.exchangeRate).toFixed(4)}
                          </span>
                        )}
                        {t.notes && t.notes !== t.description && (
                          <span className="italic truncate max-w-[200px]">
                            &ldquo;{t.notes}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono tracking-wide ${amountColor}`}
                    >
                      {t.signedAmount}{' '}
                      <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                        {t.currency}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onOpenAdjust && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdjust(wallet);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] hover:bg-[var(--color-primary-bg)]/80 text-[var(--color-accent)] text-xs font-semibold border border-[var(--color-border)] transition-colors touch-target"
              >
                <RiSwapLine size={14} />
                <span>Adjust Balance</span>
              </button>
            )}
            {onOpenTransfer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTransfer(wallet);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-base)] bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20 transition-colors touch-target"
              >
                <RiSwapLine size={14} />
                <span>Transfer Funds</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-medium hover:bg-[var(--color-primary-bg)] touch-target"
          >
            Close
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
