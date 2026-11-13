import { api } from './client';

export interface DashboardMetrics {
  todaysNetWorth: string;
  currentMonthIncome: string;
  priorMonthIncome: string;
  yearIncome: string;
  lifetimeIncome: string;
  avgMonthlyIncome: string;
  highestIncomeMonth: { month: string; amount: string };
  lowestIncomeMonth: { month: string; amount: string };
  largestIncomeSource: { name: string; amount: string };
  activeIncomeSourcesCount: number;
  latestIncome: { date: string; amount: string; source: string } | null;
  latestNetWorth: { date: string; amount: string } | null;
}

export interface SpendingMatrixData {
  categories: {
    id: string;
    name: string;
    color: string;
    monthlyAmounts: Record<string, string>;
    total: string;
  }[];
  monthlyTotals: Record<string, string>;
  grandTotal: string;
}

export interface IncomeTrendPoint {
  month: string;
  amount: number;
}

export interface NetWorthHistoryPoint {
  date: string;
  amount: number;
}

export const dashboardApi = {
  getMetrics: (walletId?: string) =>
    api.get<DashboardMetrics>('/dashboard/metrics', walletId ? { walletId } : undefined),

  getSpendingMatrix: (year?: number, walletId?: string) =>
    api.get<SpendingMatrixData>('/dashboard/charts/spending-matrix', {
      year: year || new Date().getFullYear(),
      ...(walletId ? { walletId } : {}),
    }),

  getIncomeTrend: (year?: number) =>
    api.get<IncomeTrendPoint[]>('/dashboard/charts/income-trend', {
      year: year || new Date().getFullYear(),
    }),

  getNetWorthHistory: (walletId?: string) =>
    api.get<NetWorthHistoryPoint[]>('/dashboard/charts/net-worth-history', walletId ? { walletId } : undefined),
};

