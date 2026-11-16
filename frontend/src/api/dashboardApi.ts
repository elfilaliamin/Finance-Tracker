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
  latestIncome?: { date: string; amount: string; source?: string; sourceTitle?: string; currency?: string; baseAmount?: string } | null;
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
  name?: string;
  amount: number;
  netWorth?: number;
  assets?: number;
  debt?: number;
  liabilities?: number;
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

  getNetWorthHistory: (
    walletIdOrFilters?: string | { walletId?: string; period?: string; year?: number; from?: string; to?: string },
    options?: { period?: string; year?: number; from?: string; to?: string }
  ) => {
    let params: Record<string, any> = {};
    if (typeof walletIdOrFilters === 'string') {
      params.walletId = walletIdOrFilters;
      if (options) Object.assign(params, options);
    } else if (walletIdOrFilters && typeof walletIdOrFilters === 'object') {
      params = { ...walletIdOrFilters };
    }
    return api.get<NetWorthHistoryPoint[]>('/dashboard/charts/net-worth-history', Object.keys(params).length > 0 ? params : undefined);
  },
};

