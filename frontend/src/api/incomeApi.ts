import { api } from './client';

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
  description?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateIncomeInput {
  date: string;
  amount: number;
  currency: string;
  sourceId: string;
  description?: string;
  notes?: string;
}

export const incomeApi = {
  getIncomes: (filters?: { year?: number; month?: number; sourceId?: string; currency?: string }) =>
    api.get<IncomeRecord[]>('/incomes', filters),

  getAvailableYears: () =>
    api.get<number[]>('/incomes/years'),

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
};
