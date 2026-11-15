import { and, desc, eq, gte, inArray, lte, or } from 'drizzle-orm';
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

  async recordTransfer(
    userId: string,
    data: {
      fromWalletId: string;
      toWalletId: string;
      amount: string;
      fromCurrency: string;
      targetAmount: string;
      toCurrency: string;
      exchangeRate: string;
      transferDate: string;
      notes?: string;
    }
  ) {
    return await db.transaction(async (tx) => {
      // 1. Fetch both wallets
      const [fromWallet] = await tx
        .select()
        .from(schema.wallets)
        .where(and(eq(schema.wallets.id, data.fromWalletId), eq(schema.wallets.userId, userId)));

      if (!fromWallet) {
        throw new Error('Source wallet not found');
      }

      const [toWallet] = await tx
        .select()
        .from(schema.wallets)
        .where(and(eq(schema.wallets.id, data.toWalletId), eq(schema.wallets.userId, userId)));

      if (!toWallet) {
        throw new Error('Destination wallet not found');
      }

      // 2. Compute new balances
      const newFromBalance = Money.subtract(fromWallet.currentBalance, data.amount);
      const newToBalance = Money.add(toWallet.currentBalance, data.targetAmount);

      // 3. Update fromWallet
      const [updatedFrom] = await tx
        .update(schema.wallets)
        .set({
          currentBalance: Money.toDbString(newFromBalance),
          updatedAt: new Date(),
        })
        .where(eq(schema.wallets.id, data.fromWalletId))
        .returning();

      // 4. Update toWallet
      const [updatedTo] = await tx
        .update(schema.wallets)
        .set({
          currentBalance: Money.toDbString(newToBalance),
          updatedAt: new Date(),
        })
        .where(eq(schema.wallets.id, data.toWalletId))
        .returning();

      // 5. Insert transfer record
      const [transfer] = await tx
        .insert(schema.walletTransfers)
        .values({
          userId,
          fromWalletId: data.fromWalletId,
          toWalletId: data.toWalletId,
          amount: data.amount,
          fromCurrency: data.fromCurrency,
          targetAmount: data.targetAmount,
          toCurrency: data.toCurrency,
          exchangeRate: data.exchangeRate,
          transferDate: data.transferDate,
          notes: data.notes,
        })
        .returning();

      return { transfer, fromWallet: updatedFrom, toWallet: updatedTo };
    });
  }

  async deleteTransfer(transferId: string, userId: string) {
    return await db.transaction(async (tx) => {
      const [transfer] = await tx
        .select()
        .from(schema.walletTransfers)
        .where(and(eq(schema.walletTransfers.id, transferId), eq(schema.walletTransfers.userId, userId)));

      if (!transfer) return false;

      // Reverse balances: add back to fromWallet, subtract from toWallet
      const [fromWallet] = await tx
        .select()
        .from(schema.wallets)
        .where(and(eq(schema.wallets.id, transfer.fromWalletId), eq(schema.wallets.userId, userId)));

      const [toWallet] = await tx
        .select()
        .from(schema.wallets)
        .where(and(eq(schema.wallets.id, transfer.toWalletId), eq(schema.wallets.userId, userId)));

      if (fromWallet) {
        const restoredFrom = Money.add(fromWallet.currentBalance, transfer.amount);
        await tx
          .update(schema.wallets)
          .set({ currentBalance: Money.toDbString(restoredFrom), updatedAt: new Date() })
          .where(eq(schema.wallets.id, fromWallet.id));
      }

      if (toWallet) {
        const restoredTo = Money.subtract(toWallet.currentBalance, transfer.targetAmount);
        await tx
          .update(schema.wallets)
          .set({ currentBalance: Money.toDbString(restoredTo), updatedAt: new Date() })
          .where(eq(schema.wallets.id, toWallet.id));
      }

      await tx.delete(schema.walletTransfers).where(eq(schema.walletTransfers.id, transferId));
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

    // 3b. Fetch transfers involving this wallet (as sender or receiver)
    const transferConditions = [
      eq(schema.walletTransfers.userId, userId),
      or(
        eq(schema.walletTransfers.fromWalletId, walletId),
        eq(schema.walletTransfers.toWalletId, walletId)
      ),
    ];
    if (filters?.from) transferConditions.push(gte(schema.walletTransfers.transferDate, filters.from));
    if (filters?.to) transferConditions.push(lte(schema.walletTransfers.transferDate, filters.to));

    const transfers = await db
      .select()
      .from(schema.walletTransfers)
      .where(and(...transferConditions))
      .orderBy(desc(schema.walletTransfers.transferDate), desc(schema.walletTransfers.createdAt));

    // Fetch all user wallets to resolve names in transfers
    const userWallets = await db
      .select({ id: schema.wallets.id, name: schema.wallets.name })
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId));
    const walletNameMap = new Map(userWallets.map((w) => [w.id, w.name]));

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
      source: 'adjustment' | 'spending' | 'transfer';
      type: 'deposit' | 'withdrawal' | 'reconcile' | 'spending' | 'transfer_in' | 'transfer_out';
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
      transferDetails?: {
        role: 'sender' | 'receiver';
        otherWalletId: string;
        otherWalletName: string;
        exchangeRate: string;
        sourceAmount?: string;
        targetAmount?: string;
        fromCurrency?: string;
        toCurrency?: string;
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

    // Map transfers involving this wallet
    for (const tr of transfers) {
      const isSender = tr.fromWalletId === walletId;
      const otherWalletId = isSender ? tr.toWalletId : tr.fromWalletId;
      const otherWalletName = walletNameMap.get(otherWalletId) || 'Another Wallet';

      if (isSender) {
        // Wallet that gives (sender) -> RED in history, direction 'out'
        const amountNum = parseFloat(tr.amount);
        totalSpent = Money.add(totalSpent, Money.from(tr.amount));

        transactionItems.push({
          id: tr.id,
          source: 'transfer',
          type: 'transfer_out',
          direction: 'out',
          title: `Transfer to ${otherWalletName}`,
          description: tr.notes || `Transferred to ${otherWalletName}`,
          amount: Math.abs(amountNum).toFixed(2),
          signedAmount: `-${Math.abs(amountNum).toFixed(2)}`,
          currency: tr.fromCurrency,
          date: tr.transferDate,
          notes: tr.notes || undefined,
          createdAt: tr.createdAt instanceof Date ? tr.createdAt.toISOString() : String(tr.createdAt),
          transferDetails: {
            role: 'sender',
            otherWalletId,
            otherWalletName,
            exchangeRate: tr.exchangeRate,
            targetAmount: tr.targetAmount,
            toCurrency: tr.toCurrency,
          },
        });
      } else {
        // Wallet that receives (receiver) -> BLUE in history, direction 'in'
        const targetNum = parseFloat(tr.targetAmount);
        totalAdded = Money.add(totalAdded, Money.from(tr.targetAmount));

        transactionItems.push({
          id: tr.id,
          source: 'transfer',
          type: 'transfer_in',
          direction: 'in',
          title: `Transfer from ${otherWalletName}`,
          description: tr.notes || `Received from ${otherWalletName}`,
          amount: Math.abs(targetNum).toFixed(2),
          signedAmount: `+${Math.abs(targetNum).toFixed(2)}`,
          currency: tr.toCurrency,
          date: tr.transferDate,
          notes: tr.notes || undefined,
          createdAt: tr.createdAt instanceof Date ? tr.createdAt.toISOString() : String(tr.createdAt),
          transferDetails: {
            role: 'receiver',
            otherWalletId,
            otherWalletName,
            exchangeRate: tr.exchangeRate,
            sourceAmount: tr.amount,
            fromCurrency: tr.fromCurrency,
          },
        });
      }
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
    } else if (filters?.type === 'transfer') {
      filteredTransactions = transactionItems.filter((t) => t.source === 'transfer');
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

