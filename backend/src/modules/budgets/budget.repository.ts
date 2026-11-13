import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { BudgetFilterInput } from './budget.schemas.js';

export class BudgetRepository {
  async listByUser(userId: string, filters?: BudgetFilterInput) {
    return await db
      .select({
        id: schema.budgets.id,
        name: schema.budgets.name,
        type: schema.budgets.type,
        walletId: schema.budgets.walletId,
        categoryId: schema.budgets.categoryId,
        period: schema.budgets.period,
        startDate: schema.budgets.startDate,
        endDate: schema.budgets.endDate,
        targetAmount: schema.budgets.targetAmount,
        currency: schema.budgets.currency,
        isActive: schema.budgets.isActive,
        createdAt: schema.budgets.createdAt,
        wallet: {
          id: schema.wallets.id,
          name: schema.wallets.name,
          currentBalance: schema.wallets.currentBalance,
          defaultCurrency: schema.wallets.defaultCurrency,
        },
        category: {
          id: schema.spendingCategories.id,
          name: schema.spendingCategories.name,
          color: schema.spendingCategories.color,
        },
      })
      .from(schema.budgets)
      .leftJoin(schema.wallets, eq(schema.budgets.walletId, schema.wallets.id))
      .leftJoin(schema.spendingCategories, eq(schema.budgets.categoryId, schema.spendingCategories.id))
      .where(
        and(
          eq(schema.budgets.userId, userId),
          eq(schema.budgets.isDeleted, false),
          filters?.type ? eq(schema.budgets.type, filters.type) : undefined,
          filters?.walletId ? eq(schema.budgets.walletId, filters.walletId) : undefined,
          filters?.isActive !== undefined ? eq(schema.budgets.isActive, filters.isActive) : undefined
        )
      )
      .orderBy(desc(schema.budgets.createdAt));
  }

  async findById(id: string, userId: string) {
    const [budget] = await db
      .select({
        id: schema.budgets.id,
        name: schema.budgets.name,
        type: schema.budgets.type,
        walletId: schema.budgets.walletId,
        categoryId: schema.budgets.categoryId,
        period: schema.budgets.period,
        startDate: schema.budgets.startDate,
        endDate: schema.budgets.endDate,
        targetAmount: schema.budgets.targetAmount,
        currency: schema.budgets.currency,
        isActive: schema.budgets.isActive,
        createdAt: schema.budgets.createdAt,
        wallet: {
          id: schema.wallets.id,
          name: schema.wallets.name,
          currentBalance: schema.wallets.currentBalance,
          defaultCurrency: schema.wallets.defaultCurrency,
        },
        category: {
          id: schema.spendingCategories.id,
          name: schema.spendingCategories.name,
          color: schema.spendingCategories.color,
        },
      })
      .from(schema.budgets)
      .leftJoin(schema.wallets, eq(schema.budgets.walletId, schema.wallets.id))
      .leftJoin(schema.spendingCategories, eq(schema.budgets.categoryId, schema.spendingCategories.id))
      .where(
        and(
          eq(schema.budgets.id, id),
          eq(schema.budgets.userId, userId),
          eq(schema.budgets.isDeleted, false)
        )
      );

    return budget || null;
  }

  async create(userId: string, data: {
    name: string;
    type: 'spending_limit' | 'saving_goal';
    walletId?: string | null;
    categoryId?: string | null;
    period: 'monthly' | 'yearly' | 'custom';
    startDate: string;
    endDate?: string | null;
    targetAmount: string;
    currency: string;
  }) {
    const [budget] = await db
      .insert(schema.budgets)
      .values({
        userId,
        name: data.name,
        type: data.type,
        walletId: data.walletId,
        categoryId: data.categoryId,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        targetAmount: data.targetAmount,
        currency: data.currency,
      })
      .returning();
    return budget;
  }

  async update(id: string, userId: string, data: {
    name?: string;
    targetAmount?: string;
    currency?: string;
    endDate?: string | null;
    isActive?: boolean;
  }) {
    const [updated] = await db
      .update(schema.budgets)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.targetAmount && { targetAmount: data.targetAmount }),
        ...(data.currency && { currency: data.currency }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.budgets.id, id),
          eq(schema.budgets.userId, userId),
          eq(schema.budgets.isDeleted, false)
        )
      )
      .returning();
    return updated || null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const [deleted] = await db
      .update(schema.budgets)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.budgets.id, id),
          eq(schema.budgets.userId, userId),
          eq(schema.budgets.isDeleted, false)
        )
      )
      .returning();
    return !!deleted;
  }

  /**
   * Aggregates total spent in display base currency within period
   */
  async getSpentInPeriod(
    userId: string,
    params: {
      categoryId?: string | null;
      walletId?: string | null;
      startDate: string;
      endDate?: string | null;
    }
  ): Promise<string> {
    const conditions = [
      eq(schema.spendings.userId, userId),
      eq(schema.spendings.isDeleted, false),
      gte(schema.spendings.date, params.startDate),
    ];

    if (params.endDate) {
      conditions.push(lte(schema.spendings.date, params.endDate));
    }

    if (params.walletId) {
      conditions.push(eq(schema.spendings.paidFromWalletId, params.walletId));
    }

    if (params.categoryId) {
      // Sum spending items belonging to this category
      const [result] = await db
        .select({
          totalSpent: sql<string>`COALESCE(SUM(${schema.spendingItems.baseLineTotal}), '0.00')`,
        })
        .from(schema.spendingItems)
        .innerJoin(schema.spendings, eq(schema.spendingItems.spendingId, schema.spendings.id))
        .where(
          and(
            ...conditions,
            eq(schema.spendingItems.categoryId, params.categoryId)
          )
        );

      return result?.totalSpent || '0.00';
    } else {
      // Global spending or wallet spending
      const [result] = await db
        .select({
          totalSpent: sql<string>`COALESCE(SUM(${schema.spendings.baseTotalAmount}), '0.00')`,
        })
        .from(schema.spendings)
        .where(and(...conditions));

      return result?.totalSpent || '0.00';
    }
  }
}

export const budgetRepository = new BudgetRepository();

