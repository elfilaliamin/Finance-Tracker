import React from 'react';
import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { IncomeSource, IncomeCategory } from '@/api/incomeApi';

interface IncomeFiltersProps {
  sources: IncomeSource[];
  categories: IncomeCategory[];
  selectedSourceId: string;
  onSelectSourceId: (id: string) => void;
  selectedCategoryId: string;
  onSelectCategoryId: (id: string) => void;
  selectedCurrency: string;
  onSelectCurrency: (curr: string) => void;
  selectedYear: number;
  onSelectYear: (year: number) => void;
  onClear: () => void;
}

export const IncomeFilters: React.FC<IncomeFiltersProps> = ({
  sources,
  categories,
  selectedSourceId,
  onSelectSourceId,
  selectedCategoryId,
  onSelectCategoryId,
  selectedCurrency,
  onSelectCurrency,
  selectedYear,
  onSelectYear,
  onClear,
}) => {
  const currentYear = new Date().getFullYear();
  let activeCount = 0;
  if (selectedSourceId) activeCount++;
  if (selectedCategoryId) activeCount++;
  if (selectedCurrency) activeCount++;
  if (selectedYear !== currentYear) activeCount++;

  return (
    <FilterDrawer activeCount={activeCount} onClear={onClear} title="Filter Income Ledger">
      {/* Year */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-[var(--color-text-muted)] font-semibold sm:hidden">Year</label>
        <select
          value={selectedYear}
          onChange={(e) => onSelectYear(parseInt(e.target.value, 10))}
          className="px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
        >
          {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((yr) => (
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
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-[var(--color-text-muted)] font-semibold sm:hidden">Category</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => onSelectCategoryId(e.target.value)}
          className="px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none w-full sm:w-auto"
        >
          <option value="" className="bg-[var(--color-surface)] text-[var(--color-text)]">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
              {c.name}
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

