import { eq } from 'drizzle-orm';
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
      spendingItems = await db.select().from(schema.spendingItems);
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
      spendingItems: spendingItems.filter((item) => spendingIds.includes(item.spendingId)),
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

