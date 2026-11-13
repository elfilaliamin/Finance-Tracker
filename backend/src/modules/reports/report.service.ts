import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { Money } from '../../utils/money.js';

export interface ReportFilterParams {
  type: 'income' | 'spending' | 'summary';
  from?: string;
  to?: string;
  walletId?: string;
  sourceId?: string;
  categoryId?: string;
  currency?: string;
}

export class ReportService {
  async getIncomeReportData(userId: string, filters: ReportFilterParams) {
    const whereConditions = and(
      eq(schema.incomes.userId, userId),
      eq(schema.incomes.isDeleted, false),
      filters.from ? gte(schema.incomes.date, filters.from) : undefined,
      filters.to ? lte(schema.incomes.date, filters.to) : undefined,
      filters.sourceId ? eq(schema.incomes.sourceId, filters.sourceId) : undefined,
      filters.categoryId ? eq(schema.incomes.categoryId, filters.categoryId) : undefined,
      filters.currency ? eq(schema.incomes.currency, filters.currency) : undefined
    );

    const rows = await db
      .select({
        date: schema.incomes.date,
        sourceTitle: schema.incomeSources.title,
        categoryName: schema.incomeCategories.name,
        amount: schema.incomes.amount,
        currency: schema.incomes.currency,
        baseAmount: schema.incomes.baseAmount,
        exchangeRate: schema.incomes.exchangeRateToBase,
        description: schema.incomes.description,
        notes: schema.incomes.notes,
      })
      .from(schema.incomes)
      .leftJoin(schema.incomeSources, eq(schema.incomes.sourceId, schema.incomeSources.id))
      .leftJoin(schema.incomeCategories, eq(schema.incomes.categoryId, schema.incomeCategories.id))
      .where(whereConditions)
      .orderBy(desc(schema.incomes.date));

    let grandTotalBase = Money.from(0);
    const formattedRows = rows.map((r) => {
      grandTotalBase = Money.add(grandTotalBase, r.baseAmount);
      return {
        date: r.date,
        source: r.sourceTitle || 'N/A',
        category: r.categoryName || 'N/A',
        originalAmount: Money.format(r.amount, r.currency),
        currency: r.currency,
        convertedBaseAmount: Money.format(r.baseAmount, 'MAD'),
        exchangeRate: r.exchangeRate,
        description: r.description,
        notes: r.notes || '',
      };
    });

    return {
      headers: [
        'date',
        'source',
        'category',
        'originalAmount',
        'currency',
        'convertedBaseAmount',
        'exchangeRate',
        'description',
        'notes',
      ],
      rows: formattedRows,
      grandTotalBase: Money.format(grandTotalBase, 'MAD'),
    };
  }

  async getSpendingReportData(userId: string, filters: ReportFilterParams) {
    const whereConditions = and(
      eq(schema.spendings.userId, userId),
      eq(schema.spendings.isDeleted, false),
      filters.from ? gte(schema.spendings.date, filters.from) : undefined,
      filters.to ? lte(schema.spendings.date, filters.to) : undefined,
      filters.walletId ? eq(schema.spendings.paidFromWalletId, filters.walletId) : undefined,
      filters.currency ? eq(schema.spendings.currency, filters.currency) : undefined
    );

    const items = await db
      .select({
        date: schema.spendings.date,
        store: schema.spendings.store,
        walletName: schema.wallets.name,
        currency: schema.spendings.currency,
        rate: schema.spendings.exchangeRateToBase,
        articleName: schema.spendingItems.articleName,
        categoryName: schema.spendingCategories.name,
        unitPrice: schema.spendingItems.unitPrice,
        quantity: schema.spendingItems.quantity,
        lineTotal: schema.spendingItems.lineTotal,
        baseLineTotal: schema.spendingItems.baseLineTotal,
      })
      .from(schema.spendingItems)
      .innerJoin(schema.spendings, eq(schema.spendingItems.spendingId, schema.spendings.id))
      .leftJoin(schema.wallets, eq(schema.spendings.paidFromWalletId, schema.wallets.id))
      .leftJoin(schema.spendingCategories, eq(schema.spendingItems.categoryId, schema.spendingCategories.id))
      .where(whereConditions)
      .orderBy(desc(schema.spendings.date));

    let grandTotalBase = Money.from(0);
    const formattedRows = items.map((i) => {
      grandTotalBase = Money.add(grandTotalBase, i.baseLineTotal);
      return {
        date: i.date,
        store: i.store || 'N/A',
        wallet: i.walletName || 'Unassigned',
        articleName: i.articleName,
        category: i.categoryName || 'Uncategorized',
        unitPrice: Money.format(i.unitPrice, i.currency),
        quantity: i.quantity,
        lineTotal: Money.format(i.lineTotal, i.currency),
        currency: i.currency,
        convertedBaseTotal: Money.format(i.baseLineTotal, 'MAD'),
        exchangeRate: i.rate,
      };
    });

    return {
      headers: [
        'date',
        'store',
        'wallet',
        'articleName',
        'category',
        'unitPrice',
        'quantity',
        'lineTotal',
        'currency',
        'convertedBaseTotal',
        'exchangeRate',
      ],
      rows: formattedRows,
      grandTotalBase: Money.format(grandTotalBase, 'MAD'),
    };
  }
}

export const reportService = new ReportService();

