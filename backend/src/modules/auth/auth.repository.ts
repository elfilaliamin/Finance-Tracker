import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';

export class AuthRepository {
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()));
    return user || null;
  }

  async findById(id: string) {
    const [user] = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        displayName: schema.users.displayName,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return user || null;
  }

  async findByIdWithPassword(id: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return user || null;
  }

  async createUser(
    email: string,
    passwordHash: string,
    displayName: string,
    baseCurrency: string = 'MAD'
  ) {
    return await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(schema.users)
        .values({
          email: email.toLowerCase().trim(),
          passwordHash,
          displayName: displayName.trim(),
        })
        .returning({
          id: schema.users.id,
          email: schema.users.email,
          displayName: schema.users.displayName,
          createdAt: schema.users.createdAt,
        });

      // Automatically provision default settings for new user
      await tx.insert(schema.userSettings).values({
        userId: newUser.id,
        displayCurrency: baseCurrency,
        conversionMode: 'historical',
        exchangeRateFrequency: 'daily',
        theme: 'system',
      });

      return newUser;
    });
  }

  async updatePassword(userId: string, newPasswordHash: string) {
    await db
      .update(schema.users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));
  }
}

export const authRepository = new AuthRepository();

