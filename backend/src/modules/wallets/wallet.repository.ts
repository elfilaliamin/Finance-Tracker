import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { Money } from '../../utils/money.js';

export class WalletRepository {
  async listByUser(userId: string, status?: 'active' | 'archived') {
    return await db
      .select()
      .from(schema.wallets)
      .where(
        and(
          eq(schema.wallets.userId, userId),
          status ? eq(schema.wallets.status, status) : undefined
        )
      )
      .orderBy(schema.wallets.sortOrder, schema.wallets.name);
  }

  async findById(id: string, userId: string) {
    const [wallet] = await db
      .select()
      .from(schema.wallets)
      .where(and(eq(schema.wallets.id, id), eq(schema.wallets.userId, userId)));
    return wallet || null;
  }

  async create(userId: string, data: {
    name: string;
    description?: string;
    color: string;
    icon?: string;
    type: 'asset' | 'liability';
    currentBalance: string;
    defaultCurrency: string;
    sortOrder: number;
  }) {
    const [wallet] = await db
      .insert(schema.wallets)
      .values({
        userId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        type: data.type,
        currentBalance: data.currentBalance,
        defaultCurrency: data.defaultCurrency,
        sortOrder: data.sortOrder,
      })
      .returning();
    return wallet;
  }

  async update(id: string, userId: string, data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    status?: 'active' | 'archived';
    sortOrder?: number;
  }) {
    const [updated] = await db
      .update(schema.wallets)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.color && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.status && { status: data.status }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        updatedAt: new Date(),
      })
      .where(and(eq(schema.wallets.id, id), eq(schema.wallets.userId, userId)))
      .returning();
    return updated || null;
  }

  async recordAdjustment(
    walletId: string,
    userId: string,
    data: {
      adjustmentDate: string;
      adjustmentType: 'delta' | 'reconcile';
      amount: string; // The delta that affects balance
      resultingBalance: string;
      currency: string;
      exchangeRateToBase: string;
      baseAmount: string;
      notes?: string;
    }
  ) {
    return await db.transaction(async (tx) => {
      // 1. Update wallet balance
      const [updatedWallet] = await tx
        .update(schema.wallets)
        .set({
          currentBalance: data.resultingBalance,
          updatedAt: new Date(),
        })
        .where(and(eq(schema.wallets.id, walletId), eq(schema.wallets.userId, userId)))
        .returning();

      if (!updatedWallet) {
        throw new Error('Wallet not found');
      }

      // 2. Insert adjustment record
      const [adjustment] = await tx
        .insert(schema.walletAdjustments)
        .values({
          walletId,
          userId,
          adjustmentDate: data.adjustmentDate,
          adjustmentType: data.adjustmentType,
          amount: data.amount,
          resultingBalance: data.resultingBalance,
          currency: data.currency,
          exchangeRateToBase: data.exchangeRateToBase,
          baseAmount: data.baseAmount,
          notes: data.notes,
        })
        .returning();

      return { wallet: updatedWallet, adjustment };
    });
  }

  async listAdjustments(walletId: string, userId: string, from?: string, to?: string) {
    return await db
      .select()
      .from(schema.walletAdjustments)
      .where(
        and(
          eq(schema.walletAdjustments.walletId, walletId),
          eq(schema.walletAdjustments.userId, userId),
          from ? gte(schema.walletAdjustments.adjustmentDate, from) : undefined,
          to ? lte(schema.walletAdjustments.adjustmentDate, to) : undefined
        )
      )
      .orderBy(desc(schema.walletAdjustments.adjustmentDate), desc(schema.walletAdjustments.createdAt));
  }

  async deleteAdjustment(adjustmentId: string, walletId: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Find the adjustment
      const [adj] = await tx
        .select()
        .from(schema.walletAdjustments)
        .where(
          and(
            eq(schema.walletAdjustments.id, adjustmentId),
            eq(schema.walletAdjustments.walletId, walletId),
            eq(schema.walletAdjustments.userId, userId)
          )
        );

      if (!adj) {
        return null;
      }

      // Reverse the delta on wallet balance
      const [wallet] = await tx
        .select()
        .from(schema.wallets)
        .where(and(eq(schema.wallets.id, walletId), eq(schema.wallets.userId, userId)));

      if (!wallet) {
        return null;
      }

      const reversedBalance = Money.subtract(wallet.currentBalance, adj.amount);

      await tx
        .update(schema.wallets)
        .set({
          currentBalance: Money.toDbString(reversedBalance),
          updatedAt: new Date(),
        })
        .where(eq(schema.wallets.id, walletId));

      await tx.delete(schema.walletAdjustments).where(eq(schema.walletAdjustments.id, adjustmentId));

      return true;
    });
  }
}

export const walletRepository = new WalletRepository();

