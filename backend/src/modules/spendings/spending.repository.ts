import { and, count, desc, eq, gte, ilike, inArray, lte, or } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { SpendingFilterInput } from './spending.schemas.js';
import { Money } from '../../utils/money.js';
import { currencyService } from '../currencies/currency.service.js';

export interface CalculatedSpendingItem {
  articleName: string;
  categoryId?: string | null;
  unitPrice: string;
  quantity: string;
  lineTotal: string;
  baseLineTotal: string;
}

export interface CalculatedSpendingHeader {
  date: string;
  paidFromWalletId?: string | null;
  store?: string | null;
  currency: string;
  exchangeRateToBase: string;
  totalAmount: string;
  baseTotalAmount: string;
  notes?: string | null;
}

export class SpendingRepository {
  async create(
    userId: string,
    header: CalculatedSpendingHeader,
    items: CalculatedSpendingItem[]
  ) {
    return await db.transaction(async (tx) => {
      // 1. Insert spending header
      const [spending] = await tx
        .insert(schema.spendings)
        .values({
          userId,
          date: header.date,
          paidFromWalletId: header.paidFromWalletId,
          store: header.store,
          currency: header.currency,
          exchangeRateToBase: header.exchangeRateToBase,
          totalAmount: header.totalAmount,
          baseTotalAmount: header.baseTotalAmount,
          notes: header.notes,
        })
        .returning();

      // 2. Insert line items
      const insertedItems = await tx
        .insert(schema.spendingItems)
        .values(
          items.map((item) => ({
            spendingId: spending.id,
            categoryId: item.categoryId,
            articleName: item.articleName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            baseLineTotal: item.baseLineTotal,
          }))
        )
        .returning();

      // 3. Atomically decrement wallet balance if paidFromWalletId is specified (with currency conversion)
      if (header.paidFromWalletId) {
        const [wallet] = await tx
          .select({
            currentBalance: schema.wallets.currentBalance,
            defaultCurrency: schema.wallets.defaultCurrency,
          })
          .from(schema.wallets)
          .where(and(eq(schema.wallets.id, header.paidFromWalletId), eq(schema.wallets.userId, userId)));

        if (wallet) {
          let deductionAmount = header.totalAmount;
          if (wallet.defaultCurrency !== header.currency) {
            const rate = await currencyService.getRateForDate(header.currency, wallet.defaultCurrency, header.date);
            deductionAmount = Money.toDbString(Money.convert(header.totalAmount, rate));
          }
          const newBalance = Money.subtract(wallet.currentBalance, deductionAmount);
          await tx
            .update(schema.wallets)
            .set({
              currentBalance: Money.toDbString(newBalance),
              updatedAt: new Date(),
            })
            .where(eq(schema.wallets.id, header.paidFromWalletId));
        }
      }

      return { ...spending, items: insertedItems };
    });
  }

  async update(
    id: string,
    userId: string,
    header: CalculatedSpendingHeader,
    items: CalculatedSpendingItem[]
  ) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(schema.spendings)
        .where(
          and(
            eq(schema.spendings.id, id),
            eq(schema.spendings.userId, userId),
            eq(schema.spendings.isDeleted, false)
          )
        );

      if (!existing) return false;

      // 1. Revert old wallet balance deduction if previously paid from a wallet
      if (existing.paidFromWalletId) {
        const [oldWallet] = await tx
          .select({
            currentBalance: schema.wallets.currentBalance,
            defaultCurrency: schema.wallets.defaultCurrency,
          })
          .from(schema.wallets)
          .where(eq(schema.wallets.id, existing.paidFromWalletId));

        if (oldWallet) {
          let restoreAmount = existing.totalAmount;
          if (oldWallet.defaultCurrency !== existing.currency) {
            const rate = await currencyService.getRateForDate(existing.currency, oldWallet.defaultCurrency, existing.date);
            restoreAmount = Money.toDbString(Money.convert(existing.totalAmount, rate));
          }
          const restoredBalance = Money.add(oldWallet.currentBalance, restoreAmount);
          await tx
            .update(schema.wallets)
            .set({
              currentBalance: Money.toDbString(restoredBalance),
              updatedAt: new Date(),
            })
            .where(eq(schema.wallets.id, existing.paidFromWalletId));
        }
      }

