import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
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
      })
      .from(schema.incomes)
      .leftJoin(schema.incomeSources, eq(schema.incomes.sourceId, schema.incomeSources.id))
      .leftJoin(schema.incomeCategories, eq(schema.incomes.categoryId, schema.incomeCategories.id))
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
    amount: string;
    currency: string;
    exchangeRateToBase: string;
    baseAmount: string;
    description: string;
    notes?: string;
  }) {
    const [income] = await db
      .insert(schema.incomes)
      .values({
        userId,
        date: data.date,
        sourceId: data.sourceId,
        categoryId: data.categoryId,
        amount: data.amount,
        currency: data.currency,
        exchangeRateToBase: data.exchangeRateToBase,
        baseAmount: data.baseAmount,
        description: data.description,
        notes: data.notes,
      })
      .returning();
    return income;
  }

  async update(id: string, userId: string, data: {
    date?: string;
    sourceId?: string;
    categoryId?: string;
    amount?: string;
    currency?: string;
    exchangeRateToBase?: string;
    baseAmount?: string;
    description?: string;
    notes?: string;
  }) {
    const [updated] = await db
      .update(schema.incomes)
      .set({
        ...(data.date && { date: data.date }),
        ...(data.sourceId && { sourceId: data.sourceId }),
        ...(data.categoryId && { categoryId: data.categoryId }),
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
    return updated || null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const [deleted] = await db
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
  }
}

export const incomeRepository = new IncomeRepository();

