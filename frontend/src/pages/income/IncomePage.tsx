import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { incomeApi, IncomeRecord, CreateIncomeInput } from '@/api/incomeApi';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveTable, Column } from '@/components/ui/ResponsiveTable';
import { IncomeModal } from './components/IncomeModal';
import { IncomeFilters } from './components/IncomeFilters';

export const IncomePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const defaultCurrency = user?.baseCurrency || 'MAD';
  const currentYear = new Date().getFullYear();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');

  // Queries
  const { data: sources = [] } = useQuery({
    queryKey: ['incomeSources'],
    queryFn: () => incomeApi.getSources(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['incomeCategories'],
    queryFn: () => incomeApi.getCategories(),
  });

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['incomes', selectedYear, selectedSourceId, selectedCategoryId, selectedCurrency],
    queryFn: () =>
      incomeApi.getIncomes({
        year: selectedYear,
        sourceId: selectedSourceId || undefined,
        categoryId: selectedCategoryId || undefined,
        currency: selectedCurrency || undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateIncomeInput) => incomeApi.createIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incomeApi.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleClearFilters = () => {
    setSelectedYear(currentYear);
    setSelectedSourceId('');
    setSelectedCategoryId('');
    setSelectedCurrency('');
  };

  const columns: Column<IncomeRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => <span className="font-mono text-slate-800">{item.date}</span>,
    },
    {
      key: 'sourceName',
      header: 'Source',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.sourceColor || '#10b981' }}
          />
          <span className="font-semibold text-slate-900">{item.sourceName || 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <span className="font-bold text-emerald-700 font-mono text-sm">
            +{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {item.currency}
          </span>
          {item.currency !== defaultCurrency && (
            <p className="text-[11px] text-slate-400 font-mono">
              ~{parseFloat(item.amountInBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {defaultCurrency}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'categoryName',
      header: 'Category',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {item.categoryName || 'General'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-slate-600 truncate max-w-xs block" title={item.description || item.notes}>
          {item.description || item.notes || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this income record?')) {
              deleteMutation.mutate(item.id);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors touch-target"
          title="Delete Income"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  const renderMobileCard = (item: IncomeRecord) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: item.sourceColor || '#10b981' }}
          />
          <span className="font-bold text-slate-900 text-sm">{item.sourceName || 'Unknown'}</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">{item.date}</span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {item.categoryName || 'General'}
        </span>
        <div className="text-right">
          <span className="font-bold text-emerald-600 font-mono text-base">
            +{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {item.currency}
          </span>
          {item.currency !== defaultCurrency && (
            <p className="text-[11px] text-slate-400 font-mono">
              ~{parseFloat(item.amountInBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {defaultCurrency}
            </p>
          )}
        </div>
      </div>

      {(item.description || item.notes) && (
        <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-1.5">
          {item.description || item.notes}
        </p>
      )}

      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
        <button
          onClick={() => {
            if (confirm('Delete this income record?')) {
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Income Ledger</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Recorded revenues across all sources (wallets are not affected).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-sm transition-all touch-target"
        >
          <Plus size={18} />
          <span>New Income</span>
        </button>
      </div>

      {/* Filters */}
      <IncomeFilters
        sources={sources}
        categories={categories}
        selectedSourceId={selectedSourceId}
        onSelectSourceId={setSelectedSourceId}
        selectedCategoryId={selectedCategoryId}
        onSelectCategoryId={setSelectedCategoryId}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        onClear={handleClearFilters}
      />

      {/* Table / Card List */}
      <ResponsiveTable
        columns={columns}
        data={incomes}
        keyExtractor={(item) => item.id}
        renderMobileCard={renderMobileCard}
        isLoading={isLoading}
        emptyMessage="No income records matching current filter."
      />

      {/* New Income Modal */}
      <IncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        sources={sources}
        categories={categories}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
};

