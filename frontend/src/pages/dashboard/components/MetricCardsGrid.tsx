import React from 'react';
import {
  RiWallet3Line,
  RiArrowUpCircleLine,
  RiCalendarLine,
  RiAwardLine,
  RiSparklingLine,
  RiBarChartGroupedLine,
  RiArrowRightUpLine,
  RiArrowRightDownLine,
  RiStackLine,
  RiTimeLine,
} from '@remixicon/react';
import { DashboardMetrics } from '@/api/dashboardApi';

interface MetricCardsGridProps {
  metrics: DashboardMetrics;
  currency: string;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({ metrics, currency }) => {
  const parseVal = (val: string | undefined | null) => {
    const num = parseFloat(val || '0');
    return isNaN(num) ? '0.00' : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const cards = [
    {
      title: "Today's Net Worth",
      value: `${parseVal(metrics.todaysNetWorth || metrics.todayNetWorth)} ${currency}`,
      sub: metrics.latestNetWorth ? `Last snapshot: ${metrics.latestNetWorth.date}` : 'No snapshots yet',
      icon: RiWallet3Line,
    },
    {
      title: 'Current Month Income',
      value: `${parseVal(metrics.currentMonthIncome)} ${currency}`,
      sub: 'This calendar month',
      icon: RiArrowUpCircleLine,
    },
    {
      title: 'Prior Month Income',
      value: `${parseVal(metrics.priorMonthIncome || metrics.previousMonthIncome)} ${currency}`,
      sub: 'Previous calendar month',
      icon: RiCalendarLine,
    },
    {
      title: 'Year Income (YTD)',
      value: `${parseVal(metrics.yearIncome)} ${currency}`,
      sub: `Calendar year ${new Date().getFullYear()}`,
      icon: RiAwardLine,
    },
    {
      title: 'Lifetime Income',
      value: `${parseVal(metrics.lifetimeIncome)} ${currency}`,
      sub: 'All recorded income',
      icon: RiSparklingLine,
    },
    {
      title: 'Average Monthly Income',
      value: `${parseVal(metrics.avgMonthlyIncome || metrics.averageMonthlyIncome)} ${currency}`,
      sub: 'Active months average',
      icon: RiBarChartGroupedLine,
    },
    {
      title: 'Highest Income Month',
      value: `${parseVal(metrics.highestIncomeMonth?.amount)} ${currency}`,
      sub: metrics.highestIncomeMonth?.month && metrics.highestIncomeMonth.month !== 'N/A' ? `Month: ${metrics.highestIncomeMonth.month}` : 'None',
      icon: RiArrowRightUpLine,
    },
    {
      title: 'Lowest Income Month',
      value: `${parseVal(metrics.lowestIncomeMonth?.amount)} ${currency}`,
      sub: metrics.lowestIncomeMonth?.month && metrics.lowestIncomeMonth.month !== 'N/A' ? `Month: ${metrics.lowestIncomeMonth.month}` : 'None',
      icon: RiArrowRightDownLine,
    },
    {
      title: 'Largest Income Source',
      value: metrics.largestIncomeSource?.name || metrics.largestIncomeSource?.title || 'None',
      sub: metrics.largestIncomeSource?.amount && metrics.largestIncomeSource.amount !== '0.00'
        ? `${parseVal(metrics.largestIncomeSource.amount)} ${currency}`
        : '0.00',
      icon: RiSparklingLine,
    },
    {
      title: 'Active Income Sources',
      value: String(metrics.activeIncomeSourcesCount || 0),
      sub: 'Revenue streams',
      icon: RiStackLine,
    },
    {
      title: 'Latest Income',
      value: metrics.latestIncome
        ? `${parseVal(metrics.latestIncome.amount)} ${currency}`
        : 'None',
      sub: metrics.latestIncome ? `${metrics.latestIncome.date} (${metrics.latestIncome.source || metrics.latestIncome.sourceTitle || 'Income'})` : 'No records',
      icon: RiTimeLine,
    },
    {
      title: 'Latest Net Worth Record',
      value: metrics.latestNetWorth
        ? `${parseVal(metrics.latestNetWorth.amount)} ${currency}`
        : 'None',
      sub: metrics.latestNetWorth?.date ? `Date: ${metrics.latestNetWorth.date}` : 'No adjustments',
      icon: RiWallet3Line,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 sm:p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{card.title}</span>
              <div className="w-9 h-9 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight">{card.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

