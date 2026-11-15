import { eq, inArray } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { ValidationError } from '../../errors/AppError.js';

export interface WorkspaceBackupPackage {
  version: '1.0.0';
  exportedAt: string;
  wallets: Array<typeof schema.wallets.$inferSelect>;
  walletAdjustments: Array<typeof schema.walletAdjustments.$inferSelect>;
  incomeSources: Array<typeof schema.incomeSources.$inferSelect>;
  incomeCategories: Array<typeof schema.incomeCategories.$inferSelect>;
  spendingCategories: Array<typeof schema.spendingCategories.$inferSelect>;
  incomes: Array<typeof schema.incomes.$inferSelect>;
  spendings: Array<typeof schema.spendings.$inferSelect>;
  spendingItems: Array<typeof schema.spendingItems.$inferSelect>;
  budgets: Array<typeof schema.budgets.$inferSelect>;
  settings?: typeof schema.userSettings.$inferSelect | null;
}

export class DangerZoneService {
  async exportWorkspace(userId: string): Promise<WorkspaceBackupPackage> {
    const wallets = await db.select().from(schema.wallets).where(eq(schema.wallets.userId, userId));
    const walletAdjustments = await db.select().from(schema.walletAdjustments).where(eq(schema.walletAdjustments.userId, userId));
    const incomeSources = await db.select().from(schema.incomeSources).where(eq(schema.incomeSources.userId, userId));
    const incomeCategories = await db.select().from(schema.incomeCategories).where(eq(schema.incomeCategories.userId, userId));
    const spendingCategories = await db.select().from(schema.spendingCategories).where(eq(schema.spendingCategories.userId, userId));
    const incomes = await db.select().from(schema.incomes).where(eq(schema.incomes.userId, userId));
    const spendings = await db.select().from(schema.spendings).where(eq(schema.spendings.userId, userId));
    const spendingIds = spendings.map((s) => s.id);

    let spendingItems: Array<typeof schema.spendingItems.$inferSelect> = [];
    if (spendingIds.length > 0) {
      spendingItems = await db
        .select()
        .from(schema.spendingItems)
        .where(inArray(schema.spendingItems.spendingId, spendingIds));
    }

    const budgets = await db.select().from(schema.budgets).where(eq(schema.budgets.userId, userId));
    const [settings] = await db.select().from(schema.userSettings).where(eq(schema.userSettings.userId, userId));

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      wallets,
      walletAdjustments,
      incomeSources,
      incomeCategories,
      spendingCategories,
      incomes,
      spendings,
      spendingItems,
      budgets,
      settings,
    };
  }

  async dryRunImport(userId: string, pkg: any) {
    if (!pkg || pkg.version !== '1.0.0') {
      throw new ValidationError('Invalid or unsupported backup file schema version');
    }

    return {
      isValid: true,
      version: pkg.version,
      exportedAt: pkg.exportedAt,
      summary: {
        walletsCount: Array.isArray(pkg.wallets) ? pkg.wallets.length : 0,
        adjustmentsCount: Array.isArray(pkg.walletAdjustments) ? pkg.walletAdjustments.length : 0,
        incomesCount: Array.isArray(pkg.incomes) ? pkg.incomes.length : 0,
        spendingsCount: Array.isArray(pkg.spendings) ? pkg.spendings.length : 0,
        budgetsCount: Array.isArray(pkg.budgets) ? pkg.budgets.length : 0,
      },
    };
  }

  async executeImport(userId: string, pkg: any) {
    if (!pkg || pkg.version !== '1.0.0') {
      throw new ValidationError('Invalid or unsupported backup file schema version');
    }

    return await db.transaction(async (tx) => {
      // 1. Wallets mapping (oldId -> newId)
      const walletIdMap = new Map<string, string>();
      if (Array.isArray(pkg.wallets)) {
        for (const w of pkg.wallets) {
          const [inserted] = await tx
            .insert(schema.wallets)
            .values({
              userId,
              name: w.name,
              description: w.description,
              color: w.color || '#3b82f6',
              icon: w.icon,
              type: w.type || 'asset',
              currentBalance: w.currentBalance || '0.00',
              defaultCurrency: w.defaultCurrency || 'MAD',
              status: w.status || 'active',
              sortOrder: w.sortOrder || 0,
            })
            .returning();
          walletIdMap.set(w.id, inserted.id);
        }
      }

      // 2. Income sources mapping
      const sourceIdMap = new Map<string, string>();
      if (Array.isArray(pkg.incomeSources)) {
        for (const s of pkg.incomeSources) {
          const [inserted] = await tx
            .insert(schema.incomeSources)
            .values({
              userId,
              title: s.title,
              description: s.description,
              color: s.color || '#10b981',
              status: s.status || 'active',
              isDeleted: s.isDeleted || false,
            })
            .returning();
          sourceIdMap.set(s.id, inserted.id);
        }
      }

      // 3. Income categories mapping
      const incomeCatIdMap = new Map<string, string>();
      if (Array.isArray(pkg.incomeCategories)) {
        for (const ic of pkg.incomeCategories) {
          const [inserted] = await tx
            .insert(schema.incomeCategories)
            .values({
              userId,
              name: ic.name,
              color: ic.color || '#06b6d4',
              icon: ic.icon,
              isDeleted: ic.isDeleted || false,
            })
            .returning();
          incomeCatIdMap.set(ic.id, inserted.id);
        }
      }

      // 4. Spending categories mapping
      const spendingCatIdMap = new Map<string, string>();
      if (Array.isArray(pkg.spendingCategories)) {
        for (const sc of pkg.spendingCategories) {
          const [inserted] = await tx
            .insert(schema.spendingCategories)
            .values({
              userId,
              name: sc.name,
              color: sc.color || '#f43f5e',
              icon: sc.icon,
              isDeleted: sc.isDeleted || false,
            })
            .returning();
          spendingCatIdMap.set(sc.id, inserted.id);
        }
      }

      // 5. Incomes
      let incomesRestored = 0;
      if (Array.isArray(pkg.incomes)) {
        for (const inc of pkg.incomes) {
          const newSourceId = sourceIdMap.get(inc.sourceId);
          const newCatId = incomeCatIdMap.get(inc.categoryId);
          if (newSourceId && newCatId) {
            await tx.insert(schema.incomes).values({
              userId,
              date: inc.date,
              sourceId: newSourceId,
              categoryId: newCatId,
              amount: inc.amount,
              currency: inc.currency,
              exchangeRateToBase: inc.exchangeRateToBase,
              baseAmount: inc.baseAmount,
              description: inc.description || 'Restored Income',
              notes: inc.notes,
              isDeleted: inc.isDeleted || false,
            });
            incomesRestored++;
          }
        }
      }

      // 6. Spendings & Spending Items
      let spendingsRestored = 0;
      if (Array.isArray(pkg.spendings)) {
        const spendingItems = Array.isArray(pkg.spendingItems) ? pkg.spendingItems : [];
        for (const sp of pkg.spendings) {
          const newWalletId = sp.paidFromWalletId ? walletIdMap.get(sp.paidFromWalletId) : null;
          const [newSpending] = await tx
            .insert(schema.spendings)
            .values({
              userId,
              date: sp.date,
              paidFromWalletId: newWalletId,
              store: sp.store,
              currency: sp.currency,
              exchangeRateToBase: sp.exchangeRateToBase,
              totalAmount: sp.totalAmount,
              baseTotalAmount: sp.baseTotalAmount,
              notes: sp.notes,
              isDeleted: sp.isDeleted || false,
            })
            .returning();

          spendingsRestored++;

          const itemsForSpending = spendingItems.filter((item: any) => item.spendingId === sp.id);
          for (const item of itemsForSpending) {
            const newCatId = item.categoryId ? spendingCatIdMap.get(item.categoryId) || null : null;
            await tx.insert(schema.spendingItems).values({
              spendingId: newSpending.id,
              categoryId: newCatId,
              articleName: item.articleName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
              baseLineTotal: item.baseLineTotal,
            });
          }
        }
      }

      // 7. Wallet Adjustments
      let adjustmentsRestored = 0;
      if (Array.isArray(pkg.walletAdjustments)) {
        for (const adj of pkg.walletAdjustments) {
          const newWalletId = walletIdMap.get(adj.walletId);
          if (newWalletId) {
            await tx.insert(schema.walletAdjustments).values({
              walletId: newWalletId,
              userId,
              adjustmentDate: adj.adjustmentDate,
              adjustmentType: adj.adjustmentType || 'delta',
              amount: adj.amount,
              resultingBalance: adj.resultingBalance,
              currency: adj.currency,
              exchangeRateToBase: adj.exchangeRateToBase,
              baseAmount: adj.baseAmount,
              notes: adj.notes,
            });
            adjustmentsRestored++;
          }
        }
      }

      // 8. Budgets
      let budgetsRestored = 0;
      if (Array.isArray(pkg.budgets)) {
        for (const b of pkg.budgets) {
          const newWalletId = b.walletId ? walletIdMap.get(b.walletId) || null : null;
          const newCatId = b.categoryId ? spendingCatIdMap.get(b.categoryId) || null : null;
          await tx.insert(schema.budgets).values({
            userId,
            name: b.name,
            type: b.type,
            walletId: newWalletId,
            categoryId: newCatId,
            period: b.period,
            startDate: b.startDate,
            endDate: b.endDate,
            targetAmount: b.targetAmount,
            currency: b.currency,
            isActive: b.isActive ?? true,
            isDeleted: b.isDeleted || false,
          });
          budgetsRestored++;
        }
      }

      return {
        success: true,
        summary: {
          walletsRestored: walletIdMap.size,
          adjustmentsRestored,
          incomesRestored,
          spendingsRestored,
          budgetsRestored,
        },
      };
    });
  }

  async scopedPurge(userId: string, module: 'spending' | 'income' | 'all', typedConfirmation: string) {
    if (typedConfirmation !== 'PERMANENTLY DELETE') {
      throw new ValidationError("Confirmation mismatch: You must type 'PERMANENTLY DELETE' to confirm.");
    }

    return await db.transaction(async (tx) => {
      let deletedCount = 0;

      if (module === 'income' || module === 'all') {
        const deletedIncomes = await tx.delete(schema.incomes).where(eq(schema.incomes.userId, userId)).returning();
        deletedCount += deletedIncomes.length;
      }

      if (module === 'spending' || module === 'all') {
        const deletedSpendings = await tx.delete(schema.spendings).where(eq(schema.spendings.userId, userId)).returning();
        deletedCount += deletedSpendings.length;
      }

      if (module === 'all') {
        await tx.delete(schema.walletAdjustments).where(eq(schema.walletAdjustments.userId, userId));
        await tx.delete(schema.budgets).where(eq(schema.budgets.userId, userId));
        await tx.delete(schema.wallets).where(eq(schema.wallets.userId, userId));
        await tx.delete(schema.incomeSources).where(eq(schema.incomeSources.userId, userId));
        await tx.delete(schema.incomeCategories).where(eq(schema.incomeCategories.userId, userId));
        await tx.delete(schema.spendingCategories).where(eq(schema.spendingCategories.userId, userId));
      }

      return { deletedCount, module };
    });
  }
}

export const dangerZoneService = new DangerZoneService();

