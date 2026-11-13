import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';

export class SpendingCategoriesRepository {
  async listByUser(userId: string) {
    return await db
      .select()
      .from(schema.spendingCategories)
      .where(
        and(
          eq(schema.spendingCategories.userId, userId),
          eq(schema.spendingCategories.isDeleted, false)
        )
      )
      .orderBy(schema.spendingCategories.name);
  }

  async findById(id: string, userId: string) {
    const [category] = await db
      .select()
      .from(schema.spendingCategories)
      .where(
        and(
          eq(schema.spendingCategories.id, id),
          eq(schema.spendingCategories.userId, userId),
          eq(schema.spendingCategories.isDeleted, false)
        )
      );
    return category || null;
  }

  async create(userId: string, name: string, color: string = '#f43f5e', icon?: string) {
    const [category] = await db
      .insert(schema.spendingCategories)
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
      .update(schema.spendingCategories)
      .set({
        ...(data.name && { name: data.name.trim() }),
        ...(data.color && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.spendingCategories.id, id),
          eq(schema.spendingCategories.userId, userId),
          eq(schema.spendingCategories.isDeleted, false)
        )
      )
      .returning();
    return updated || null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const [deleted] = await db
      .update(schema.spendingCategories)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.spendingCategories.id, id),
          eq(schema.spendingCategories.userId, userId),
          eq(schema.spendingCategories.isDeleted, false)
        )
      )
      .returning();
    return !!deleted;
  }
}

export const spendingCategoriesRepository = new SpendingCategoriesRepository();

