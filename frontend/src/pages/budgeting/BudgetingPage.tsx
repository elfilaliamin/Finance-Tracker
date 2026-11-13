import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Target, Flame } from 'lucide-react';
import { budgetApi, Budget, CreateBudgetInput } from '@/api/budgetApi';
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const spendingLimits = budgets.filter((b) => b.type === 'spending_limit');
  const savingGoals = budgets.filter((b) => b.type === 'saving_goal');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Budgets & Goals</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enforce spending limits and work toward target savings on your wallets.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all touch-target"
        >
          <Plus size={18} />
          <span>New Budget or Goal</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-slate-400">Loading budgets...</div>
      ) : (
        <div className="space-y-8">
          {/* Spending Limits Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Flame size={15} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Spending Limits</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                {spendingLimits.length}
              </span>
            </div>

            {spendingLimits.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 text-sm">
                No spending limits set. Create a monthly or custom limit to control expenses.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {spendingLimits.map((b) => (
                  <SpendingLimitCard
                    key={b.id}
                    budget={b}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Saving Goals Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Target size={15} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Saving Goals</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                {savingGoals.length}
              </span>
            </div>

            {savingGoals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 text-sm">
                No saving goals configured. Set a savings target on one of your asset wallets!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savingGoals.map((g) => (
                  <SavingGoalCard
                    key={g.id}
                    goal={g}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        categories={categories}
        wallets={wallets}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
};

