import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiRefreshLine, RiGlobalLine } from '@remixicon/react';
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
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
            <RiGlobalLine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[var(--color-text)] text-base">Exchange Rates Engine</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Live multi-currency conversion (USD, EUR, MAD)</p>
          </div>
        </div>

        <button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-primary-bg)] disabled:opacity-60 transition-all touch-target self-start sm:self-auto"
        >
          <RiRefreshLine className={`w-3.5 h-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{refreshMutation.isPending ? 'Fetching...' : 'Update Now'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-xs text-[var(--color-accent)]">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-[var(--color-text-muted)] py-3">Loading rates...</p>
      ) : rates.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] py-3">No rates recorded yet. Click "Update Now" to initialize.</p>
      ) : (
        <div className="overflow-x-auto border border-[var(--color-border)] rounded-[var(--radius-base)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--color-primary-bg)] border-b border-[var(--color-border)] font-semibold text-[var(--color-text-muted)]">
                <th className="py-2.5 px-3">Currency Pair</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Effective Date</th>
                <th className="py-2.5 px-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rates.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--color-primary-bg)]/30">
                  <td className="py-2.5 px-3 font-bold text-[var(--color-text)] font-mono">
                    1 {r.sourceCurrency} &rarr; {r.targetCurrency}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-[var(--color-accent)]">
                    {parseFloat(r.rate).toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[var(--color-text-muted)] font-mono">{r.rateDate}</td>
                  <td className="py-2.5 px-3 text-right text-[var(--color-text-muted)] uppercase text-[10px]">
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

