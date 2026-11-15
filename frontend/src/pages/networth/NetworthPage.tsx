import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiAddLine,
  RiWallet3Line,
  RiArrowRightDownLine,
  RiArrowRightUpLine,
} from '@remixicon/react';
import { walletApi, Wallet, CreateWalletInput, CreateAdjustmentInput } from '@/api/walletApi';
import { useAuth } from '@/hooks/useAuth';
import { WalletCard } from './components/WalletCard';
import { WalletModal } from './components/WalletModal';
import { AdjustmentModal } from './components/AdjustmentModal';
import { WalletTransactionsModal } from './components/WalletTransactionsModal';

export const NetworthPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const baseCurrency = user?.baseCurrency || 'MAD';

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingWallet, setAdjustingWallet] = useState<Wallet | null>(null);

  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [inspectingWallet, setInspectingWallet] = useState<Wallet | null>(null);

  // Queries
  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.getWallets(),
  });

  // Mutations
  const createWalletMutation = useMutation({
    mutationFn: (data: CreateWalletInput) => walletApi.createWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateWalletMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWalletInput> }) =>
      walletApi.updateWallet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Categorize wallets
  const assetWallets = wallets.filter((w) => w.type === 'asset');
  const liabilityWallets = wallets.filter((w) => w.type === 'liability');

  // Compute Totals in base currency
  const totalAssets = assetWallets.reduce((sum, w) => sum + parseFloat(w.currentBalance || '0'), 0);
  const totalLiabilities = liabilityWallets.reduce((sum, w) => sum + parseFloat(w.currentBalance || '0'), 0);
  const netWorth = totalAssets - totalLiabilities;

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">Net Worth & Wallets</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Monitor real-world asset holdings and liabilities with manual adjustments.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
        >
          <RiAddLine className="w-5 h-5" />
          <span>New Wallet</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Net Worth */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Net Worth
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
              <RiWallet3Line className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold font-mono text-[var(--color-text)] tracking-wider">
              {netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Assets minus liabilities</p>
        </div>

        {/* Total Assets */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Assets
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
              <RiArrowRightUpLine className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold font-mono text-[var(--color-accent)] tracking-wider">
              +{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{assetWallets.length} asset accounts</p>
        </div>

        {/* Total Liabilities */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Liabilities
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20 flex items-center justify-center">
              <RiArrowRightDownLine className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold font-mono text-[var(--color-danger)] tracking-wider">
              -{totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{liabilityWallets.length} debt accounts</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-[var(--color-text-muted)]">Loading wallets...</div>
      ) : (
        <div className="space-y-8">
          {/* Asset Wallets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base sm:text-lg font-heading font-bold text-[var(--color-text)]">Asset Wallets</h3>
              <span className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)]">
                {assetWallets.length}
              </span>
            </div>

            {assetWallets.length === 0 ? (
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-6 text-center text-[var(--color-text-muted)] text-sm">
                No asset wallets created yet. Add your bank accounts or cash holdings!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assetWallets.map((w) => (
                  <WalletCard
                    key={w.id}
                    wallet={w}
                    onAdjust={handleOpenAdjust}
                    onEdit={handleOpenEdit}
                    onViewTransactions={(target) => {
                      setInspectingWallet(target);
                      setIsTransactionsModalOpen(true);
                    }}
                    onDelete={(target) => {
                      if (confirm(`Delete wallet "${target.name}"?`)) {
                        deleteWalletMutation.mutate(target.id);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Liability Wallets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base sm:text-lg font-heading font-bold text-[var(--color-text)]">Liabilities & Debts</h3>
              <span className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                {liabilityWallets.length}
              </span>
            </div>

            {liabilityWallets.length === 0 ? (
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-6 text-center text-[var(--color-text-muted)] text-sm">
                No liabilities recorded. (Great job!)
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liabilityWallets.map((w) => (
                  <WalletCard
                    key={w.id}
                    wallet={w}
                    onAdjust={handleOpenAdjust}
                    onEdit={handleOpenEdit}
                    onViewTransactions={(target) => {
                      setInspectingWallet(target);
                      setIsTransactionsModalOpen(true);
                    }}
                    onDelete={(target) => {
                      if (confirm(`Delete liability "${target.name}"?`)) {
                        deleteWalletMutation.mutate(target.id);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={editingWallet}
        onSubmit={async (data) => {
          if (editingWallet) {
            await updateWalletMutation.mutateAsync({ id: editingWallet.id, data });
          } else {
            await createWalletMutation.mutateAsync(data);
          }
        }}
        defaultCurrency={baseCurrency}
      />

      {/* Balance Adjustment Modal */}
      <AdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        wallet={adjustingWallet}
        onSubmit={async (input) => {
          if (adjustingWallet) {
            await adjustmentMutation.mutateAsync({
              walletId: adjustingWallet.id,
              data: input,
            });
          }
        }}
      />

      {/* Wallet Transactions History Modal */}
      {inspectingWallet && (
        <WalletTransactionsModal
          isOpen={isTransactionsModalOpen}
          onClose={() => {
            setIsTransactionsModalOpen(false);
            setInspectingWallet(null);
          }}
          wallet={inspectingWallet}
          onOpenAdjust={(w) => handleOpenAdjust(w)}
        />
      )}
    </div>
  );
};

