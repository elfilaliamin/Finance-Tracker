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
import { useAuth } from '@/hooks/useAuth';

export const ExchangeRatesCard: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const baseCurrency = (user?.baseCurrency || 'MAD').toUpperCase();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick converter state
  const otherInitial = baseCurrency === 'MAD' ? 'USD' : 'MAD';
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [convertFrom, setConvertFrom] = useState<string>(baseCurrency);
  const [convertTo, setConvertTo] = useState<string>(otherInitial);

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

  const getFallback = (b: string, t: string): number => {
    if (b === 'USD' && t === 'MAD') return 10.05;
    if (b === 'MAD' && t === 'USD') return 0.099502;
    if (b === 'EUR' && t === 'MAD') return 10.8531;
    if (b === 'MAD' && t === 'EUR') return 0.092139;
    if (b === 'EUR' && t === 'USD') return 1.0799;
    if (b === 'USD' && t === 'EUR') return 0.926;
    return 1;
  };

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'MAD':
        return 'DH';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return code;
    }
  };

  // Determine the 4 paired cards based on the base currency (MAD / USD / EUR)
  const otherCurrencies = ['MAD', 'USD', 'EUR'].filter((c) => c !== baseCurrency);
  const secondaryA = otherCurrencies[0] || 'USD';
  const secondaryB = otherCurrencies[1] || 'EUR';

  const pairDefinitions = [
    { base: baseCurrency, target: secondaryA },
    { base: secondaryA, target: baseCurrency },
    { base: baseCurrency, target: secondaryB },
    { base: secondaryB, target: baseCurrency },
  ];

  const cards = pairDefinitions.map((p) => {
    const rate = getPairRate(p.base, p.target, getFallback(p.base, p.target));
    const invRate = getPairRate(p.target, p.base, getFallback(p.target, p.base));
    return {
      pairTitle: `${p.base} / ${p.target}`,
      base: p.base,
      target: p.target,
      rate,
      inverseRate: invRate,
      symbol: `${getCurrencySymbol(p.base)} → ${getCurrencySymbol(p.target)}`,
    };
  });

  // Calculate quick conversion
  const conversionRate = getPairRate(
    convertFrom,
    convertTo,
    getFallback(convertFrom, convertTo)
  );
  const convertedTotal = (convertAmount * conversionRate).toFixed(2);

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
              Live multi-currency conversion rates based on your default currency ({baseCurrency})
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

      {/* Prominent Current Live Rates 4 Cards */}
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
          {cards.map((c) => (
            <div
              key={c.pairTitle}
              className="bg-[var(--color-primary-bg)]/40 border border-[var(--color-border)] rounded-[var(--radius-base)] p-3.5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {c.pairTitle}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {c.symbol}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-[var(--color-text-muted)] font-mono font-medium">1 {c.base} =</span>
                  <span className="text-lg sm:text-xl font-extrabold font-mono text-[var(--color-accent)] tracking-wide">
                    {c.rate < 0.1 ? c.rate.toFixed(6) : c.rate.toFixed(4)}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-text)] font-mono">{c.target}</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1 truncate">
                  1 {c.target} ≈ {c.inverseRate < 0.1 ? c.inverseRate.toFixed(6) : c.inverseRate.toFixed(4)} {c.base}
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
              <option value="MAD">MAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-center text-[var(--color-text-muted)]">
            <RiArrowRightLine className="w-5 h-5 hidden sm:block" />
            <span className="sm:hidden text-xs font-bold">to</span>
          </div>

          <div className="sm:col-span-7 flex items-center justify-between p-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] border border-[var(--color-border)]">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black font-mono text-[var(--color-text)] tracking-wide">
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
    </div>
  );
};
