import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';
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
  const [selectedYear, setSelectedYear] = useState<number>(0);
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
        year: selectedYear > 0 ? selectedYear : undefined,
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
    setSelectedYear(0);
    setSelectedSourceId('');
    setSelectedCategoryId('');
    setSelectedCurrency('');
  };

  const columns: Column<IncomeRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => <span className="font-mono text-[var(--color-text)]">{item.date}</span>,
    },
    {
      key: 'sourceName',
      header: 'Source',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.sourceColor || item.source?.color || 'var(--color-accent)' }}
          />
          <span className="font-semibold text-[var(--color-text)]">
            {item.sourceName || item.source?.title || 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item: any) => {
        const baseAmountStr = item.amountInBase || item.baseAmount;
        const parsedBase = baseAmountStr ? parseFloat(baseAmountStr) : null;
        return (
          <div className="text-right">
            <span className="font-bold text-[var(--color-accent)] font-mono text-sm">
              +{parseFloat(item.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {item.currency}
            </span>
            {item.currency !== defaultCurrency && parsedBase !== null && !isNaN(parsedBase) && (
              <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                ~{parsedBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                {defaultCurrency}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'categoryName',
      header: 'Category',
      render: (item: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-medium bg-[var(--color-primary-bg)] text-[var(--color-text)] border border-[var(--color-border)]">
          {item.categoryName || item.category?.name || 'General'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-[var(--color-text-muted)] truncate max-w-xs block" title={item.description || item.notes}>
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
          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius-base)] hover:bg-[var(--color-danger)]/10 transition-colors touch-target"
          title="Delete Income"
        >
          <RiDeleteBinLine className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const renderMobileCard = (item: any) => {
    const baseAmountStr = item.amountInBase || item.baseAmount;
    const parsedBase = baseAmountStr ? parseFloat(baseAmountStr) : null;

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.sourceColor || item.source?.color || 'var(--color-accent)' }}
            />
            <span className="font-bold text-[var(--color-text)] text-sm">
              {item.sourceName || item.source?.title || 'Unknown'}
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">{item.date}</span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-medium bg-[var(--color-primary-bg)] text-[var(--color-text)] border border-[var(--color-border)]">
            {item.categoryName || item.category?.name || 'General'}
          </span>
          <div className="text-right">
            <span className="font-bold text-[var(--color-accent)] font-mono text-base">
              +{parseFloat(item.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {item.currency}
            </span>
            {item.currency !== defaultCurrency && parsedBase !== null && !isNaN(parsedBase) && (
              <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                ~{parsedBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                {defaultCurrency}
              </p>
            )}
          </div>
        </div>

        {(item.description || item.notes) && (
          <p className="text-xs text-[var(--color-text-muted)] mt-2 border-t border-[var(--color-border)] pt-1.5">
            {item.description || item.notes}
          </p>
        )}

        <div className="mt-2 pt-2 border-t border-[var(--color-border)] flex justify-end">
          <button
            onClick={() => {
              if (confirm('Delete this income record?')) {
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
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">Income Ledger</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Recorded revenues across all sources (wallets are not affected).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
        >
          <RiAddLine className="w-5 h-5" />
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
          const entryYear = parseInt(data.date.split('-')[0], 10);
          if (selectedYear !== 0 && selectedYear !== entryYear) {
            setSelectedYear(0);
          }
        }}
        sources={sources}
        categories={categories}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
};

