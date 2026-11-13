import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { spendingApi, SpendingRecord, CreateSpendingInput } from '@/api/spendingApi';
import { walletApi } from '@/api/walletApi';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveTable, Column } from '@/components/ui/ResponsiveTable';
import { SpendingBillModal } from './components/SpendingBillModal';
import { MiniReceiptModal } from './components/MiniReceiptModal';
import { SpendingFilters } from './components/SpendingFilters';

export const SpendingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const defaultCurrency = user?.baseCurrency || 'MAD';

  // Modal State
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
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

  const columns: Column<SpendingRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => <span className="font-mono text-slate-800">{item.date}</span>,
    },
    {
      key: 'storeMerchant',
      header: 'Merchant',
      render: (item) => (
        <span className="font-semibold text-slate-900">{item.storeMerchant || 'General Expense'}</span>
      ),
    },
    {
      key: 'walletName',
      header: 'Paid From',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {item.walletName || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'itemsCount',
      header: 'Articles',
      render: (item) => (
        <span className="text-xs text-slate-500">
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
          <span className="font-bold text-rose-600 font-mono text-sm">
            -{parseFloat(item.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {item.currency}
          </span>
          {item.currency !== defaultCurrency && (
            <p className="text-[11px] text-slate-400 font-mono">
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
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors touch-target"
            title="View Receipt"
          >
            <Receipt size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this spending record? If it was paid from a wallet, the balance will be restored.')) {
                deleteMutation.mutate(item.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors touch-target"
            title="Delete Spending"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (item: SpendingRecord) => (
    <div onClick={() => setSelectedReceipt(item)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold text-slate-900 text-sm">{item.storeMerchant || 'Store Expense'}</span>
        <span className="text-xs text-slate-500 font-mono">{item.date}</span>
      </div>

      <div className="flex items-center justify-between my-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {item.walletName || 'Unassigned Wallet'}
        </span>
        <div className="text-right">
          <span className="font-bold text-rose-600 font-mono text-base">
            -{parseFloat(item.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {item.currency}
          </span>
          {item.currency !== defaultCurrency && (
            <p className="text-[11px] text-slate-400 font-mono">
              ~{parseFloat(item.totalAmountInBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {defaultCurrency}
            </p>
          )}
        </div>
      </div>

      {item.items && item.items.length > 0 && (
        <div className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-1.5 line-clamp-1">
          {item.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
        </div>
      )}

      <div
        className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setSelectedReceipt(item)}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 touch-target py-1 px-2"
        >
          <Receipt size={14} />
          <span>View Receipt</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Delete this spending record? If it was paid from a wallet, the balance will be restored.')) {
              deleteMutation.mutate(item.id);
            }
          }}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 touch-target py-1 px-2"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Spending Ledger</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Itemized bills and receipts. Deducts money from designated wallets.
          </p>
        </div>

        <button
          onClick={() => setIsBillModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 shadow-sm transition-all touch-target"
        >
          <Plus size={18} />
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

      {/* New Spending Bill Modal */}
      <SpendingBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
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
      />
    </div>
  );
};

