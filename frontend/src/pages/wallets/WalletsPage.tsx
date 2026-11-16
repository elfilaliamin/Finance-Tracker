import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiAddLine,
  RiWallet3Line,
  RiArrowRightUpLine,
  RiArrowRightDownLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSwapLine,
  RiSearchLine,
  RiBankCardLine,
  RiFilterLine,
  RiHistoryLine,
} from '@remixicon/react';
import { walletApi, Wallet, CreateWalletInput, CreateAdjustmentInput } from '@/api/walletApi';
import { dashboardApi } from '@/api/dashboardApi';
import { useAuth } from '@/hooks/useAuth';
import { WalletModal } from '../networth/components/WalletModal';
import { AdjustmentModal } from '../networth/components/AdjustmentModal';
import { WalletTransactionsModal } from '../networth/components/WalletTransactionsModal';
import { TransferModal } from '../networth/components/TransferModal';

export const WalletsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const baseCurrency = user?.baseCurrency || 'MAD';

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingWallet, setAdjustingWallet] = useState<Wallet | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferDefaultWallet, setTransferDefaultWallet] = useState<Wallet | null>(null);

  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [inspectingWallet, setInspectingWallet] = useState<Wallet | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'asset' | 'liability'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  // Queries
  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.getWallets(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardApi.getMetrics(),
  });

  // Mutations
  const createWalletMutation = useMutation({
    mutationFn: (data: CreateWalletInput) => walletApi.createWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsWalletModalOpen(false);
    },
  });

  const updateWalletMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWalletInput> }) =>
      walletApi.updateWallet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsWalletModalOpen(false);
      setEditingWallet(null);
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: (id: string) => walletApi.deleteWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const adjustmentMutation = useMutation({
    mutationFn: ({ walletId, data }: { walletId: string; data: CreateAdjustmentInput }) =>
      walletApi.createAdjustment(walletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsAdjustModalOpen(false);
      setAdjustingWallet(null);
    },
  });

  // Calculate high-level stats (converted to base currency via backend metrics engine)
  const assetWallets = wallets.filter((w) => w.type === 'asset');
  const liabilityWallets = wallets.filter((w) => w.type === 'liability');
  const totalAssets = metrics?.totalAssets
    ? parseFloat(metrics.totalAssets)
    : assetWallets.reduce((sum, w) => sum + parseFloat(w.currentBalance || '0'), 0);
  const totalLiabilities = metrics?.totalLiabilities
    ? parseFloat(metrics.totalLiabilities)
    : liabilityWallets.reduce((sum, w) => sum + parseFloat(w.currentBalance || '0'), 0);
  const netWorthVal = metrics?.todayNetWorth || metrics?.todaysNetWorth;
  const netWorth = netWorthVal
    ? parseFloat(netWorthVal)
    : totalAssets - totalLiabilities;

  // Filtered wallets
  const filteredWallets = wallets.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || w.type === typeFilter;
    const matchesCurrency = currencyFilter === 'all' || w.defaultCurrency === currencyFilter;
    return matchesSearch && matchesType && matchesCurrency;
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingWallet(null);
    setIsWalletModalOpen(true);
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setIsWalletModalOpen(true);
  };

  const handleOpenAdjust = (w: Wallet) => {
    setAdjustingWallet(w);
    setIsAdjustModalOpen(true);
  };

  const handleOpenTransactions = (w: Wallet) => {
    setInspectingWallet(w);
    setIsTransactionsModalOpen(true);
  };

  const handleWalletSubmit = async (data: CreateWalletInput) => {
    if (editingWallet) {
      await updateWalletMutation.mutateAsync({ id: editingWallet.id, data });
    } else {
      await createWalletMutation.mutateAsync(data);
    }
  };

  const handleAdjustmentSubmit = async (data: CreateAdjustmentInput, targetWalletId?: string) => {
    const finalWalletId = targetWalletId || adjustingWallet?.id;
    if (finalWalletId) {
      await adjustmentMutation.mutateAsync({ walletId: finalWalletId, data });
    }
  };

  const handleOpenTransfer = (wallet?: Wallet) => {
    setTransferDefaultWallet(wallet || null);
    setIsTransferModalOpen(true);
  };

  // Available currencies across existing wallets
  const existingCurrencies = Array.from(new Set(wallets.map((w) => w.defaultCurrency)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">
            Wallets Management
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Add, remove, and manage your real-world bank accounts, cash reserves, and liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {wallets.length >= 2 && (
            <button
              onClick={() => handleOpenTransfer()}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold text-xs sm:text-sm hover:bg-[var(--color-primary-bg)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
            >
              <RiSwapLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Transfer</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-xs sm:text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
          >
            <RiAddLine className="w-5 h-5" />
            <span>New Wallet</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wallets Count */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Wallets
            </span>
            <div className="w-8 h-8 rounded-[var(--radius-base)] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <RiBankCardLine className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-[var(--color-text)]">{wallets.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {assetWallets.length} assets, {liabilityWallets.length} liabilities
          </p>
        </div>

        {/* Total Assets */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Asset Accounts
            </span>
            <div className="w-8 h-8 rounded-[var(--radius-base)] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <RiArrowRightUpLine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[var(--color-accent)] tracking-wider">
              +{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{assetWallets.length} active asset accounts</p>
        </div>

        {/* Total Liabilities */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Liabilities & Debts
            </span>
            <div className="w-8 h-8 rounded-[var(--radius-base)] bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
              <RiArrowRightDownLine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[var(--color-danger)] tracking-wider">
              -{totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{liabilityWallets.length} active debt accounts</p>
        </div>

        {/* Consolidated Net Balance */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Net Balance
            </span>
            <div className="w-8 h-8 rounded-[var(--radius-base)] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <RiWallet3Line className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[var(--color-text)] tracking-wider">
              {netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Consolidated holdings</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[var(--color-surface)] p-3.5 rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wallet name or description..."
            className="w-full pl-9 pr-3.5 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-emerald-50/50 dark:bg-emerald-950/20 text-[var(--color-text)] text-xs focus:ring-1 focus:ring-[var(--color-ring)] focus:bg-white dark:focus:bg-[var(--color-surface)] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter Buttons */}
          <div className="inline-flex rounded-[var(--radius-base)] border border-[var(--color-border)] p-0.5 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-[calc(var(--radius-base)-2px)] transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              All ({wallets.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('asset')}
              className={`px-3 py-1.5 rounded-[calc(var(--radius-base)-2px)] transition-colors ${
                typeFilter === 'asset'
                  ? 'bg-white dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Assets ({assetWallets.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('liability')}
              className={`px-3 py-1.5 rounded-[calc(var(--radius-base)-2px)] transition-colors ${
                typeFilter === 'liability'
                  ? 'bg-white dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Debts ({liabilityWallets.length})
            </button>
          </div>

          {/* Currency Filter Dropdown */}
          {existingCurrencies.length > 1 && (
            <div className="flex items-center gap-1.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-[var(--color-border)] rounded-[var(--radius-base)] px-2.5 py-1.5">
              <RiFilterLine className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[var(--color-text)] focus:outline-none"
              >
                <option value="all" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  All Currencies
                </option>
                {existingCurrencies.map((c) => (
                  <option key={c} value={c} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Wallets List / Grid */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
          <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Loading wallets...</p>
        </div>
      ) : filteredWallets.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-10 text-center shadow-[var(--shadow-sm)]">
          <div className="w-12 h-12 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-3">
            <RiWallet3Line className="w-6 h-6" />
          </div>
          <h3 className="text-base font-heading font-bold text-[var(--color-text)]">
            {wallets.length === 0 ? 'No Wallets Found' : 'No matching wallets'}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            {wallets.length === 0
              ? 'Get started by creating your first bank account, cash wallet, or debt liability.'
              : 'Try clearing your search query or changing the filter options above.'}
          </p>
          {wallets.length === 0 && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shadow-xs"
            >
              <RiAddLine size={16} />
              <span>Create Your First Wallet</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWallets.map((wallet) => {
            const isAsset = wallet.type === 'asset';
            const balanceNum = parseFloat(wallet.currentBalance || '0');

            return (
              <div
                key={wallet.id}
                className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Card Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: wallet.color || '#047857' }}
                      />
                      <h3 className="font-heading font-bold text-[var(--color-text)] text-base truncate">
                        {wallet.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-bold uppercase tracking-wider border ${
                          isAsset
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {isAsset ? 'Asset' : 'Liability'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {wallet.description && (
                    <p className="text-xs text-[var(--color-text-muted)] mb-3 line-clamp-2">
                      {wallet.description}
                    </p>
                  )}

                  {/* Balance Display */}
                  <div className="my-3 p-3 rounded-[var(--radius-base)] bg-emerald-50/60 dark:bg-emerald-950/30 border border-[var(--color-border)]">
                    <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
                      Current Balance
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span
                        className={`text-2xl font-bold font-mono tracking-wider ${
                          isAsset ? 'text-[var(--color-text)]' : 'text-[var(--color-danger)]'
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

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenTransactions(wallet)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-base)] bg-emerald-100 hover:bg-emerald-200/80 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors touch-target shadow-xs"
                      title="View transactions history"
                    >
                      <RiHistoryLine size={14} />
                      <span>History</span>
                    </button>
                    <button
                      onClick={() => handleOpenAdjust(wallet)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-base)] bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200/60 dark:border-emerald-800/60 transition-colors touch-target"
                      title="Record balance adjustment"
                    >
                      <RiSwapLine size={14} />
                      <span>Adjust</span>
                    </button>
                    {wallets.length >= 2 && (
                      <button
                        onClick={() => handleOpenTransfer(wallet)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-base)] bg-blue-50/60 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200/60 dark:border-blue-800/60 transition-colors touch-target"
                        title="Transfer money from this wallet"
                      >
                        <RiSwapLine size={14} />
                        <span>Transfer</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(wallet)}
                      className="p-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 rounded-[var(--radius-base)] hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors touch-target"
                      title="Edit wallet"
                    >
                      <RiEditLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Delete wallet "${wallet.name}"? Transactions assigned to this wallet will remain in records.`
                          )
                        ) {
                          deleteWalletMutation.mutate(wallet.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 rounded-[var(--radius-base)] hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors touch-target"
                      title="Delete wallet"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={editingWallet}
        onSubmit={handleWalletSubmit}
        defaultCurrency={baseCurrency}
      />

      {/* Adjust Balance Modal */}
      {adjustingWallet && (
        <AdjustmentModal
          isOpen={isAdjustModalOpen}
          onClose={() => {
            setIsAdjustModalOpen(false);
            setAdjustingWallet(null);
          }}
          wallet={adjustingWallet}
          wallets={wallets}
          onSubmit={handleAdjustmentSubmit}
        />
      )}

      {/* Transactions History Modal */}
      {inspectingWallet && (
        <WalletTransactionsModal
          isOpen={isTransactionsModalOpen}
          onClose={() => {
            setIsTransactionsModalOpen(false);
            setInspectingWallet(null);
          }}
          wallet={inspectingWallet}
          onOpenAdjust={(w) => handleOpenAdjust(w)}
          onOpenTransfer={(w) => handleOpenTransfer(w)}
        />
      )}

      {/* Transfer Funds Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferDefaultWallet(null);
        }}
        wallets={wallets}
        defaultFromWalletId={transferDefaultWallet?.id}
        onTransferSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['wallets'] });
          queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
};
