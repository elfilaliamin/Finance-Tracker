import React from 'react';
import { SpendingMatrixData } from '@/api/dashboardApi';

interface SpendingMatrixProps {
  data: SpendingMatrixData;
  currency: string;
  year: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SpendingMatrix: React.FC<SpendingMatrixProps> = ({ data, currency, year }) => {
  const formatMoney = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val || '0') : val;
    if (num === 0) return '-';
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base md:text-lg">
            Spending Matrix &bull; {year}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Itemized spending breakdown by category across all 12 months ({currency})
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
              <th className="py-3 px-3 min-w-[140px] sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                Category
              </th>
              {MONTHS.map((m, idx) => (
                <th key={m} className="py-3 px-2.5 text-right min-w-[65px]">
                  {m}
                </th>
              ))}
              <th className="py-3 px-3 text-right min-w-[85px] bg-slate-100 font-bold text-slate-800">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.categories.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-8 text-center text-slate-400">
                  No spending records found for {year}.
                </td>
              </tr>
            ) : (
              data.categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-800 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0] truncate max-w-[160px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || '#6366f1' }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                  </td>
                  {MONTHS.map((_, idx) => {
                    const monthKey = String(idx + 1).padStart(2, '0');
                    const amt = cat.monthlyAmounts?.[monthKey] || '0';
                    return (
                      <td key={idx} className="py-2.5 px-2.5 text-right text-slate-600 font-mono">
                        {formatMoney(amt)}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 bg-slate-50/50 font-mono">
                    {formatMoney(cat.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {data.categories.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900">
                <td className="py-3 px-3 sticky left-0 bg-slate-100 z-10 shadow-[1px_0_0_0_#cbd5e1]">
                  Total Spending
                </td>
                {MONTHS.map((_, idx) => {
                  const monthKey = String(idx + 1).padStart(2, '0');
                  const amt = data.monthlyTotals?.[monthKey] || '0';
                  return (
                    <td key={idx} className="py-3 px-2.5 text-right font-mono text-indigo-700">
                      {formatMoney(amt)}
                    </td>
                  );
                })}
                <td className="py-3 px-3 text-right bg-indigo-50 font-extrabold text-indigo-900 font-mono">
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

