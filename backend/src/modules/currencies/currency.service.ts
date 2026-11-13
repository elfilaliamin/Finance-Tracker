import { CurrencyRepository, currencyRepository } from './currency.repository.js';
import { logger } from '../../utils/logger.js';
import { Money } from '../../utils/money.js';

interface OpenErApiResponse {
  result: string;
  provider: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
}

export class CurrencyService {
  private readonly repository: CurrencyRepository;

  constructor(repository: CurrencyRepository = currencyRepository) {
    this.repository = repository;
  }

  async getCurrencies() {
    return await this.repository.getAllCurrencies();
  }

  async getLatestRates() {
    return await this.repository.getLatestRates();
  }

  async getRateForDate(fromCurrency: string, toCurrency: string, date: string): Promise<string> {
    if (fromCurrency === toCurrency) {
      return '1.000000';
    }
    return await this.repository.getRateForDate(fromCurrency, toCurrency, date);
  }

  async syncRatesFromProvider(): Promise<{ updated: number }> {
    const today = new Date().toISOString().split('T')[0];
    logger.info(`[CurrencyService] Syncing exchange rates from open.er-api.com for ${today}`);

    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) {
        throw new Error(`External API responded with status ${response.status}`);
      }

      const data = (await response.json()) as OpenErApiResponse;
      if (data.result !== 'success' || !data.rates) {
        throw new Error('Malformed exchange rate response from provider');
      }

      const usdRates = data.rates;
      const rateUsdMad = usdRates['MAD'];
      const rateUsdEur = usdRates['EUR'];

      if (!rateUsdMad || !rateUsdEur) {
        throw new Error('Provider response did not contain required MAD or EUR rates');
      }

      const pairsToUpdate: Array<{ base: string; target: string; rate: string }> = [
        // USD pairs
        { base: 'USD', target: 'MAD', rate: rateUsdMad.toFixed(6) },
        { base: 'USD', target: 'EUR', rate: rateUsdEur.toFixed(6) },
        // Inverse USD pairs
        { base: 'MAD', target: 'USD', rate: (1 / rateUsdMad).toFixed(6) },
        { base: 'EUR', target: 'USD', rate: (1 / rateUsdEur).toFixed(6) },
        // EUR and MAD cross pairs
        { base: 'EUR', target: 'MAD', rate: (rateUsdMad / rateUsdEur).toFixed(6) },
        { base: 'MAD', target: 'EUR', rate: (rateUsdEur / rateUsdMad).toFixed(6) },
      ];

      for (const pair of pairsToUpdate) {
        await this.repository.upsertExchangeRate(pair.base, pair.target, pair.rate, today, 'open.er-api.com');
      }

      logger.info(`[CurrencyService] Successfully synced ${pairsToUpdate.length} currency pairs for ${today}`);
      return { updated: pairsToUpdate.length };
    } catch (err) {
      logger.error('[CurrencyService] Failed to sync exchange rates:', err as Error);
      throw err;
    }
  }

  async setManualRate(baseCurrency: string, targetCurrency: string, rate: string, rateDate: string) {
    const formattedRate = Money.from(rate).toFixed(6);
    await this.repository.upsertExchangeRate(baseCurrency, targetCurrency, formattedRate, rateDate, 'manual');
    return { baseCurrency, targetCurrency, rate: formattedRate, rateDate, source: 'manual' };
  }

  async getRateHistory(from?: string, to?: string) {
    return await this.repository.getRateHistory(from, to);
  }
}

export const currencyService = new CurrencyService();

