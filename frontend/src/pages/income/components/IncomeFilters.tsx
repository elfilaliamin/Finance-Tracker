import React from 'react';
import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { IncomeSource } from '@/api/incomeApi';

interface IncomeFiltersProps {
  sources: IncomeSource[];
  selectedSourceId: string;
  onSelectSourceId: (id: string) => void;
  selectedCurrency: string;
  onSelectCurrency: (curr: string) => void;
  selectedYear: number;
  onSelectYear: (year: number) => void;
  onClear: () => void;
}

export const IncomeFilters: React.FC<IncomeFiltersProps> = ({
  sources,
  selectedSourceId,
  onSelectSourceId,
  selectedCurrency,
  onSelectCurrency,
  selectedYear,
  onSelectYear,
  onClear,
}) => {
  const currentYear = new Date().getFullYear();
  let activeCount = 0;
  if (selectedSourceId) activeCount++;
  if (selectedCurrency) activeCount++;
  if (selectedYear > 0) activeCount++;

  return (
    <FilterDrawer activeCount={activeCount} onClear={onClear} title="Filter Income Ledger">
      {/* Year */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-[var(--color-text-muted)] font-semibold sm:hidden">Year</label>
        <select
          value={selectedYear === 0 ? 'all' : selectedYear}
          onChange={(e) => onSelectYear(e.target.value === 'all' ? 0 : parseInt(e.target.value, 10))}
          className="px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
        >
          <option value="all" className="bg-[var(--color-surface)] text-[var(--color-text)]">
            All Times
          </option>
          {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5].map((yr) => (
            <option key={yr} value={yr} className="bg-[var(--color-surface)] text-[var(--color-text)]">
              Year: {yr}
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
