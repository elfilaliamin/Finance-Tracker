import { api } from './client';

export interface SpendingCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
}

export interface SpendingItem {
  id?: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  notes?: string;
}

export interface SpendingRecord {
  id: string;
  date: string;
  totalAmount: string;
  currency: string;
  totalAmountInBase: string;
  paidFromWalletId?: string;
  walletName?: string;
  storeMerchant?: string;
  notes?: string;
  createdAt: string;
  items: SpendingItem[];
}

export interface CreateSpendingInput {
  date: string;
  paidFromWalletId?: string;
  storeMerchant?: string;
  currency: string;
  notes?: string;
  items: {
    name: string;
    categoryId?: string;
    unitPrice: number;
    quantity: number;
    notes?: string;
  }[];
}

export const spendingApi = {
  getSpendings: (filters?: {
    walletId?: string;
    categoryId?: string;
    storeMerchant?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => api.get<SpendingRecord[]>('/spendings', filters),

  getSpending: (id: string) =>
    api.get<SpendingRecord>(`/spendings/${id}`),

  createSpending: (data: CreateSpendingInput) =>
    api.post<SpendingRecord>('/spendings', data),

  updateSpending: (id: string, data: Partial<CreateSpendingInput>) =>
    api.put<SpendingRecord>(`/spendings/${id}`, data),

  deleteSpending: (id: string) =>
    api.delete<{ success: boolean }>(`/spendings/${id}`),

  getCategories: () =>
    api.get<SpendingCategory[]>('/categories/spending'),

  createCategory: (data: { name: string; color: string; icon?: string }) =>
    api.post<SpendingCategory>('/categories/spending', data),

  updateCategory: (id: string, data: { name?: string; color?: string; icon?: string }) =>
    api.put<SpendingCategory>(`/categories/spending/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete<{ success: boolean }>(`/categories/spending/${id}`),
};

