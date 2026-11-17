import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiReceiptLine } from '@remixicon/react';
import { spendingApi, SpendingRecord, CreateSpendingInput } from '@/api/spendingApi';
import { walletApi } from '@/api/walletApi';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveTable, Column } from '@/components/ui/ResponsiveTable';
import { SpendingBillModal } from './components/SpendingBillModal';
import { MiniReceiptModal } from './components/MiniReceiptModal';
import { SpendingFilters } from './components/SpendingFilters';
import { formatQuantity } from '@/utils/format';

export const SpendingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const defaultCurrency = user?.baseCurrency || 'MAD';

  // Modal State
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingSpending, setEditingSpending] = useState<SpendingRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<SpendingRecord | null>(null);

  // Filter State
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [search, setSearch] = useState('');

  // Queries
  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.getWallets(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['spendingCategories'],
    queryFn: () => spendingApi.getCategories(),
  });

  const { data: spendings = [], isLoading } = useQuery({
    queryKey: ['spendings', selectedWalletId, selectedCategoryId, selectedMerchant, selectedCurrency, search],
    queryFn: () =>
      spendingApi.getSpendings({
        walletId: selectedWalletId || undefined,
        categoryId: selectedCategoryId || undefined,
        storeMerchant: selectedMerchant || undefined,
        currency: selectedCurrency || undefined,
        search: search || undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateSpendingInput) => spendingApi.createSpending(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSpendingInput> }) =>
      spendingApi.updateSpending(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => spendingApi.deleteSpending(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleClearFilters = () => {
    setSelectedWalletId('');
    setSelectedCategoryId('');
    setSelectedMerchant('');
    setSelectedCurrency('');
    setSearch('');
  };

  const handleOpenCreate = () => {
    setEditingSpending(null);
    setIsBillModalOpen(true);
  };

  const handleOpenEdit = (item: SpendingRecord) => {
    setEditingSpending(item);
    setIsBillModalOpen(true);
  };

  const handleCloseBillModal = () => {
    setIsBillModalOpen(false);
    setEditingSpending(null);
  };

  const columns: Column<SpendingRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => <span className="font-mono text-[var(--color-text)]">{item.date}</span>,
    },
    {
      key: 'storeMerchant',
      header: 'Category',
      render: (item) => (
        <span className="font-semibold text-[var(--color-text)]">
          {item.items?.[0]?.categoryName || item.storeMerchant || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'walletName',
      header: 'Paid From',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-medium bg-[var(--color-primary-bg)] text-[var(--color-text)] border border-[var(--color-border)]">
          {item.walletName || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'itemsCount',
      header: 'Articles',
      render: (item) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {item.items?.length || 0} {(item.items?.length || 0) === 1 ? 'item' : 'items'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <span className="font-bold text-[var(--color-danger)] font-mono text-sm">
            -{parseFloat(item.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {item.currency}
          </span>
          {item.currency !== defaultCurrency && (
            <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
              ~{parseFloat(item.totalAmountInBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {defaultCurrency}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedReceipt(item)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] rounded-[var(--radius-base)] hover:bg-[var(--color-primary-bg)] transition-colors touch-target"
            title="View Receipt"
          >
            <RiReceiptLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius-base)] hover:bg-[var(--color-primary-bg)] transition-colors touch-target"
            title="Edit Spending Bill"
          >
            <RiEditLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this spending record? If it was paid from a wallet, the balance will be restored.')) {
                deleteMutation.mutate(item.id);
              }
            }}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius-base)] hover:bg-[var(--color-danger)]/10 transition-colors touch-target"
            title="Delete Spending"
          >
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (item: SpendingRecord) => (
    <div onClick={() => setSelectedReceipt(item)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold text-[var(--color-text)] text-sm">
          {item.items?.[0]?.categoryName || item.storeMerchant || 'Uncategorized'}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] font-mono">{item.date}</span>
      </div>

      <div className="flex items-center justify-between my-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-medium bg-[var(--color-primary-bg)] text-[var(--color-text)] border border-[var(--color-border)]">
          {item.walletName || 'Unassigned Wallet'}
        </span>
        <div className="text-right">
          <span className="font-bold text-[var(--color-danger)] font-mono text-base">
            -{parseFloat(item.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {item.currency}
          </span>
          {item.currency !== defaultCurrency && (
            <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
              ~{parseFloat(item.totalAmountInBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {defaultCurrency}
            </p>
          )}
        </div>
      </div>

      {item.items && item.items.length > 0 && (
        <div className="text-xs text-[var(--color-text-muted)] mt-2 border-t border-[var(--color-border)] pt-1.5 line-clamp-1">
          {item.items.map((i) => `${i.name} (x${formatQuantity(i.quantity)})`).join(', ')}
        </div>
      )}

      <div
        className="mt-2 pt-2 border-t border-[var(--color-border)] flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setSelectedReceipt(item)}
          className="text-xs text-[var(--color-accent)] hover:underline font-medium flex items-center gap-1 touch-target py-1 px-2"
        >
          <RiReceiptLine className="w-3.5 h-3.5" />
          <span>View Receipt</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(item)}
            className="text-xs text-[var(--color-primary)] hover:underline font-medium flex items-center gap-1 touch-target py-1 px-2"
          >
            <RiEditLine className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this spending record? If it was paid from a wallet, the balance will be restored.')) {
                deleteMutation.mutate(item.id);
              }
            }}
            className="text-xs text-[var(--color-danger)] hover:underline font-medium flex items-center gap-1 touch-target py-1 px-2"
          >
            <RiDeleteBinLine className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">Spending Ledger</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Itemized bills and receipts. Deducts money from designated wallets.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
        >
          <RiAddLine className="w-5 h-5" />
          <span>Record Spending</span>
        </button>
      </div>

      {/* Filters */}
      <SpendingFilters
        categories={categories}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWalletId={setSelectedWalletId}
        selectedCategoryId={selectedCategoryId}
        onSelectCategoryId={setSelectedCategoryId}
        selectedMerchant={selectedMerchant}
        onSelectMerchant={setSelectedMerchant}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
        search={search}
        onSearchChange={setSearch}
        onClear={handleClearFilters}
      />

      {/* Table / Card List */}
      <ResponsiveTable
        columns={columns}
        data={spendings}
        keyExtractor={(item) => item.id}
        renderMobileCard={renderMobileCard}
        onRowClick={(item) => setSelectedReceipt(item)}
        isLoading={isLoading}
        emptyMessage="No spending records matching current filters."
      />

      {/* Spending Bill Modal (Create or Edit) */}
      <SpendingBillModal
        isOpen={isBillModalOpen}
        onClose={handleCloseBillModal}
        spending={editingSpending}
        onSubmit={async (data) => {
          if (editingSpending) {
            await updateMutation.mutateAsync({ id: editingSpending.id, data });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
        categories={categories}
        wallets={wallets}
        defaultCurrency={defaultCurrency}
      />

      {/* Mini Receipt Modal */}
      <MiniReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        spending={selectedReceipt}
        onEdit={() => {
          if (selectedReceipt) {
            handleOpenEdit(selectedReceipt);
          }
        }}
      />
    </div>
  );
};
