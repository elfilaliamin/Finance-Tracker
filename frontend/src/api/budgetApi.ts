import { api } from './client';

export interface Budget {
  id: string;
  name: string;
  type: 'spending_limit' | 'saving_goal';
  targetAmount: string;
  currency: string;
  walletId?: string;
  categoryId?: string;
  spendingCategoryId?: string;
  period: 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  progress?: {
    currentAmount: string;
    percentage: number;
    status: 'normal' | 'warning' | 'exceeded';
    remainingAmount: string;
    requiredMonthlySavings?: string;
  };
}

export interface CreateBudgetInput {
  name: string;
  type: 'spending_limit' | 'saving_goal';
  targetAmount: number;
  currency: string;
  walletId?: string;
  categoryId?: string;
  spendingCategoryId?: string;
  period: 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export const budgetApi = {
  getBudgets: () =>
    api.get<Budget[]>('/budgets'),

  getBudget: (id: string) =>
    api.get<Budget>(`/budgets/${id}`),

  createBudget: (data: CreateBudgetInput) =>
    api.post<Budget>('/budgets', data),

  updateBudget: (id: string, data: Partial<CreateBudgetInput & { isActive: boolean }>) =>
    api.put<Budget>(`/budgets/${id}`, data),

  deleteBudget: (id: string) =>
    api.delete<{ success: boolean }>(`/budgets/${id}`),
};

