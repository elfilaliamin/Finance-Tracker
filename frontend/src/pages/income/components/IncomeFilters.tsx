import React from 'react';
import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { IncomeSource } from '@/api/incomeApi';

interface IncomeFiltersProps {
  sources: IncomeSource[];
  selectedSourceId: string;
  onSelectSourceId: (id: string) => void;
  selectedCurrency: string;
  onSelectCurrency: (curr: string) => void;
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  onClear: () => void;
}

export const IncomeFilters: React.FC<IncomeFiltersProps> = ({
  sources,
  selectedSourceId,
  onSelectSourceId,
  selectedCurrency,
  onSelectCurrency,
  selectedPeriod,
  onSelectPeriod,
  onClear,
}) => {
  const currentYear = new Date().getFullYear();
  const pastYears = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
    currentYear - 5,
    currentYear - 6,
  ];

  let activeCount = 0;
  if (selectedSourceId) activeCount++;
  if (selectedCurrency) activeCount++;
  if (selectedPeriod && selectedPeriod !== 'all') activeCount++;

  return (
    <FilterDrawer activeCount={activeCount} onClear={onClear} title="Filter Income Ledger">
      {/* Time Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-[var(--color-text-muted)] font-semibold sm:hidden">Period</label>
        <select
          value={selectedPeriod}
          onChange={(e) => onSelectPeriod(e.target.value)}
          className="px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
        >
          <option value="all" className="bg-[var(--color-surface)] text-[var(--color-text)]">
            All Times
          </option>
          <option value="this_month" className="bg-[var(--color-surface)] text-[var(--color-text)]">
            This Month
          </option>
          <option value="last_month" className="bg-[var(--color-surface)] text-[var(--color-text)]">
            Last Month
          </option>
          {pastYears.map((yr) => (
            <option key={yr} value={String(yr)} className="bg-[var(--color-surface)] text-[var(--color-text)]">
              {yr}
            </option>
          ))}
        </select>
      </div>

      {/* Source */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-[var(--color-text-muted)] font-semibold sm:hidden">Source</label>
        <select
          value={selectedSourceId}
          onChange={(e) => onSelectSourceId(e.target.value)}
          className="px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none w-full sm:w-auto"
        >
          <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">All Sources</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
              {s.name || s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Currency */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-[var(--color-text-muted)] font-semibold sm:hidden">Currency</label>
        <select
          value={selectedCurrency}
          onChange={(e) => onSelectCurrency(e.target.value)}
          className="px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none w-full sm:w-auto"
        >
          <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">All Currencies</option>
          <option value="MAD" className="bg-[var(--color-surface)] text-[var(--color-text)]">MAD</option>
          <option value="USD" className="bg-[var(--color-surface)] text-[var(--color-text)]">USD</option>
          <option value="EUR" className="bg-[var(--color-surface)] text-[var(--color-text)]">EUR</option>
        </select>
      </div>
    </FilterDrawer>
  );
};
