import { api } from './client';

export interface DashboardMetrics {
  todaysNetWorth?: string;
  todayNetWorth?: string;
  totalAssets?: string;
  totalLiabilities?: string;
  currentMonthIncome?: string;
  priorMonthIncome?: string;
  previousMonthIncome?: string;
  yearIncome?: string;
  lifetimeIncome?: string;
  avgMonthlyIncome?: string;
  averageMonthlyIncome?: string;
  highestIncomeMonth?: { month: string; amount: string };
  lowestIncomeMonth?: { month: string; amount: string };
  largestIncomeSource?: { name?: string; title?: string; amount: string };
  activeIncomeSourcesCount?: number;
  latestIncome?: { date: string; amount: string; source?: string; sourceTitle?: string; currency?: string } | null;
  latestNetWorth?: { date: string; amount: string } | null;
}

export interface SpendingMatrixData {
  categories?: {
    id: string;
    name: string;
    color: string;
    monthlyAmounts?: Record<string, string>;
    total?: string;
    months?: string[];
  }[];
  rows?: {
    id: string;
    name: string;
    color: string;
    months: string[];
    rowTotal: string;
  }[];
  monthlyTotals?: Record<string, string>;
  columnTotals?: string[];
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

