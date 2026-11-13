import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';

export class SettingsRepository {
  async getByUserId(userId: string) {
    const [settings] = await db
      .select()
      .from(schema.userSettings)
      .where(eq(schema.userSettings.userId, userId));
    return settings || null;
  }

  async update(userId: string, data: Partial<typeof schema.userSettings.$inferInsert>) {
    const [updated] = await db
      .update(schema.userSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.userSettings.userId, userId))
      .returning();
    return updated || null;
  }
}

export const settingsRepository = new SettingsRepository();

