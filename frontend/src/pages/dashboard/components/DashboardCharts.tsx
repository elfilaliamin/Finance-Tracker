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
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  incomeTrend,
  netWorthHistory,
  currency,
}) => {
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return String(val);
  };

  const customTooltipFormatter = (val: any) => {
    const num = typeof val === 'number' ? val : parseFloat(val || '0');
    return [`${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Income Trend Chart */}
      <ResponsiveChartWrapper
        title="Income Trend"
        subtitle={`Monthly income progression (${currency})`}
      >
        {incomeTrend.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No income recorded for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
              <Tooltip
                formatter={customTooltipFormatter}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="amount" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ResponsiveChartWrapper>

      {/* Net Worth History Chart */}
      <ResponsiveChartWrapper
        title="Net Worth History"
        subtitle={`Balance trajectory across snapshots (${currency})`}
      >
        {netWorthHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No net worth snapshots recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netWorthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="networthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
              <Tooltip
                formatter={customTooltipFormatter}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                name="Net Worth"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#networthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ResponsiveChartWrapper>
    </div>
  );
};

