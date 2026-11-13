import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Globe2 } from 'lucide-react';
import { settingsApi } from '@/api/settingsApi';

export const ExchangeRatesCard: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: () => settingsApi.getExchangeRates(),
  });

  const refreshMutation = useMutation({
    mutationFn: () => settingsApi.refreshExchangeRates(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeRates'] });
      setSuccessMessage('Exchange rates updated successfully from Open Exchange API.');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Globe2 size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Exchange Rates Engine</h3>
            <p className="text-xs text-slate-500">Live multi-currency conversion (USD, EUR, MAD)</p>
          </div>
        </div>

        <button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-all touch-target self-start sm:self-auto"
        >
          <RefreshCw size={13} className={refreshMutation.isPending ? 'animate-spin' : ''} />
          <span>{refreshMutation.isPending ? 'Fetching...' : 'Update Now'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-400 py-3">Loading rates...</p>
      ) : rates.length === 0 ? (
        <p className="text-xs text-slate-400 py-3">No rates recorded yet. Click "Update Now" to initialize.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
                <th className="py-2.5 px-3">Currency Pair</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Effective Date</th>
                <th className="py-2.5 px-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rates.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                    1 {r.sourceCurrency} &rarr; {r.targetCurrency}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-indigo-700">
                    {parseFloat(r.rate).toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 font-mono">{r.rateDate}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400 uppercase text-[10px]">
                    {r.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