      // 2. Apply new wallet balance deduction if now paid from a wallet
      if (header.paidFromWalletId) {
        const [newWallet] = await tx
          .select({
            currentBalance: schema.wallets.currentBalance,
            defaultCurrency: schema.wallets.defaultCurrency,
          })
          .from(schema.wallets)
          .where(eq(schema.wallets.id, header.paidFromWalletId));

        if (newWallet) {
          let deductionAmount = header.totalAmount;
          if (newWallet.defaultCurrency !== header.currency) {
            const rate = await currencyService.getRateForDate(header.currency, newWallet.defaultCurrency, header.date);
            deductionAmount = Money.toDbString(Money.convert(header.totalAmount, rate));
          }
          const newBalance = Money.subtract(newWallet.currentBalance, deductionAmount);
          await tx
            .update(schema.wallets)
            .set({
              currentBalance: Money.toDbString(newBalance),
              updatedAt: new Date(),
            })
            .where(eq(schema.wallets.id, header.paidFromWalletId));
        }
      }

      // 3. Update spending header
      await tx
        .update(schema.spendings)
        .set({
          date: header.date,
          paidFromWalletId: header.paidFromWalletId,
          store: header.store,
          currency: header.currency,
          exchangeRateToBase: header.exchangeRateToBase,
          totalAmount: header.totalAmount,
          baseTotalAmount: header.baseTotalAmount,
          notes: header.notes,
          updatedAt: new Date(),
        })
        .where(eq(schema.spendings.id, id));

      // 4. Delete old line items
      await tx
        .delete(schema.spendingItems)
        .where(eq(schema.spendingItems.spendingId, id));

      // 5. Insert new line items
      await tx
        .insert(schema.spendingItems)
        .values(
          items.map((item) => ({
            spendingId: id,
            categoryId: item.categoryId,
            articleName: item.articleName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            baseLineTotal: item.baseLineTotal,
          }))
        );

