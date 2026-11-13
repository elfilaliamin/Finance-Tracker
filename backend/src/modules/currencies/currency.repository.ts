import { and, desc, eq, lte } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';

export class CurrencyRepository {
  async getAllCurrencies() {
    return await db.select().from(schema.currencies).orderBy(schema.currencies.code);
  }

  async getLatestRates() {
    return await db
      .select()
      .from(schema.exchangeRates)
      .orderBy(desc(schema.exchangeRates.rateDate));
  }

  async getRateForDate(baseCurrency: string, targetCurrency: string, rateDate: string) {
    if (baseCurrency === targetCurrency) {
      return '1.000000';
    }

    // Direct pair lookup on or prior to date (fallback for weekends and bank holidays)
    const [rateRecord] = await db
      .select({ rate: schema.exchangeRates.rate })
      .from(schema.exchangeRates)
      .where(
        and(
          eq(schema.exchangeRates.baseCurrency, baseCurrency),
          eq(schema.exchangeRates.targetCurrency, targetCurrency),
          lte(schema.exchangeRates.rateDate, rateDate)
        )
      )
      .orderBy(desc(schema.exchangeRates.rateDate))
      .limit(1);

    if (rateRecord) {
      return rateRecord.rate;
    }

    // Try inverted pair (1 / invertedRate)
    const [invertedRecord] = await db
      .select({ rate: schema.exchangeRates.rate })
      .from(schema.exchangeRates)
      .where(
        and(
          eq(schema.exchangeRates.baseCurrency, targetCurrency),
          eq(schema.exchangeRates.targetCurrency, baseCurrency),
          lte(schema.exchangeRates.rateDate, rateDate)
        )
      )
      .orderBy(desc(schema.exchangeRates.rateDate))
      .limit(1);

    if (invertedRecord) {
      const invRate = parseFloat(invertedRecord.rate);
      if (invRate > 0) {
        return (1 / invRate).toFixed(6);
      }
    }

    // Default 1:1 if rate cannot be resolved
    return '1.000000';
  }

  async upsertExchangeRate(
    baseCurrency: string,
    targetCurrency: string,
    rate: string,
    rateDate: string,
    source: string = 'open.er-api.com'
  ) {
    await db
      .insert(schema.exchangeRates)
      .values({
        baseCurrency,
        targetCurrency,
        rate,
        rateDate,
        source,
      })
      .onConflictDoUpdate({
        target: [schema.exchangeRates.baseCurrency, schema.exchangeRates.targetCurrency, schema.exchangeRates.rateDate],
        set: {
          rate,
          source,
        },
      });
  }

  async getRateHistory(from?: string, to?: string) {
    let query = db.select().from(schema.exchangeRates);
    return await query.orderBy(desc(schema.exchangeRates.rateDate)).limit(100);
  }
}

export const currencyRepository = new CurrencyRepository();

