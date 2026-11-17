import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { Money } from '../../utils/money.js';
import { currencyService } from '../currencies/currency.service.js';
import { IncomeFilterInput } from './income.schemas.js';

export class IncomeRepository {
  async listByUser(userId: string, filters: IncomeFilterInput) {
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    let dateConditions = [];
    if (filters.year && filters.month) {
      const monthStr = filters.month.toString().padStart(2, '0');
      const start = `${filters.year}-${monthStr}-01`;
      const lastDay = new Date(filters.year, filters.month, 0).getDate();
      const end = `${filters.year}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;
      dateConditions.push(gte(schema.incomes.date, start));
      dateConditions.push(lte(schema.incomes.date, end));
    } else if (filters.year) {
      dateConditions.push(gte(schema.incomes.date, `${filters.year}-01-01`));
      dateConditions.push(lte(schema.incomes.date, `${filters.year}-12-31`));
    }

    const whereConditions = and(
      eq(schema.incomes.userId, userId),
      eq(schema.incomes.isDeleted, false),
      filters.sourceId ? eq(schema.incomes.sourceId, filters.sourceId) : undefined,
      filters.categoryId ? eq(schema.incomes.categoryId, filters.categoryId) : undefined,
      filters.currency ? eq(schema.incomes.currency, filters.currency) : undefined,
      ...dateConditions
    );

    // Get total count
    const [totalRecord] = await db
      .select({ count: count() })
      .from(schema.incomes)
      .where(whereConditions);

    const total = totalRecord?.count || 0;

    // Get paginated rows with source and category relations
    const rows = await db
      .select({
        id: schema.incomes.id,
        date: schema.incomes.date,
        amount: schema.incomes.amount,
        currency: schema.incomes.currency,
        exchangeRateToBase: schema.incomes.exchangeRateToBase,
        baseAmount: schema.incomes.baseAmount,
        description: schema.incomes.description,
        notes: schema.incomes.notes,
        walletId: schema.incomes.walletId,
        createdAt: schema.incomes.createdAt,
        source: {
          id: schema.incomeSources.id,
          title: schema.incomeSources.title,
          color: schema.incomeSources.color,
        },
        category: {
          id: schema.incomeCategories.id,
          name: schema.incomeCategories.name,
          color: schema.incomeCategories.color,
          icon: schema.incomeCategories.icon,
        },
        wallet: {
          id: schema.wallets.id,
          name: schema.wallets.name,
          color: schema.wallets.color,
        },
      })
      .from(schema.incomes)
      .leftJoin(schema.incomeSources, eq(schema.incomes.sourceId, schema.incomeSources.id))
      .leftJoin(schema.incomeCategories, eq(schema.incomes.categoryId, schema.incomeCategories.id))
      .leftJoin(schema.wallets, eq(schema.incomes.walletId, schema.wallets.id))
      .where(whereConditions)
      .orderBy(desc(schema.incomes.date), desc(schema.incomes.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string, userId: string) {
    const [income] = await db
      .select({
        id: schema.incomes.id,
        date: schema.incomes.date,
        sourceId: schema.incomes.sourceId,
        categoryId: schema.incomes.categoryId,
        amount: schema.incomes.amount,
        currency: schema.incomes.currency,
        exchangeRateToBase: schema.incomes.exchangeRateToBase,
        baseAmount: schema.incomes.baseAmount,
        description: schema.incomes.description,
        notes: schema.incomes.notes,
        walletId: schema.incomes.walletId,
        createdAt: schema.incomes.createdAt,
      })
      .from(schema.incomes)
      .where(
        and(
          eq(schema.incomes.id, id),
          eq(schema.incomes.userId, userId),
          eq(schema.incomes.isDeleted, false)
        )
      );
    return income || null;
  }

  async create(userId: string, data: {
    date: string;
    sourceId: string;
    categoryId: string;
    walletId?: string;
    amount: string;
    currency: string;
    exchangeRateToBase: string;
    baseAmount: string;
    description: string;
    notes?: string;
  }) {
    return await db.transaction(async (tx) => {
      const [income] = await tx
        .insert(schema.incomes)
        .values({
          userId,
          date: data.date,
          sourceId: data.sourceId,
          categoryId: data.categoryId,
          walletId: data.walletId || null,
          amount: data.amount,
          currency: data.currency,
          exchangeRateToBase: data.exchangeRateToBase,
          baseAmount: data.baseAmount,
          description: data.description,
          notes: data.notes,
        })
        .returning();

      if (data.walletId) {
        const [wallet] = await tx
          .select({
            currentBalance: schema.wallets.currentBalance,
            defaultCurrency: schema.wallets.defaultCurrency,
          })
          .from(schema.wallets)
          .where(and(eq(schema.wallets.id, data.walletId), eq(schema.wallets.userId, userId)));

        if (wallet) {
          let depositAmount = data.amount;
          if (wallet.defaultCurrency !== data.currency) {
            const rate = await currencyService.getRateForDate(data.currency, wallet.defaultCurrency, data.date);
            depositAmount = Money.toDbString(Money.convert(data.amount, rate));
          }
          const newBalance = Money.add(wallet.currentBalance, depositAmount);
          await tx
            .update(schema.wallets)
            .set({
              currentBalance: Money.toDbString(newBalance),
              updatedAt: new Date(),
            })
            .where(eq(schema.wallets.id, data.walletId));
        }
      }

      return income;
    });
  }

  async update(id: string, userId: string, data: {
    date?: string;
    sourceId?: string;
    categoryId?: string;
    walletId?: string;
    amount?: string;
    currency?: string;
    exchangeRateToBase?: string;
    baseAmount?: string;
    description?: string;
    notes?: string;
  }) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(schema.incomes)
        .where(and(eq(schema.incomes.id, id), eq(schema.incomes.userId, userId), eq(schema.incomes.isDeleted, false)));

      if (!existing) return null;

      // Revert previous wallet deposit if amount or wallet changed
      const walletChanged = data.walletId !== undefined && data.walletId !== existing.walletId;
      const amountChanged = data.amount !== undefined && data.amount !== existing.amount;

      if ((walletChanged || amountChanged) && existing.walletId) {
        const [oldWallet] = await tx
          .select({
            currentBalance: schema.wallets.currentBalance,
            defaultCurrency: schema.wallets.defaultCurrency,
          })
          .from(schema.wallets)
          .where(and(eq(schema.wallets.id, existing.walletId), eq(schema.wallets.userId, userId)));

        if (oldWallet) {
          let refundAmount = existing.amount;
          if (oldWallet.defaultCurrency !== existing.currency) {
            const rate = await currencyService.getRateForDate(existing.currency, oldWallet.defaultCurrency, existing.date);
            refundAmount = Money.toDbString(Money.convert(existing.amount, rate));
          }
          const revertedBalance = Money.subtract(oldWallet.currentBalance, refundAmount);
          await tx
            .update(schema.wallets)
            .set({
              currentBalance: Money.toDbString(revertedBalance),
              updatedAt: new Date(),
            })
            .where(eq(schema.wallets.id, existing.walletId));
        }
      }

      const [updated] = await tx
        .update(schema.incomes)
        .set({
          ...(data.date && { date: data.date }),
          ...(data.sourceId && { sourceId: data.sourceId }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.walletId !== undefined && { walletId: data.walletId || null }),
          ...(data.amount && { amount: data.amount }),
          ...(data.currency && { currency: data.currency }),
          ...(data.exchangeRateToBase && { exchangeRateToBase: data.exchangeRateToBase }),
          ...(data.baseAmount && { baseAmount: data.baseAmount }),
          ...(data.description && { description: data.description }),
          ...(data.notes !== undefined && { notes: data.notes }),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.incomes.id, id),
            eq(schema.incomes.userId, userId),
            eq(schema.incomes.isDeleted, false)
          )
        )
        .returning();

      // Apply new wallet deposit if needed
      const effectiveWalletId = data.walletId !== undefined ? data.walletId : existing.walletId;
      if ((walletChanged || amountChanged) && effectiveWalletId) {
        const [newWallet] = await tx
          .select({
            currentBalance: schema.wallets.currentBalance,
            defaultCurrency: schema.wallets.defaultCurrency,
          })
          .from(schema.wallets)
          .where(and(eq(schema.wallets.id, effectiveWalletId), eq(schema.wallets.userId, userId)));

        if (newWallet) {
          const effAmount = data.amount || existing.amount;
          const effCurrency = data.currency || existing.currency;
          const effDate = data.date || existing.date;
          let newDepositAmount = effAmount;
          if (newWallet.defaultCurrency !== effCurrency) {
            const rate = await currencyService.getRateForDate(effCurrency, newWallet.defaultCurrency, effDate);
            newDepositAmount = Money.toDbString(Money.convert(effAmount, rate));
          }
          const newBal = Money.add(newWallet.currentBalance, newDepositAmount);
          await tx
            .update(schema.wallets)
            .set({
              currentBalance: Money.toDbString(newBal),
              updatedAt: new Date(),
            })
            .where(eq(schema.wallets.id, effectiveWalletId));
        }
      }

      return updated || null;
    });
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(schema.incomes)
        .where(and(eq(schema.incomes.id, id), eq(schema.incomes.userId, userId), eq(schema.incomes.isDeleted, false)));

      if (!existing) return false;

      if (existing.walletId) {
        const [wallet] = await tx
          .select({
            currentBalance: schema.wallets.currentBalance,
            defaultCurrency: schema.wallets.defaultCurrency,
          })
          .from(schema.wallets)
          .where(and(eq(schema.wallets.id, existing.walletId), eq(schema.wallets.userId, userId)));

        if (wallet) {
          let refundAmount = existing.amount;
          if (wallet.defaultCurrency !== existing.currency) {
            const rate = await currencyService.getRateForDate(existing.currency, wallet.defaultCurrency, existing.date);
            refundAmount = Money.toDbString(Money.convert(existing.amount, rate));
          }
          const newBalance = Money.subtract(wallet.currentBalance, refundAmount);
          await tx
            .update(schema.wallets)
            .set({
              currentBalance: Money.toDbString(newBalance),
              updatedAt: new Date(),
            })
            .where(eq(schema.wallets.id, existing.walletId));
        }
      }

      const [deleted] = await tx
        .update(schema.incomes)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.incomes.id, id),
            eq(schema.incomes.userId, userId),
            eq(schema.incomes.isDeleted, false)
          )
        )
        .returning();

      return !!deleted;
    });
  }

  async getAvailableYears(userId: string): Promise<number[]> {
    const result = await db
      .select({
        year: sql<number>`DISTINCT EXTRACT(YEAR FROM ${schema.incomes.date})::int`,
      })
      .from(schema.incomes)
      .where(
        and(
          eq(schema.incomes.userId, userId),
          eq(schema.incomes.isDeleted, false)
        )
      )
      .orderBy(desc(sql`EXTRACT(YEAR FROM ${schema.incomes.date})::int`));

    const currentYear = new Date().getFullYear();
    return result
      .map((r) => r.year)
      .filter((y) => typeof y === 'number' && !isNaN(y) && y <= currentYear);
  }
}

export const incomeRepository = new IncomeRepository();

