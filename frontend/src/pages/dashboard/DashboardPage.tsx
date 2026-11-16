import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/api/dashboardApi';
import { walletApi } from '@/api/walletApi';
import { incomeApi } from '@/api/incomeApi';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { DashboardCharts } from './components/DashboardCharts';
import { SpendingMatrix } from './components/SpendingMatrix';
import { RiFilterLine, RiCalendarLine, RiSettings3Line } from '@remixicon/react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { config } = useDashboardConfig();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  const displayCurrency = user?.baseCurrency || 'MAD';

  // Fetch available years from records (no future years, only years with data)
  const { data: serverAvailableYears = [] } = useQuery({
    queryKey: ['availableYears'],
    queryFn: () => incomeApi.getAvailableYears(),
  });

  const olderRecordedYears = Array.from(new Set(serverAvailableYears))
    .filter((yr) => typeof yr === 'number' && !isNaN(yr) && yr < currentYear - 1 && yr <= currentYear)
    .sort((a, b) => b - a);

  const dashboardYearOptions = [
    { value: currentYear, label: `This Year (${currentYear})` },
    { value: currentYear - 1, label: `Last Year (${currentYear - 1})` },
    ...olderRecordedYears.map((yr) => ({ value: yr, label: String(yr) })),
  ];

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

  // Fetch Net Worth History (filtered by wallet and selected year)
  const { data: netWorthHistory = [] } = useQuery({
    queryKey: ['dashboard', 'netWorthHistory', selectedWalletId, selectedYear],
    queryFn: () =>
      dashboardApi.getNetWorthHistory({
        walletId: selectedWalletId || undefined,
        year: selectedYear,
      }),
  });

  const isLoading = isMetricsLoading || isMatrixLoading;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[var(--color-text)] font-medium text-sm">
          <RiFilterLine className="w-5 h-5 text-[var(--color-accent)]" />
          <span>Dashboard Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-[var(--radius-base)] px-3 py-1.5">
            <RiCalendarLine className="w-4 h-4 text-[var(--color-text-muted)]" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-sm font-semibold text-[var(--color-text)] focus:outline-none"
            >
              {dashboardYearOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Global Wallet Filter */}
          <div className="flex items-center gap-1.5 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-[var(--radius-base)] px-3 py-1.5 flex-1 sm:flex-initial">
            <span className="text-xs text-[var(--color-text-muted)] font-medium whitespace-nowrap">Wallet:</span>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[var(--color-text)] focus:outline-none w-full sm:w-auto"
            >
              <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">All Wallets (Consolidated)</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  {w.name} ({w.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
          <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Calculating financial metrics...</p>
        </div>
      ) : (
        <>
          {/* Check if everything is hidden */}
          {!config.showMetricsGrid &&
            !config.showIncomeTrend &&
            !config.showNetWorthHistory &&
            !config.showSpendingMatrix && (
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-8 text-center shadow-[var(--shadow-sm)]">
                <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                  All dashboard sections are currently hidden
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  You can enable the KPI cards, charts, and spending matrix in your settings.
                </p>
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shadow-xs"
                >
                  <RiSettings3Line size={16} />
                  <span>Customize Dashboard</span>
                </Link>
              </div>
            )}

          {/* 12 Metric KPI Cards */}
          {config.showMetricsGrid && (
            <MetricCardsGrid
              metrics={metrics || {
                todaysNetWorth: '0.00',
                currentMonthIncome: '0.00',
                priorMonthIncome: '0.00',
                yearIncome: '0.00',
                lifetimeIncome: '0.00',
                avgMonthlyIncome: '0.00',
                highestIncomeMonth: { month: 'N/A', amount: '0.00' },
                lowestIncomeMonth: { month: 'N/A', amount: '0.00' },
                largestIncomeSource: { name: 'None', amount: '0.00' },
                activeIncomeSourcesCount: 0,
                latestIncome: null,
                latestNetWorth: null,
              }}
              currency={displayCurrency}
              visibleCards={config.visibleCards}
            />
          )}

          {/* Charts: Income Trend & Net Worth Progression */}
          <DashboardCharts
            incomeTrend={incomeTrend}
            netWorthHistory={netWorthHistory}
            currency={displayCurrency}
            showIncomeTrend={config.showIncomeTrend}
            showNetWorthHistory={config.showNetWorthHistory}
          />

          {/* Category x 12 Months Spending Matrix */}
          {config.showSpendingMatrix && (
            <SpendingMatrix
              data={spendingMatrix || { categories: [], grandTotal: '0.00' }}
              currency={displayCurrency}
              year={selectedYear}
            />
          )}
        </>
      )}
    </div>
  );
};

