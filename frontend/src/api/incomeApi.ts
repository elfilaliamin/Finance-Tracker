import { api } from './client';

export interface IncomeCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
}

export interface IncomeSource {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  color: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
}

export interface IncomeRecord {
  id: string;
  date: string;
  amount: string;
  currency: string;
  amountInBase: string;
  sourceId: string;
  sourceName?: string;
  sourceColor?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateIncomeInput {
  date: string;
  amount: number;
  currency: string;
  sourceId: string;
  categoryId?: string;
  description?: string;
  notes?: string;
}

export const incomeApi = {
  getIncomes: (filters?: { year?: number; sourceId?: string; categoryId?: string; currency?: string }) =>
    api.get<IncomeRecord[]>('/incomes', filters),

  createIncome: (data: CreateIncomeInput) =>
    api.post<IncomeRecord>('/incomes', data),

  updateIncome: (id: string, data: Partial<CreateIncomeInput>) =>
    api.put<IncomeRecord>(`/incomes/${id}`, data),

  deleteIncome: (id: string) =>
    api.delete<{ success: boolean }>(`/incomes/${id}`),

  getSources: () =>
    api.get<IncomeSource[]>('/income-sources'),

  createSource: (data: { name?: string; title?: string; description?: string; color: string; isActive?: boolean; status?: string }) =>
    api.post<IncomeSource>('/income-sources', data),

  updateSource: (id: string, data: Partial<{ name?: string; title?: string; description?: string; color: string; isActive?: boolean; status?: string }>) =>
    api.put<IncomeSource>(`/income-sources/${id}`, data),

  deleteSource: (id: string) =>
    api.delete<{ success: boolean }>(`/income-sources/${id}`),

  getCategories: () =>
    api.get<IncomeCategory[]>('/categories/income'),

  createCategory: (data: { name: string; color: string; icon?: string }) =>
    api.post<IncomeCategory>('/categories/income', data),

  updateCategory: (id: string, data: { name?: string; color?: string; icon?: string }) =>
    api.put<IncomeCategory>(`/categories/income/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete<{ success: boolean }>(`/categories/income/${id}`),
};

