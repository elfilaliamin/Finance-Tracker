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
  const cards = [
    {
      title: "Today's Net Worth",
      value: `${parseFloat(metrics.todaysNetWorth || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: metrics.latestNetWorth ? `Last snapshot: ${metrics.latestNetWorth.date}` : 'No snapshots yet',
      icon: RiWallet3Line,
    },
    {
      title: 'Current Month Income',
      value: `${parseFloat(metrics.currentMonthIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: 'This calendar month',
      icon: RiArrowUpCircleLine,
    },
    {
      title: 'Prior Month Income',
      value: `${parseFloat(metrics.priorMonthIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: 'Previous calendar month',
      icon: RiCalendarLine,
    },
    {
      title: 'Year Income (YTD)',
      value: `${parseFloat(metrics.yearIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: `Calendar year ${new Date().getFullYear()}`,
      icon: RiAwardLine,
    },
    {
      title: 'Lifetime Income',
      value: `${parseFloat(metrics.lifetimeIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: 'All recorded income',
      icon: RiSparklingLine,
    },
    {
      title: 'Average Monthly Income',
      value: `${parseFloat(metrics.avgMonthlyIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: 'Active months average',
      icon: RiBarChartGroupedLine,
    },
    {
      title: 'Highest Income Month',
      value: `${parseFloat(metrics.highestIncomeMonth?.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: metrics.highestIncomeMonth?.month ? `Month: ${metrics.highestIncomeMonth.month}` : 'None',
      icon: RiArrowRightUpLine,
    },
    {
      title: 'Lowest Income Month',
      value: `${parseFloat(metrics.lowestIncomeMonth?.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: metrics.lowestIncomeMonth?.month ? `Month: ${metrics.lowestIncomeMonth.month}` : 'None',
      icon: RiArrowRightDownLine,
    },
    {
      title: 'Largest Income Source',
      value: metrics.largestIncomeSource?.name || 'None',
      sub: metrics.largestIncomeSource?.amount
        ? `${parseFloat(metrics.largestIncomeSource.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
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
        ? `${parseFloat(metrics.latestIncome.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
        : 'None',
      sub: metrics.latestIncome ? `${metrics.latestIncome.date} (${metrics.latestIncome.source})` : 'No records',
      icon: RiTimeLine,
    },
    {
      title: 'Latest Net Worth Record',
      value: metrics.latestNetWorth
        ? `${parseFloat(metrics.latestNetWorth.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
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

