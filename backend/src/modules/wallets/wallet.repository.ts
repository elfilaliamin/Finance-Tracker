import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { Money } from '../../utils/money.js';
import { currencyService } from '../currencies/currency.service.js';

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

  async getWalletTransactions(
    walletId: string,
    userId: string,
    filters?: { from?: string; to?: string; type?: string }
  ) {
    // 1. Fetch wallet
    const [wallet] = await db
      .select()
      .from(schema.wallets)
      .where(and(eq(schema.wallets.id, walletId), eq(schema.wallets.userId, userId)));

    if (!wallet) return null;

    // 2. Fetch adjustments for this wallet
    const adjConditions = [
      eq(schema.walletAdjustments.walletId, walletId),
      eq(schema.walletAdjustments.userId, userId),
    ];
    if (filters?.from) adjConditions.push(gte(schema.walletAdjustments.adjustmentDate, filters.from));
    if (filters?.to) adjConditions.push(lte(schema.walletAdjustments.adjustmentDate, filters.to));

    const adjustments = await db
      .select()
      .from(schema.walletAdjustments)
      .where(and(...adjConditions))
      .orderBy(desc(schema.walletAdjustments.adjustmentDate), desc(schema.walletAdjustments.createdAt));

    // 3. Fetch spendings for this wallet
    const spendConditions = [
      eq(schema.spendings.paidFromWalletId, walletId),
      eq(schema.spendings.userId, userId),
      eq(schema.spendings.isDeleted, false),
    ];
    if (filters?.from) spendConditions.push(gte(schema.spendings.date, filters.from));
    if (filters?.to) spendConditions.push(lte(schema.spendings.date, filters.to));

    const spendings = await db
      .select({
        id: schema.spendings.id,
        date: schema.spendings.date,
        store: schema.spendings.store,
        currency: schema.spendings.currency,
        totalAmount: schema.spendings.totalAmount,
        notes: schema.spendings.notes,
        createdAt: schema.spendings.createdAt,
      })
      .from(schema.spendings)
      .where(and(...spendConditions))
      .orderBy(desc(schema.spendings.date), desc(schema.spendings.createdAt));

    // 4. Fetch line items for these spendings if any
    const spendingIds = spendings.map((s) => s.id);
    const spendingItemsMap: Record<
      string,
      Array<{ articleName: string; lineTotal: string; categoryName?: string }>
    > = {};

    if (spendingIds.length > 0) {
      const items = await db
        .select({
          spendingId: schema.spendingItems.spendingId,
          articleName: schema.spendingItems.articleName,
          lineTotal: schema.spendingItems.lineTotal,
          categoryName: schema.spendingCategories.name,
        })
        .from(schema.spendingItems)
        .leftJoin(
          schema.spendingCategories,
          eq(schema.spendingItems.categoryId, schema.spendingCategories.id)
        )
        .where(inArray(schema.spendingItems.spendingId, spendingIds));

      items.forEach((item) => {
        if (!spendingItemsMap[item.spendingId]) {
          spendingItemsMap[item.spendingId] = [];
        }
        spendingItemsMap[item.spendingId].push({
          articleName: item.articleName,
          lineTotal: item.lineTotal,
          categoryName: item.categoryName || undefined,
        });
      });
    }

    // 5. Combine and calculate stats
    let totalAdded = Money.from(0);
    let totalSpent = Money.from(0);

    const transactionItems: Array<{
      id: string;
      source: 'adjustment' | 'spending';
      type: 'deposit' | 'withdrawal' | 'reconcile' | 'spending';
      direction: 'in' | 'out';
      title: string;
      description?: string;
      amount: string;
      signedAmount: string;
      currency: string;
      date: string;
      notes?: string;
      createdAt: string;
      spendingDetails?: {
        store?: string;
        itemCount: number;
        items?: Array<{ articleName: string; lineTotal: string; categoryName?: string }>;
      };
      adjustmentDetails?: {
        adjustmentType: 'delta' | 'reconcile';
        resultingBalance: string;
      };
    }> = [];

    // Map adjustments
    for (const adj of adjustments) {
      const amountNum = parseFloat(adj.amount);
      const isReconcile = adj.adjustmentType === 'reconcile';
      const isPositive = amountNum >= 0;

      const direction: 'in' | 'out' = isPositive ? 'in' : 'out';
      const type: 'deposit' | 'withdrawal' | 'reconcile' = isReconcile
        ? 'reconcile'
        : isPositive
        ? 'deposit'
        : 'withdrawal';

      const absAmount = Math.abs(amountNum).toFixed(2);
      const signedAmount = `${amountNum >= 0 ? '+' : '-'}${absAmount}`;

      if (isPositive) {
        totalAdded = Money.add(totalAdded, absAmount);
      } else {
        totalSpent = Money.add(totalSpent, absAmount);
      }

      let title = 'Balance Adjustment';
      if (adj.notes && adj.notes.toLowerCase().includes('initial')) {
        title = 'Initial Balance Deposit';
      } else if (isReconcile) {
        title = 'Count Reconciliation';
      } else if (isPositive) {
        title = 'Money Added';
      } else {
        title = 'Balance Deduction';
      }

      transactionItems.push({
        id: adj.id,
        source: 'adjustment',
        type,
        direction,
        title,
        description:
          adj.notes ||
          (isReconcile ? `Reconciled to ${adj.resultingBalance} ${adj.currency}` : undefined),
        amount: absAmount,
        signedAmount,
        currency: adj.currency,
        date: adj.adjustmentDate,
        notes: adj.notes || undefined,
        createdAt: adj.createdAt instanceof Date ? adj.createdAt.toISOString() : String(adj.createdAt),
        adjustmentDetails: {
          adjustmentType: adj.adjustmentType as 'delta' | 'reconcile',
          resultingBalance: adj.resultingBalance,
        },
      });
    }

    // Map spendings
    for (const sp of spendings) {
      const spItems = spendingItemsMap[sp.id] || [];
      const totalAmountStr = sp.totalAmount;
      const totalNum = parseFloat(totalAmountStr);

      let spendingInWalletCurrency = Money.from(totalAmountStr);
      if (sp.currency !== wallet.defaultCurrency) {
        try {
          const rate = await currencyService.getRateForDate(sp.currency, wallet.defaultCurrency, sp.date);
          spendingInWalletCurrency = Money.convert(spendingInWalletCurrency, rate);
        } catch {}
      }

      totalSpent = Money.add(totalSpent, spendingInWalletCurrency);

      const itemsSummary =
        spItems.length > 0
          ? spItems.map((i) => i.articleName).slice(0, 3).join(', ') +
            (spItems.length > 3 ? ` +${spItems.length - 3} more` : '')
          : undefined;

      transactionItems.push({
        id: sp.id,
        source: 'spending',
        type: 'spending',
        direction: 'out',
        title: sp.store || 'Spending Purchase',
        description: itemsSummary || sp.notes || 'Spending payment from wallet',
        amount: Math.abs(totalNum).toFixed(2),
        signedAmount: `-${Math.abs(totalNum).toFixed(2)}`,
        currency: sp.currency,
        date: sp.date,
        notes: sp.notes || undefined,
        createdAt: sp.createdAt instanceof Date ? sp.createdAt.toISOString() : String(sp.createdAt),
        spendingDetails: {
          store: sp.store || undefined,
          itemCount: spItems.length,
          items: spItems,
        },
      });
    }

    // Sort all transactions chronologically descending
    transactionItems.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.createdAt.localeCompare(a.createdAt);
    });

    // Filter by type if provided
    let filteredTransactions = transactionItems;
    if (filters?.type === 'in') {
      filteredTransactions = transactionItems.filter((t) => t.direction === 'in');
    } else if (filters?.type === 'out') {
      filteredTransactions = transactionItems.filter((t) => t.direction === 'out');
    } else if (filters?.type === 'spending') {
      filteredTransactions = transactionItems.filter((t) => t.source === 'spending');
    } else if (filters?.type === 'adjustment') {
      filteredTransactions = transactionItems.filter((t) => t.source === 'adjustment');
    }

    const netChange = Money.toDbString(Money.subtract(totalAdded, totalSpent));

    return {
      wallet: {
        id: wallet.id,
        name: wallet.name,
        color: wallet.color,
        type: wallet.type as 'asset' | 'liability',
        currentBalance: wallet.currentBalance,
        defaultCurrency: wallet.defaultCurrency,
      },
      summary: {
        totalAdded: Money.toDbString(totalAdded),
        totalSpent: Money.toDbString(totalSpent),
        netChange,
        transactionCount: transactionItems.length,
      },
      transactions: filteredTransactions,
    };
  }
}

export const walletRepository = new WalletRepository();

