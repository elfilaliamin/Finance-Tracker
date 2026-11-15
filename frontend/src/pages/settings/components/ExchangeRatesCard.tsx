import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiRefreshLine,
  RiGlobalLine,
  RiExchangeDollarLine,
  RiCheckLine,
  RiTimeLine,
  RiArrowRightLine,
} from '@remixicon/react';
import { settingsApi, ExchangeRate } from '@/api/settingsApi';

export const ExchangeRatesCard: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick converter state
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [convertFrom, setConvertFrom] = useState<string>('USD');
  const [convertTo, setConvertTo] = useState<string>('MAD');

  const { data: rawRates = [], isLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: () => settingsApi.getExchangeRates(),
    staleTime: 5 * 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => settingsApi.refreshExchangeRates(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeRates'] });
      setErrorMessage(null);
      setSuccessMessage('Exchange rates refreshed successfully from live financial provider.');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setSuccessMessage(null);
      setErrorMessage(err.message || 'Failed to sync live rates. Using cached rates.');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Normalize rates so both baseCurrency and sourceCurrency are handled
  const rates: ExchangeRate[] = rawRates.map((r) => ({
    ...r,
    baseCurrency: r.baseCurrency || r.sourceCurrency || 'USD',
  }));

  const getPairRate = (base: string, target: string, fallback: number): number => {
    if (base === target) return 1;
    const direct = rates.find(
      (r) => r.baseCurrency === base && r.targetCurrency === target
    );
    if (direct) {
      const val = parseFloat(direct.rate);
      if (!isNaN(val) && val > 0) return val;
    }
    const inverse = rates.find(
      (r) => r.baseCurrency === target && r.targetCurrency === base
    );
    if (inverse) {
      const val = parseFloat(inverse.rate);
      if (!isNaN(val) && val > 0) return 1 / val;
    }
    return fallback;
  };

  const usdToMad = getPairRate('USD', 'MAD', 10.05);
  const eurToMad = getPairRate('EUR', 'MAD', 10.85);
  const eurToUsd = getPairRate('EUR', 'USD', 1.08);
  const usdToEur = getPairRate('USD', 'EUR', 0.926);

  // Calculate quick conversion
  const conversionRate = getPairRate(
    convertFrom,
    convertTo,
    convertFrom === 'USD' && convertTo === 'MAD' ? 10.05 : 1
  );
  const convertedTotal = (convertAmount * conversionRate).toFixed(2);

  const keyPairs = [
    {
      pair: 'USD / MAD',
      base: 'USD',
      target: 'MAD',
      rate: usdToMad,
      inverseRate: 1 / usdToMad,
      symbol: '$ → DH',
      desc: 'US Dollar to Moroccan Dirham',
    },
    {
      pair: 'EUR / MAD',
      base: 'EUR',
      target: 'MAD',
      rate: eurToMad,
      inverseRate: 1 / eurToMad,
      symbol: '€ → DH',
      desc: 'Euro to Moroccan Dirham',
    },
    {
      pair: 'EUR / USD',
      base: 'EUR',
      target: 'USD',
      rate: eurToUsd,
      inverseRate: 1 / eurToUsd,
      symbol: '€ → $',
      desc: 'Euro to US Dollar',
    },
    {
      pair: 'USD / EUR',
      base: 'USD',
      target: 'EUR',
      rate: usdToEur,
      inverseRate: 1 / usdToEur,
      symbol: '$ → €',
      desc: 'US Dollar to Euro',
    },
  ];

  const latestDate = rates[0]?.rateDate || new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
            <RiGlobalLine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[var(--color-text)] text-base">Exchange Rates Engine</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Real-time multi-currency conversion rates between MAD, USD, and EUR
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-60 transition-all touch-target self-start sm:self-auto shadow-xs"
        >
          <RiRefreshLine className={`w-3.5 h-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{refreshMutation.isPending ? 'Syncing...' : 'Update Rates'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-xs text-[var(--color-accent)] flex items-center gap-2">
          <RiCheckLine size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-xs text-[var(--color-danger)]">
          {errorMessage}
        </div>
      )}

      {/* Prominent Current Rates Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Current Live Rates
          </h4>
          <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
            <RiTimeLine size={12} />
            <span>Effective: {latestDate}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {keyPairs.map((p) => (
            <div
              key={p.pair}
              className="bg-[var(--color-primary-bg)]/40 border border-[var(--color-border)] rounded-[var(--radius-base)] p-3.5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {p.pair}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {p.symbol}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-[var(--color-text-muted)] font-mono font-medium">1 {p.base} =</span>
                  <span className="text-lg sm:text-xl font-heading font-extrabold font-mono text-[var(--color-accent)] tracking-wide">
                    {p.rate.toFixed(4)}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-text)] font-mono">{p.target}</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1 truncate">
                  1 {p.target} ≈ {p.inverseRate.toFixed(4)} {p.base}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Interactive Converter */}
      <div className="p-4 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <RiExchangeDollarLine className="w-4 h-4 text-[var(--color-accent)]" />
          <h4 className="text-xs font-semibold text-[var(--color-text)]">Quick Currency Converter</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4 flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={convertAmount}
              onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-primary-bg)]/30 text-[var(--color-text)] text-sm font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)]"
              placeholder="Amount"
            />
            <select
              value={convertFrom}
              onChange={(e) => setConvertFrom(e.target.value)}
              className="px-2.5 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-bold focus:outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MAD">MAD</option>
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-center text-[var(--color-text-muted)]">
            <RiArrowRightLine className="w-5 h-5 hidden sm:block" />
            <span className="sm:hidden text-xs font-bold">to</span>
          </div>

          <div className="sm:col-span-7 flex items-center justify-between p-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] border border-[var(--color-border)]">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-heading font-black font-mono text-[var(--color-text)] tracking-wide">
                {parseFloat(convertedTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-[var(--color-accent)]">{convertTo}</span>
            </div>

            <select
              value={convertTo}
              onChange={(e) => setConvertTo(e.target.value)}
              className="px-2.5 py-1.5 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-bold focus:outline-none"
            >
              <option value="MAD">MAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Rates Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          All Recorded Pairs
        </h4>

        {isLoading ? (
          <p className="text-xs text-[var(--color-text-muted)] py-3">Loading rates from database...</p>
        ) : rates.length === 0 ? (
          <div className="p-3 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-[var(--radius-base)]">
            No custom rates synced yet. Standard baseline rates are active above. Click <strong>Update Rates</strong> to fetch the latest rates from the market.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[var(--color-border)] rounded-[var(--radius-base)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--color-primary-bg)] border-b border-[var(--color-border)] font-semibold text-[var(--color-text-muted)]">
                  <th className="py-2.5 px-3">Currency Pair</th>
                  <th className="py-2.5 px-3 text-right">Exchange Rate</th>
                  <th className="py-2.5 px-3 text-right">Effective Date</th>
                  <th className="py-2.5 px-3 text-right">Data Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {rates.map((r, idx) => {
                  const rateVal = parseFloat(r.rate);
                  return (
                    <tr key={r.id || idx} className="hover:bg-[var(--color-primary-bg)]/30">
                      <td className="py-2.5 px-3 font-bold text-[var(--color-text)] font-mono">
                        1 {r.baseCurrency} &rarr; {r.targetCurrency}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-[var(--color-accent)] tracking-wide">
                        {isNaN(rateVal) ? r.rate : rateVal.toFixed(6)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[var(--color-text-muted)] font-mono">{r.rateDate}</td>
                      <td className="py-2.5 px-3 text-right text-[var(--color-text-muted)] uppercase text-[10px]">
                        {r.source || 'open.er-api.com'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
