import React from 'react';
import { SpendingMatrixData } from '@/api/dashboardApi';

interface SpendingMatrixProps {
  data: SpendingMatrixData;
  currency: string;
  year: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SpendingMatrix: React.FC<SpendingMatrixProps> = ({ data, currency, year }) => {
  const formatMoney = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '-';
    const num = typeof val === 'string' ? parseFloat(val || '0') : val;
    if (isNaN(num) || num === 0) return '-';
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (!data) {
    return null;
  }

  const categories = data.categories || data.rows?.map((r) => {
    const monthlyAmounts: Record<string, string> = {};
    (r.months || []).forEach((amt, idx) => {
      monthlyAmounts[String(idx + 1).padStart(2, '0')] = amt;
    });
    return {
      id: r.id,
      name: r.name,
      color: r.color,
      monthlyAmounts,
      total: r.rowTotal,
    };
  }) || [];

  const monthlyTotals = data.monthlyTotals || (data.columnTotals || []).reduce((acc: Record<string, string>, val, idx) => {
    acc[String(idx + 1).padStart(2, '0')] = val;
    return acc;
  }, {});

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-base)] p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-heading font-bold text-[var(--color-text)] text-base md:text-lg">
            Spending Matrix &bull; {year}
          </h3>
          <p className="text-xs md:text-sm text-[var(--color-text-muted)] mt-0.5">
            Itemized spending breakdown by category across all 12 months ({currency})
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border border-[var(--color-border)] rounded-[var(--radius-base)]">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-[var(--color-primary-bg)] border-b border-[var(--color-border)] font-semibold text-[var(--color-text)]">
              <th className="py-3 px-3 min-w-[140px] sticky left-0 bg-[var(--color-primary-bg)] z-10 shadow-[1px_0_0_0_var(--color-border)]">
                Category
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="py-3 px-2.5 text-right min-w-[65px]">
                  {m}
                </th>
              ))}
              <th className="py-3 px-3 text-right min-w-[85px] bg-[var(--color-primary-bg)]/80 font-bold text-[var(--color-text)]">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-8 text-center text-[var(--color-text-muted)]">
                  No spending records found for {year}.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[var(--color-primary-bg)]/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[var(--color-text)] sticky left-0 bg-[var(--color-surface)] z-10 shadow-[1px_0_0_0_var(--color-border)] truncate max-w-[160px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || 'var(--color-accent)' }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                  </td>
                  {MONTHS.map((_, idx) => {
                    const monthKey = String(idx + 1).padStart(2, '0');
                    const amt = cat.monthlyAmounts?.[monthKey] || '0';
                    return (
                      <td key={idx} className="py-2.5 px-2.5 text-right text-[var(--color-text)] font-mono">
                        {formatMoney(amt)}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-right font-bold text-[var(--color-text)] bg-[var(--color-primary-bg)]/20 font-mono">
                    {formatMoney(cat.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {categories.length > 0 && (
            <tfoot>
              <tr className="bg-[var(--color-primary-bg)] border-t-2 border-[var(--color-border)] font-bold text-[var(--color-text)]">
                <td className="py-3 px-3 sticky left-0 bg-[var(--color-primary-bg)] z-10 shadow-[1px_0_0_0_var(--color-border)]">
                  Total Spending
                </td>
                {MONTHS.map((_, idx) => {
                  const monthKey = String(idx + 1).padStart(2, '0');
                  const amt = monthlyTotals[monthKey] || '0';
                  return (
                    <td key={idx} className="py-3 px-2.5 text-right font-mono text-[var(--color-accent)] font-semibold">
                      {formatMoney(amt)}
                    </td>
                  );
                })}
                <td className="py-3 px-3 text-right bg-[var(--color-primary)] font-extrabold text-white font-mono">
                  {formatMoney(data.grandTotal)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

