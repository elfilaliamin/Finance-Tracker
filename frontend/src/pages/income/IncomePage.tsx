import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiAddLine, RiEditLine, RiDeleteBinLine } from '@remixicon/react';
import { incomeApi, IncomeRecord, CreateIncomeInput } from '@/api/incomeApi';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveTable, Column } from '@/components/ui/ResponsiveTable';
import { IncomeModal } from './components/IncomeModal';
import { IncomeFilters } from './components/IncomeFilters';

export const IncomePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const defaultCurrency = user?.baseCurrency || 'MAD';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let queryYear: number | undefined = undefined;
  let queryMonth: number | undefined = undefined;

  if (selectedPeriod === 'this_month') {
    queryYear = currentYear;
    queryMonth = currentMonth;
  } else if (selectedPeriod === 'last_month') {
    const lastMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
    queryYear = lastMonthDate.getFullYear();
    queryMonth = lastMonthDate.getMonth() + 1;
  } else if (selectedPeriod !== 'all' && selectedPeriod !== '') {
    const parsedYear = parseInt(selectedPeriod, 10);
    if (!isNaN(parsedYear) && parsedYear > 0) {
      queryYear = parsedYear;
      queryMonth = undefined;
    }
  }

  // Queries
  const { data: sources = [] } = useQuery({
    queryKey: ['incomeSources'],
    queryFn: () => incomeApi.getSources(),
  });

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['incomes', selectedPeriod, queryYear, queryMonth, selectedSourceId, selectedCurrency],
    queryFn: () =>
      incomeApi.getIncomes({
        year: queryYear,
        month: queryMonth,
        sourceId: selectedSourceId || undefined,
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateIncomeInput> }) =>
      incomeApi.updateIncome(id, data),
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
    setSelectedPeriod('all');
    setSelectedSourceId('');
    setSelectedCurrency('');
  };

  const handleOpenCreate = () => {
    setEditingIncome(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IncomeRecord) => {
    setEditingIncome(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIncome(null);
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
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius-base)] hover:bg-[var(--color-primary-bg)] transition-colors touch-target"
            title="Edit Income"
          >
            <RiEditLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this income record?')) {
                deleteMutation.mutate(item.id);
              }
            }}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius-base)] hover:bg-[var(--color-danger)]/10 transition-colors touch-target"
            title="Delete Income"
          >
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        </div>
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
          <span className="text-xs text-[var(--color-text-muted)]">Revenue</span>
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

        <div className="mt-2 pt-2 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenEdit(item)}
            className="text-xs text-[var(--color-primary)] hover:underline font-medium flex items-center gap-1 touch-target py-1 px-2"
          >
            <RiEditLine className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
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
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
        >
          <RiAddLine className="w-5 h-5" />
          <span>New Income</span>
        </button>
      </div>

      {/* Filters */}
      <IncomeFilters
        sources={sources}
        selectedSourceId={selectedSourceId}
        onSelectSourceId={setSelectedSourceId}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
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

      {/* Income Modal (Create or Edit) */}
      <IncomeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        income={editingIncome}
        onSubmit={async (data) => {
          if (editingIncome) {
            await updateMutation.mutateAsync({ id: editingIncome.id, data });
          } else {
            await createMutation.mutateAsync(data);
          }
          const entryYear = parseInt(data.date.split('-')[0], 10);
          const entryMonth = parseInt(data.date.split('-')[1], 10);
          if (selectedPeriod !== 'all') {
            let matches = false;
            if (selectedPeriod === 'this_month' && entryYear === currentYear && entryMonth === currentMonth) {
              matches = true;
            } else if (selectedPeriod === 'last_month') {
              const lastMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
              if (entryYear === lastMonthDate.getFullYear() && entryMonth === lastMonthDate.getMonth() + 1) {
                matches = true;
              }
            } else if (parseInt(selectedPeriod, 10) === entryYear) {
              matches = true;
            }
            if (!matches) {
              setSelectedPeriod('all');
            }
          }
        }}
        sources={sources}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
};
