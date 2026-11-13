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
      <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-12 text-center bg-white rounded-xl border border-slate-200/80 p-8 shadow-sm">
        <p className="text-slate-500 text-sm">{emptyMessage}</p>
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
            className={`bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm transition-all ${
              onRowClick ? 'active:scale-[0.99] cursor-pointer' : ''
            }`}
          >
            {renderMobileCard(item)}
          </div>
        ))}
      </div>
    );
  }

  // Default Mobile fallback when no renderMobileCard is passed: Stacked key-value cards
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={`bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-2 ${
              onRowClick ? 'active:scale-[0.99] cursor-pointer' : ''
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{col.header}</span>
                <span className="text-slate-900 font-semibold text-right">
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
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`transition-colors ${
                  onRowClick ? 'hover:bg-indigo-50/40 cursor-pointer' : 'hover:bg-slate-50/60'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-4 text-slate-700 ${
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

