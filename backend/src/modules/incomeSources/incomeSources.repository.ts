import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';

export class IncomeSourcesRepository {
  async listByUser(userId: string, status?: 'active' | 'inactive') {
    let query = db
      .select()
      .from(schema.incomeSources)
      .where(
        and(
          eq(schema.incomeSources.userId, userId),
          eq(schema.incomeSources.isDeleted, false),
          status ? eq(schema.incomeSources.status, status) : undefined
        )
      )
      .orderBy(schema.incomeSources.title);

    return await query;
  }

  async findById(id: string, userId: string) {
    const [source] = await db
      .select()
      .from(schema.incomeSources)
      .where(
        and(
          eq(schema.incomeSources.id, id),
          eq(schema.incomeSources.userId, userId),
          eq(schema.incomeSources.isDeleted, false)
        )
      );
    return source || null;
  }

  async create(userId: string, title: string, description?: string, color: string = '#10b981') {
    const [source] = await db
      .insert(schema.incomeSources)
      .values({
        userId,
        title: title.trim(),
        description: description?.trim(),
        color,
        status: 'active',
      })
      .returning();
    return source;
  }

  async update(
    id: string,
    userId: string,
    data: { title?: string; description?: string; color?: string; status?: 'active' | 'inactive' }
  ) {
    const [updated] = await db
      .update(schema.incomeSources)
      .set({
        ...(data.title && { title: data.title.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() }),
        ...(data.color && { color: data.color }),
        ...(data.status && { status: data.status }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.incomeSources.id, id),
          eq(schema.incomeSources.userId, userId),
          eq(schema.incomeSources.isDeleted, false)
        )
      )
      .returning();
    return updated || null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const [deleted] = await db
      .update(schema.incomeSources)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.incomeSources.id, id),
          eq(schema.incomeSources.userId, userId),
          eq(schema.incomeSources.isDeleted, false)
        )
      )
      .returning();
    return !!deleted;
  }
}

export const incomeSourcesRepository = new IncomeSourcesRepository();

