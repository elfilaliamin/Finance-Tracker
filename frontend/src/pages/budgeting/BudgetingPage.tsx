import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiAddLine, RiFocus3Line, RiFireLine } from '@remixicon/react';
import { budgetApi, CreateBudgetInput, Budget } from '@/api/budgetApi';
import { spendingApi } from '@/api/spendingApi';
import { walletApi } from '@/api/walletApi';
import { useAuth } from '@/hooks/useAuth';
import { SpendingLimitCard } from './components/SpendingLimitCard';
import { SavingGoalCard } from './components/SavingGoalCard';
import { BudgetModal } from './components/BudgetModal';

export const BudgetingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const defaultCurrency = user?.baseCurrency || 'MAD';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Queries
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetApi.getBudgets(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['spendingCategories'],
    queryFn: () => spendingApi.getCategories(),
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.getWallets(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetInput) => budgetApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBudgetInput> }) =>
      budgetApi.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (data: CreateBudgetInput) => {
    if (editingBudget) {
      await updateMutation.mutateAsync({ id: editingBudget.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const spendingLimits = budgets.filter((b) => b.type === 'spending_limit');
  const savingGoals = budgets.filter((b) => b.type === 'saving_goal');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">Budgets & Goals</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Enforce spending limits and work toward target savings on your wallets.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
        >
          <RiAddLine className="w-5 h-5" />
          <span>New Budget or Goal</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-[var(--color-text-muted)]">Loading budgets...</div>
      ) : (
        <div className="space-y-8">
          {/* Spending Limits Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 text-[var(--color-danger)] flex items-center justify-center">
                <RiFireLine className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-[var(--color-text)]">Spending Limits</h3>
              <span className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                {spendingLimits.length}
              </span>
            </div>

            {spendingLimits.length === 0 ? (
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-6 text-center text-[var(--color-text-muted)] text-sm">
                No spending limits set. Create a monthly or custom limit to control expenses.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {spendingLimits.map((b) => (
                  <SpendingLimitCard
                    key={b.id}
                    budget={b}
                    onEdit={handleOpenEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Saving Goals Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
                <RiFocus3Line className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-[var(--color-text)]">Saving Goals</h3>
              <span className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)]">
                {savingGoals.length}
              </span>
            </div>

            {savingGoals.length === 0 ? (
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-6 text-center text-[var(--color-text-muted)] text-sm">
                No saving goals configured. Set a savings target on one of your asset wallets!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savingGoals.map((g) => (
                  <SavingGoalCard
                    key={g.id}
                    goal={g}
                    onEdit={handleOpenEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New / Edit Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        categories={categories}
        wallets={wallets}
        defaultCurrency={defaultCurrency}
        budget={editingBudget}
      />
    </div>
  );
};

