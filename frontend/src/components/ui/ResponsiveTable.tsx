import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  renderMobileCard?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  renderMobileCard,
  onRowClick,
  isLoading,
}: ResponsiveTableProps<T>) {
  const { isMobile } = useBreakpoint();

  if (isLoading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-[color:var(--color-muted)]">
        <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[length:var(--font-size-step-sub1)]">Loading data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-12 text-center bg-[var(--color-surface)] text-[color:var(--color-muted)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-sm)]">
        <p className="text-[length:var(--font-size-step-0)]">{emptyMessage}</p>
      </div>
    );
  }

  // Mobile View: Render stacked cards
  if (isMobile && renderMobileCard) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={`bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)] transition-all ${
              onRowClick ? 'active:scale-[0.99] cursor-pointer' : ''
            }`}
          >
            {renderMobileCard(item)}
          </div>
        ))}
      </div>
    );
  }

  // Default Mobile fallback when no renderMobileCard is passed
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={`bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)] space-y-2 ${
              onRowClick ? 'active:scale-[0.99] cursor-pointer' : ''
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-center text-[length:var(--font-size-step-sub1)]">
                <span className="text-[color:var(--color-muted)] font-medium">{col.header}</span>
                <span className="text-[color:var(--color-text)] font-semibold text-right">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop / Tablet Table View
  return (
    <div className="w-full bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-primary-bg)] border-b border-[var(--color-border)] text-[length:var(--font-size-step-sub1)] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3.5 px-4 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-[length:var(--font-size-step-0)]">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`transition-colors ${
                  onRowClick
                    ? 'hover:bg-[var(--color-primary-bg)] cursor-pointer'
                    : 'hover:bg-[var(--color-background)]'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-4 text-[color:var(--color-text)] ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
