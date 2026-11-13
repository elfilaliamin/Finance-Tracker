import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';

export class IncomeCategoriesRepository {
  async listByUser(userId: string) {
    return await db
      .select()
      .from(schema.incomeCategories)
      .where(
        and(
          eq(schema.incomeCategories.userId, userId),
          eq(schema.incomeCategories.isDeleted, false)
        )
      )
      .orderBy(schema.incomeCategories.name);
  }

  async findById(id: string, userId: string) {
    const [category] = await db
      .select()
      .from(schema.incomeCategories)
      .where(
        and(
          eq(schema.incomeCategories.id, id),
          eq(schema.incomeCategories.userId, userId),
          eq(schema.incomeCategories.isDeleted, false)
        )
      );
    return category || null;
  }

  async create(userId: string, name: string, color: string = '#06b6d4', icon?: string) {
    const [category] = await db
      .insert(schema.incomeCategories)
      .values({
        userId,
        name: name.trim(),
        color,
        icon,
      })
      .returning();
    return category;
  }

  async update(id: string, userId: string, data: { name?: string; color?: string; icon?: string }) {
    const [updated] = await db
      .update(schema.incomeCategories)
      .set({
        ...(data.name && { name: data.name.trim() }),
        ...(data.color && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.incomeCategories.id, id),
          eq(schema.incomeCategories.userId, userId),
          eq(schema.incomeCategories.isDeleted, false)
        )
      )
      .returning();
    return updated || null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const [deleted] = await db
      .update(schema.incomeCategories)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.incomeCategories.id, id),
          eq(schema.incomeCategories.userId, userId),
          eq(schema.incomeCategories.isDeleted, false)
        )
      )
      .returning();
    return !!deleted;
  }
}

export const incomeCategoriesRepository = new IncomeCategoriesRepository();

