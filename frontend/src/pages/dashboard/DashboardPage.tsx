import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import { walletApi } from '@/api/walletApi';
import { useAuth } from '@/hooks/useAuth';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { DashboardCharts } from './components/DashboardCharts';
import { SpendingMatrix } from './components/SpendingMatrix';
import { Filter, Calendar } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  const displayCurrency = user?.baseCurrency || 'MAD';

  // Fetch wallets for global wallet filter
  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.getWallets(),
  });

  // Fetch Metrics (wallet filter applies to net worth only, never touches income)
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['dashboard', 'metrics', selectedWalletId],
    queryFn: () => dashboardApi.getMetrics(selectedWalletId || undefined),
  });

  // Fetch Spending Matrix (wallet filter applies to spending)
  const { data: spendingMatrix, isLoading: isMatrixLoading } = useQuery({
    queryKey: ['dashboard', 'spendingMatrix', selectedYear, selectedWalletId],
    queryFn: () => dashboardApi.getSpendingMatrix(selectedYear, selectedWalletId || undefined),
  });

  // Fetch Income Trend (NEVER filtered by wallet!)
  const { data: incomeTrend = [] } = useQuery({
    queryKey: ['dashboard', 'incomeTrend', selectedYear],
    queryFn: () => dashboardApi.getIncomeTrend(selectedYear),
  });

  // Fetch Net Worth History (filtered by wallet if selected)
  const { data: netWorthHistory = [] } = useQuery({
    queryKey: ['dashboard', 'netWorthHistory', selectedWalletId],
    queryFn: () => dashboardApi.getNetWorthHistory(selectedWalletId || undefined),
  });

  const isLoading = isMetricsLoading || isMatrixLoading;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
          <Filter size={18} className="text-indigo-600" />
          <span>Dashboard Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar size={16} className="text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Global Wallet Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex-1 sm:flex-initial">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Wallet:</span>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none w-full sm:w-auto"
            >
              <option value="">All Wallets (Consolidated)</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Calculating financial metrics...</p>
        </div>
      ) : (
        <>
          {/* 12 Metric KPI Cards */}
          {metrics && <MetricCardsGrid metrics={metrics} currency={displayCurrency} />}

          {/* Charts: Income Trend & Net Worth Progression */}
          <DashboardCharts
            incomeTrend={incomeTrend}
            netWorthHistory={netWorthHistory}
            currency={displayCurrency}
          />

          {/* Category x 12 Months Spending Matrix */}
          {spendingMatrix && (
            <SpendingMatrix data={spendingMatrix} currency={displayCurrency} year={selectedYear} />
          )}
        </>
      )}
    </div>
  );
};

