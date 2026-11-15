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
  availableYears?: number[];
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
  availableYears = [],
  onClear,
}) => {
  const currentYear = new Date().getFullYear();

  // Only include years older than last year (yr < currentYear - 1)
  // Exclude future years (yr <= currentYear) and only include years that actually exist in records
  const olderRecordedYears = Array.from(new Set(availableYears))
    .filter((yr) => typeof yr === 'number' && !isNaN(yr) && yr < currentYear - 1 && yr <= currentYear)
    .sort((a, b) => b - a);

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
          <option value="this_year" className="bg-[var(--color-surface)] text-[var(--color-text)]">
            This Year
          </option>
          <option value="last_year" className="bg-[var(--color-surface)] text-[var(--color-text)]">
            Last Year
          </option>
          {olderRecordedYears.map((yr) => (
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
