import React from 'react';
import {
  Wallet,
  TrendingUp,
  Calendar,
  Award,
  Layers,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
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
      icon: Wallet,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Current Month Income',
      value: `${parseFloat(metrics.currentMonthIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: 'This calendar month',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Prior Month Income',
      value: `${parseFloat(metrics.priorMonthIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: 'Previous calendar month',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Year Income (YTD)',
      value: `${parseFloat(metrics.yearIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: `Calendar year ${new Date().getFullYear()}`,
      icon: Award,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      title: 'Lifetime Income',
      value: `${parseFloat(metrics.lifetimeIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: 'All recorded income',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Average Monthly Income',
      value: `${parseFloat(metrics.avgMonthlyIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: 'Active months average',
      icon: Layers,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    },
    {
      title: 'Highest Income Month',
      value: `${parseFloat(metrics.highestIncomeMonth?.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: metrics.highestIncomeMonth?.month ? `Month: ${metrics.highestIncomeMonth.month}` : 'None',
      icon: ArrowUpRight,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      title: 'Lowest Income Month',
      value: `${parseFloat(metrics.lowestIncomeMonth?.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      sub: metrics.lowestIncomeMonth?.month ? `Month: ${metrics.lowestIncomeMonth.month}` : 'None',
      icon: ArrowDownRight,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    {
      title: 'Largest Income Source',
      value: metrics.largestIncomeSource?.name || 'None',
      sub: metrics.largestIncomeSource?.amount
        ? `${parseFloat(metrics.largestIncomeSource.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
        : '0.00',
      icon: Sparkles,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      title: 'Active Income Sources',
      value: String(metrics.activeIncomeSourcesCount || 0),
      sub: 'Revenue streams',
      icon: Layers,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      title: 'Latest Income',
      value: metrics.latestIncome
        ? `${parseFloat(metrics.latestIncome.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
        : 'None',
      sub: metrics.latestIncome ? `${metrics.latestIncome.date} (${metrics.latestIncome.source})` : 'No records',
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Latest Net Worth Record',
      value: metrics.latestNetWorth
        ? `${parseFloat(metrics.latestNetWorth.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
        : 'None',
      sub: metrics.latestNetWorth?.date ? `Date: ${metrics.latestNetWorth.date}` : 'No adjustments',
      icon: Wallet,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon size={18} />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