      return true;
    });
  }

  async findById(id: string, userId: string) {
    const [spending] = await db
      .select({
        id: schema.spendings.id,
        date: schema.spendings.date,
        paidFromWalletId: schema.spendings.paidFromWalletId,
        store: schema.spendings.store,
        currency: schema.spendings.currency,
        exchangeRateToBase: schema.spendings.exchangeRateToBase,
        totalAmount: schema.spendings.totalAmount,
        baseTotalAmount: schema.spendings.baseTotalAmount,
        notes: schema.spendings.notes,
        createdAt: schema.spendings.createdAt,
        wallet: {
          id: schema.wallets.id,
          name: schema.wallets.name,
          color: schema.wallets.color,
          icon: schema.wallets.icon,
        },
      })
      .from(schema.spendings)
      .leftJoin(schema.wallets, eq(schema.spendings.paidFromWalletId, schema.wallets.id))
      .where(
        and(
          eq(schema.spendings.id, id),
          eq(schema.spendings.userId, userId),
          eq(schema.spendings.isDeleted, false)
        )
      );

    if (!spending) return null;

    const items = await db
      .select({
        id: schema.spendingItems.id,
        articleName: schema.spendingItems.articleName,
        categoryId: schema.spendingItems.categoryId,
        unitPrice: schema.spendingItems.unitPrice,
        quantity: schema.spendingItems.quantity,
        lineTotal: schema.spendingItems.lineTotal,
        baseLineTotal: schema.spendingItems.baseLineTotal,
        category: {
          id: schema.spendingCategories.id,
          name: schema.spendingCategories.name,
          color: schema.spendingCategories.color,
        },
      })
      .from(schema.spendingItems)
      .leftJoin(schema.spendingCategories, eq(schema.spendingItems.categoryId, schema.spendingCategories.id))
      .where(eq(schema.spendingItems.spendingId, id));

    const mappedItems = items.map((i) => ({
      ...i,
      name: i.articleName,
      categoryName: i.category?.name,
    }));

    return {
      ...spending,
      storeMerchant: spending.store,
      walletName: spending.wallet?.name,
      totalAmountInBase: spending.baseTotalAmount,
      items: mappedItems,
    };
  }

  async listByUser(userId: string, filters: SpendingFilterInput) {
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    const whereConditions = and(
      eq(schema.spendings.userId, userId),
      eq(schema.spendings.isDeleted, false),
      filters.from ? gte(schema.spendings.date, filters.from) : undefined,
      filters.to ? lte(schema.spendings.date, filters.to) : undefined,
      filters.walletId ? eq(schema.spendings.paidFromWalletId, filters.walletId) : undefined,
      filters.currency ? eq(schema.spendings.currency, filters.currency) : undefined,
      filters.categoryId
        ? inArray(
            schema.spendings.id,
            db
              .select({ spendingId: schema.spendingItems.spendingId })
              .from(schema.spendingItems)
              .where(eq(schema.spendingItems.categoryId, filters.categoryId))
          )
        : undefined,
      filters.store ? ilike(schema.spendings.store, `%${filters.store}%`) : undefined,
      filters.search
        ? or(
            ilike(schema.spendings.store, `%${filters.search}%`),
            ilike(schema.spendings.notes, `%${filters.search}%`)
          )
        : undefined
    );

    const [totalRecord] = await db
      .select({ count: count() })
      .from(schema.spendings)
      .where(whereConditions);

    const total = totalRecord?.count || 0;

    const rows = await db
      .select({
        id: schema.spendings.id,
        date: schema.spendings.date,
        paidFromWalletId: schema.spendings.paidFromWalletId,
        store: schema.spendings.store,
        currency: schema.spendings.currency,
        exchangeRateToBase: schema.spendings.exchangeRateToBase,
        totalAmount: schema.spendings.totalAmount,
        baseTotalAmount: schema.spendings.baseTotalAmount,
        notes: schema.spendings.notes,
        createdAt: schema.spendings.createdAt,
        wallet: {
          id: schema.wallets.id,
          name: schema.wallets.name,
          color: schema.wallets.color,
          icon: schema.wallets.icon,
        },
      })
      .from(schema.spendings)
      .leftJoin(schema.wallets, eq(schema.spendings.paidFromWalletId, schema.wallets.id))
      .where(whereConditions)
      .orderBy(desc(schema.spendings.date), desc(schema.spendings.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch items for each row
    const spendingIds = rows.map((r) => r.id);
    let allItems: any[] = [];
    if (spendingIds.length > 0) {
      allItems = await db
        .select({
          id: schema.spendingItems.id,
          spendingId: schema.spendingItems.spendingId,
          articleName: schema.spendingItems.articleName,
          categoryId: schema.spendingItems.categoryId,
          unitPrice: schema.spendingItems.unitPrice,
          quantity: schema.spendingItems.quantity,
          lineTotal: schema.spendingItems.lineTotal,
          baseLineTotal: schema.spendingItems.baseLineTotal,
          category: {
            id: schema.spendingCategories.id,
            name: schema.spendingCategories.name,
            color: schema.spendingCategories.color,
          },
        })
        .from(schema.spendingItems)
        .leftJoin(schema.spendingCategories, eq(schema.spendingItems.categoryId, schema.spendingCategories.id))
        .where(
          inArray(schema.spendingItems.spendingId, spendingIds)
        );
    }

    const rowsWithItems = rows.map((r) => {
      const spItems = allItems
        .filter((i) => i.spendingId === r.id)
        .map((i) => ({
          ...i,
          name: i.articleName,
          categoryName: i.category?.name,
        }));
      return {
        ...r,
        storeMerchant: r.store,
        walletName: r.wallet?.name,
        totalAmountInBase: r.baseTotalAmount,
        items: spItems,
      };
    });

    return {
      rows: rowsWithItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const [spending] = await tx
        .select()
        .from(schema.spendings)
        .where(
          and(
            eq(schema.spendings.id, id),
            eq(schema.spendings.userId, userId),
            eq(schema.spendings.isDeleted, false)
          )
        );

      if (!spending) return false;

      // 1. Mark spending as deleted
      await tx
        .update(schema.spendings)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(schema.spendings.id, id));

      // 2. Restore balance on wallet if it was paid from a wallet (with currency conversion)
      if (spending.paidFromWalletId) {
        const [wallet] = await tx
          .select({
            currentBalance: schema.wallets.currentBalance,
            defaultCurrency: schema.wallets.defaultCurrency,
          })
          .from(schema.wallets)
          .where(eq(schema.wallets.id, spending.paidFromWalletId));

        if (wallet) {
          let restoreAmount = spending.totalAmount;
          if (wallet.defaultCurrency !== spending.currency) {
            const rate = await currencyService.getRateForDate(spending.currency, wallet.defaultCurrency, spending.date);
            restoreAmount = Money.toDbString(Money.convert(spending.totalAmount, rate));
          }
          const restoredBalance = Money.add(wallet.currentBalance, restoreAmount);
          await tx
            .update(schema.wallets)
            .set({
              currentBalance: Money.toDbString(restoredBalance),
              updatedAt: new Date(),
            })
            .where(eq(schema.wallets.id, spending.paidFromWalletId));
        }
      }

      return true;
    });
  }
}

export const spendingRepository = new SpendingRepository();
