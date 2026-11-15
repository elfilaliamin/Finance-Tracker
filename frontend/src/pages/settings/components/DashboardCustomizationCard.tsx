import React from 'react';
import {
  RemixiconComponentType,
  RiDashboardLine,
  RiRestartLine,
  RiCheckDoubleLine,
  RiCloseCircleLine,
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
  RiBarChart2Line,
  RiLineChartLine,
  RiTableLine,
} from '@remixicon/react';
import { useDashboardConfig, DashboardCustomization } from '@/hooks/useDashboardConfig';

interface MetricMeta {
  id: keyof DashboardCustomization['visibleCards'];
  title: string;
  desc: string;
  icon: RemixiconComponentType;
}

const METRIC_CARDS_META: MetricMeta[] = [
  {
    id: 'todaysNetWorth',
    title: "Today's Net Worth",
    desc: 'Current consolidated net worth snapshot',
    icon: RiWallet3Line,
  },
  {
    id: 'currentMonthIncome',
    title: 'Current Month Income',
    desc: 'Income earned in the ongoing calendar month',
    icon: RiArrowUpCircleLine,
  },
  {
    id: 'priorMonthIncome',
    title: 'Prior Month Income',
    desc: 'Income earned in the previous calendar month',
    icon: RiCalendarLine,
  },
  {
    id: 'yearIncome',
    title: 'Year Income (YTD)',
    desc: 'Cumulative earnings for the current calendar year',
    icon: RiAwardLine,
  },
  {
    id: 'lifetimeIncome',
    title: 'Lifetime Income',
    desc: 'Total historical recorded income across all time',
    icon: RiSparklingLine,
  },
  {
    id: 'avgMonthlyIncome',
    title: 'Average Monthly Income',
    desc: 'Average income across active recorded months',
    icon: RiBarChartGroupedLine,
  },
  {
    id: 'highestIncomeMonth',
    title: 'Highest Income Month',
    desc: 'Top earning month on record',
    icon: RiArrowRightUpLine,
  },
  {
    id: 'lowestIncomeMonth',
    title: 'Lowest Income Month',
    desc: 'Lowest earning month on record',
    icon: RiArrowRightDownLine,
  },
  {
    id: 'largestIncomeSource',
    title: 'Largest Income Source',
    desc: 'Source generating the highest single payout',
    icon: RiSparklingLine,
  },
  {
    id: 'activeIncomeSources',
    title: 'Active Income Sources',
    desc: 'Count of currently active revenue streams',
    icon: RiStackLine,
  },
  {
    id: 'latestIncome',
    title: 'Latest Income',
    desc: 'Most recent payment received',
    icon: RiTimeLine,
  },
  {
    id: 'latestNetWorth',
    title: 'Latest Net Worth Record',
    desc: 'Most recent net worth balance adjustment snapshot',
    icon: RiWallet3Line,
  },
];

export const DashboardCustomizationCard: React.FC = () => {
  const {
    config,
    toggleSection,
    toggleCard,
    resetDefaults,
    setAllCards,
    isUpdating,
  } = useDashboardConfig();

  const sections = [
    {
      id: 'showMetricsGrid' as const,
      title: 'KPI Metrics Grid',
      desc: 'Top financial summary cards for net worth and income',
      icon: RiDashboardLine,
      enabled: config.showMetricsGrid,
    },
    {
      id: 'showIncomeTrend' as const,
      title: 'Income Trend Chart',
      desc: 'Monthly bar chart tracking income progression across the year',
      icon: RiBarChart2Line,
      enabled: config.showIncomeTrend,
    },
    {
      id: 'showNetWorthHistory' as const,
      title: 'Net Worth History Chart',
      desc: 'Area chart illustrating balance trajectory across snapshots',
      icon: RiLineChartLine,
      enabled: config.showNetWorthHistory,
    },
    {
      id: 'showSpendingMatrix' as const,
      title: 'Monthly Spending Matrix',
      desc: 'Detailed monthly breakdown table across all categories',
      icon: RiTableLine,
      enabled: config.showSpendingMatrix,
    },
  ];

  const activeCardCount = Object.values(config.visibleCards).filter(Boolean).length;
  const totalCardCount = Object.keys(config.visibleCards).length;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
            <RiDashboardLine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[var(--color-text)] text-base">Dashboard Customization</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Choose which widgets, metric cards, and charts appear on your main dashboard
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetDefaults}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-primary-bg)] text-xs font-medium transition-colors self-start sm:self-auto touch-target"
          title="Restore default layout settings"
        >
          <RiRestartLine size={14} className={isUpdating ? 'animate-spin' : ''} />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Main Sections Toggles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Main Dashboard Sections
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <label
                key={section.id}
                className={`flex items-start justify-between p-3.5 rounded-[var(--radius-base)] border cursor-pointer transition-all select-none ${
                  section.enabled
                    ? 'bg-[var(--color-primary-bg)]/50 border-[var(--color-accent)]/40 shadow-xs'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3 pr-2">
                  <div
                    className={`w-7 h-7 rounded-[var(--radius-base)] flex items-center justify-center shrink-0 mt-0.5 ${
                      section.enabled
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[var(--color-text)] block">
                      {section.title}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] leading-relaxed block mt-0.5">
                      {section.desc}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={() => toggleSection(section.id)}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-ring)] focus:ring-offset-0 cursor-pointer"
                  />
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Individual KPI Metric Cards Customization */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                KPI Metric Cards
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)]">
                {activeCardCount} / {totalCardCount} active
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Select which individual financial cards show up inside the KPI Metrics Grid.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAllCards(true)}
              disabled={isUpdating || activeCardCount === totalCardCount}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text)] hover:bg-[var(--color-primary-bg)] disabled:opacity-40 transition-colors"
            >
              <RiCheckDoubleLine size={13} />
              <span>Enable All</span>
            </button>
            <button
              type="button"
              onClick={() => setAllCards(false)}
              disabled={isUpdating || activeCardCount === 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 disabled:opacity-40 transition-colors"
            >
              <RiCloseCircleLine size={13} />
              <span>Disable All</span>
            </button>
          </div>
        </div>

        {!config.showMetricsGrid && (
          <div className="p-3 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            <strong>Note:</strong> The KPI Metrics Grid section is currently toggled off above, so these individual cards will not appear on the dashboard until that section is re-enabled.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {METRIC_CARDS_META.map((meta) => {
            const Icon = meta.icon;
            const isEnabled = config.visibleCards[meta.id] !== false;

            return (
              <label
                key={meta.id}
                className={`p-3 rounded-[var(--radius-base)] border flex items-start justify-between gap-2.5 cursor-pointer select-none transition-all ${
                  isEnabled
                    ? 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-xs hover:border-[var(--color-accent)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-[var(--radius-base)] flex items-center justify-center shrink-0 mt-0.5 ${
                      isEnabled
                        ? 'bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)]'
                        : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[var(--color-text)] block truncate">
                      {meta.title}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)] leading-tight block truncate mt-0.5">
                      {meta.desc}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleCard(meta.id)}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-ring)] focus:ring-offset-0 cursor-pointer"
                  />
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
