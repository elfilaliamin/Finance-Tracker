import { api } from './client';

export interface Wallet {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  type: 'asset' | 'liability';
  defaultCurrency: string;
  currentBalance: string;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletAdjustment {
  id: string;
  walletId: string;
  date: string;
  amount: string;
  adjustmentType: 'delta' | 'reconcile';
  resultingBalance: string;
  notes?: string;
  createdAt: string;
}

export interface CreateWalletInput {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  type: 'asset' | 'liability';
  defaultCurrency: string;
  initialBalance?: number;
}

export interface CreateAdjustmentInput {
  date?: string;
  adjustmentDate?: string;
  amount: number;
  type?: 'delta' | 'reconcile';
  adjustmentType?: 'delta' | 'reconcile';
  notes?: string;
}

export interface WalletTransactionItem {
  id: string;
  source: 'adjustment' | 'spending';
  type: 'deposit' | 'withdrawal' | 'reconcile' | 'spending';
  direction: 'in' | 'out';
  title: string;
  description?: string;
  amount: string;
  signedAmount: string;
  currency: string;
  date: string;
  notes?: string;
  createdAt: string;
  spendingDetails?: {
    store?: string;
    itemCount: number;
    items?: Array<{ articleName: string; lineTotal: string; categoryName?: string }>;
  };
  adjustmentDetails?: {
    adjustmentType: 'delta' | 'reconcile';
    resultingBalance: string;
  };
}

export interface WalletTransactionsResponse {
  wallet: {
    id: string;
    name: string;
    color: string;
    type: 'asset' | 'liability';
    currentBalance: string;
    defaultCurrency: string;
  };
  summary: {
    totalAdded: string;
    totalSpent: string;
    netChange: string;
    transactionCount: number;
  };
  transactions: WalletTransactionItem[];
}

export const walletApi = {
  getWallets: () =>
    api.get<Wallet[]>('/wallets'),

  getWallet: (id: string) =>
    api.get<Wallet>(`/wallets/${id}`),

  createWallet: (data: CreateWalletInput) =>
    api.post<Wallet>('/wallets', data),

  updateWallet: (id: string, data: Partial<CreateWalletInput & { isArchived: boolean }>) =>
    api.put<Wallet>(`/wallets/${id}`, data),

  deleteWallet: (id: string) =>
    api.delete<{ success: boolean }>(`/wallets/${id}`),

  getAdjustments: (walletId: string) =>
    api.get<WalletAdjustment[]>(`/wallets/${walletId}/adjustments`),

  createAdjustment: (walletId: string, data: CreateAdjustmentInput) =>
    api.post<{ wallet: Wallet; adjustment: WalletAdjustment }>(`/wallets/${walletId}/adjustments`, data),

  getTransactions: (walletId: string, filters?: { from?: string; to?: string; type?: string }) =>
    api.get<WalletTransactionsResponse>(`/wallets/${walletId}/transactions`, filters),
};

