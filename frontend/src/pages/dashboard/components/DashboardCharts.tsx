import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ResponsiveChartWrapper } from '@/components/ui/ResponsiveChartWrapper';
import { IncomeTrendPoint, NetWorthHistoryPoint } from '@/api/dashboardApi';

interface DashboardChartsProps {
  incomeTrend: IncomeTrendPoint[];
  netWorthHistory: NetWorthHistoryPoint[];
  currency: string;
  showIncomeTrend?: boolean;
  showNetWorthHistory?: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  incomeTrend,
  netWorthHistory,
  currency,
  showIncomeTrend = true,
  showNetWorthHistory = true,
}) => {
  if (!showIncomeTrend && !showNetWorthHistory) {
    return null;
  }
  const normalizedIncomeTrend = (incomeTrend || []).map((pt: any) => ({
    ...pt,
    amount: typeof pt.amount === 'number' ? pt.amount : parseFloat(pt.amount || pt.income || '0'),
  }));

  const normalizedNetWorthHistory = (netWorthHistory || []).map((pt: any) => ({
    ...pt,
    amount: typeof pt.amount === 'number' ? pt.amount : parseFloat(pt.amount || pt.balance || '0'),
    date: pt.date || pt.name || '',
  }));

  const formatYAxis = (val: any) => {
    const num = typeof val === 'number' ? val : parseFloat(val || '0');
    if (isNaN(num)) return '0';
    if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return String(num);
  };

  const customTooltipFormatter = (val: any) => {
    const num = typeof val === 'number' ? val : parseFloat(val || '0');
    const safeNum = isNaN(num) ? 0 : num;
    return [`${safeNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`];
  };

  const singleChart = (showIncomeTrend && !showNetWorthHistory) || (!showIncomeTrend && showNetWorthHistory);

  return (
    <div className={`grid grid-cols-1 ${singleChart ? '' : 'lg:grid-cols-2'} gap-6 mb-6`}>
      {/* Income Trend Chart */}
      {showIncomeTrend && (
        <ResponsiveChartWrapper
          title="Income Trend"
          subtitle={`Monthly income progression (${currency})`}
        >
          {normalizedIncomeTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-sm">
              No income recorded for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={normalizedIncomeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
                <Tooltip
                  formatter={customTooltipFormatter}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-base)',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-base)',
                  }}
                />
                <Bar dataKey="amount" name="Income" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ResponsiveChartWrapper>
      )}

      {/* Net Worth History Chart */}
      {showNetWorthHistory && (
        <ResponsiveChartWrapper
          title="Net Worth History"
          subtitle={`Balance trajectory across snapshots (${currency})`}
        >
          {normalizedNetWorthHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-sm">
              No net worth snapshots recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={normalizedNetWorthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="networthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
                <Tooltip
                  formatter={customTooltipFormatter}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-base)',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-base)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Net Worth"
                  stroke="var(--color-secondary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#networthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ResponsiveChartWrapper>
      )}
    </div>
  );
};

