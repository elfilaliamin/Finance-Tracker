import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { Money } from '../../utils/money.js';
import { currencyService } from '../currencies/currency.service.js';

export class DashboardService {
  async getMetrics(userId: string, walletFilterId?: string) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentMonthPrefix = `${currentYear}-${currentMonth}`;

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = (prevMonthDate.getMonth() + 1).toString().padStart(2, '0');
    const prevMonthPrefix = `${prevYear}-${prevMonth}`;

    // 1. Today's Net Worth (Asset wallets - Liability wallets)
    // Filtered by walletFilterId if provided
    const walletsQuery = db
      .select({
        id: schema.wallets.id,
        type: schema.wallets.type,
        currentBalance: schema.wallets.currentBalance,
        defaultCurrency: schema.wallets.defaultCurrency,
      })
      .from(schema.wallets)
      .where(
        and(
          eq(schema.wallets.userId, userId),
          eq(schema.wallets.status, 'active'),
          walletFilterId ? eq(schema.wallets.id, walletFilterId) : undefined
        )
      );

    const activeWallets = await walletsQuery;

    let totalAssets = Money.from(0);
    let totalLiabilities = Money.from(0);

    for (const w of activeWallets) {
      const balance = Money.from(w.currentBalance);
      if (w.type === 'asset') {
        totalAssets = Money.add(totalAssets, balance);
      } else {
        totalLiabilities = Money.add(totalLiabilities, balance);
      }
    }

    const todayNetWorth = Money.subtract(totalAssets, totalLiabilities);

    // 2. Income Metrics (STRICT INVARIANT: NEVER FILTERED BY WALLET!)
    const allIncomes = await db
      .select({
        id: schema.incomes.id,
        date: schema.incomes.date,
        baseAmount: schema.incomes.baseAmount,
        sourceId: schema.incomes.sourceId,
        sourceTitle: schema.incomeSources.title,
        amount: schema.incomes.amount,
        currency: schema.incomes.currency,
      })
      .from(schema.incomes)
      .leftJoin(schema.incomeSources, eq(schema.incomes.sourceId, schema.incomeSources.id))
      .where(and(eq(schema.incomes.userId, userId), eq(schema.incomes.isDeleted, false)))
      .orderBy(desc(schema.incomes.date));

    let currentMonthIncome = Money.from(0);
    let prevMonthIncome = Money.from(0);
    let yearIncome = Money.from(0);
    let lifetimeIncome = Money.from(0);

    const monthlyTotals = new Map<string, typeof currentMonthIncome>();
    const sourceTotals = new Map<string, { title: string; total: typeof currentMonthIncome }>();

    for (const inc of allIncomes) {
      let amt = Money.from(inc.baseAmount);

      // Auto-heal legacy 1:1 fallback records where non-MAD income was saved with baseAmount == amount
      if (inc.currency && inc.currency !== 'MAD' && inc.baseAmount === inc.amount) {
        try {
          const rate = await currencyService.getRateForDate(inc.currency, 'MAD', inc.date);
          const converted = Money.convert(inc.amount, rate);
          amt = converted;
          inc.baseAmount = Money.toDbString(converted);
          await db
            .update(schema.incomes)
            .set({ exchangeRateToBase: rate, baseAmount: inc.baseAmount })
            .where(eq(schema.incomes.id, inc.id));
        } catch {
          // keep original amt if fallback fails
        }
      }

      lifetimeIncome = Money.add(lifetimeIncome, amt);

      const y = inc.date.substring(0, 4);
      const ym = inc.date.substring(0, 7);

      if (y === currentYear.toString()) {
        yearIncome = Money.add(yearIncome, amt);
      }
      if (ym === currentMonthPrefix) {
        currentMonthIncome = Money.add(currentMonthIncome, amt);
      }
      if (ym === prevMonthPrefix) {
        prevMonthIncome = Money.add(prevMonthIncome, amt);
      }

      // Group by month
      const currentMonthSum = monthlyTotals.get(ym) || Money.from(0);
      monthlyTotals.set(ym, Money.add(currentMonthSum, amt));

      // Group by source
      if (inc.sourceId && inc.sourceTitle) {
        const existingSource = sourceTotals.get(inc.sourceId) || { title: inc.sourceTitle, total: Money.from(0) };
        existingSource.total = Money.add(existingSource.total, amt);
        sourceTotals.set(inc.sourceId, existingSource);
      }
    }

    // Average monthly income
    const activeMonthsCount = Math.max(1, monthlyTotals.size);
    const averageMonthlyIncome = Money.divide(lifetimeIncome, activeMonthsCount);

    // Highest and lowest months
    let highestMonth = { month: 'N/A', amount: '0.00' };
    let lowestMonth = { month: 'N/A', amount: '0.00' };

    let highestVal = Money.from(-1);
    let lowestVal = Money.from(Number.MAX_SAFE_INTEGER);

    for (const [m, total] of monthlyTotals.entries()) {
      if (total.gt(highestVal)) {
        highestVal = total;
        highestMonth = { month: m, amount: Money.toDbString(total) };
      }
      if (total.lt(lowestVal) && total.gt(0)) {
        lowestVal = total;
        lowestMonth = { month: m, amount: Money.toDbString(total) };
      }
    }

    // Largest income source
    let largestSource = { title: 'N/A', amount: '0.00' };
    let maxSourceVal = Money.from(0);
    for (const s of sourceTotals.values()) {
      if (s.total.gt(maxSourceVal)) {
        maxSourceVal = s.total;
        largestSource = { title: s.title, amount: Money.toDbString(s.total) };
      }
    }

    // Active income sources count
    const [activeSourcesCountRecord] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.incomeSources)
      .where(and(eq(schema.incomeSources.userId, userId), eq(schema.incomeSources.status, 'active'), eq(schema.incomeSources.isDeleted, false)));

    // Latest income entry
    const latestIncome = allIncomes.length > 0 ? {
      date: allIncomes[0].date,
      amount: allIncomes[0].amount,
      currency: allIncomes[0].currency,
      baseAmount: allIncomes[0].baseAmount,
      sourceTitle: allIncomes[0].sourceTitle || 'Unknown',
    } : null;

    const netWorthFormatted = Money.toDbString(todayNetWorth);
    return {
      todayNetWorth: netWorthFormatted,
      todaysNetWorth: netWorthFormatted,
      totalAssets: Money.toDbString(totalAssets),
      totalLiabilities: Money.toDbString(totalLiabilities),
      currentMonthIncome: Money.toDbString(currentMonthIncome),
      previousMonthIncome: Money.toDbString(prevMonthIncome),
      priorMonthIncome: Money.toDbString(prevMonthIncome),
      yearIncome: Money.toDbString(yearIncome),
      lifetimeIncome: Money.toDbString(lifetimeIncome),
      averageMonthlyIncome: Money.toDbString(averageMonthlyIncome),
      avgMonthlyIncome: Money.toDbString(averageMonthlyIncome),
      highestIncomeMonth: highestMonth,
      lowestIncomeMonth: lowestVal.lt(Number.MAX_SAFE_INTEGER) ? lowestMonth : { month: 'N/A', amount: '0.00' },
      largestIncomeSource: {
        title: largestSource.title,
        name: largestSource.title,
        amount: largestSource.amount,
      },
      activeIncomeSourcesCount: activeSourcesCountRecord?.count || 0,
      latestIncome: latestIncome ? {
        ...latestIncome,
        source: latestIncome.sourceTitle,
      } : null,
      latestNetWorth: {
        date: new Date().toISOString().substring(0, 10),
        amount: netWorthFormatted,
      },
    };
  }

  async getIncomeTrend(userId: string, year: number = new Date().getFullYear()) {
    const records = await db
      .select({
        date: schema.incomes.date,
        baseAmount: schema.incomes.baseAmount,
      })
      .from(schema.incomes)
      .where(
        and(
          eq(schema.incomes.userId, userId),
          eq(schema.incomes.isDeleted, false),
          gte(schema.incomes.date, `${year}-01-01`),
          lte(schema.incomes.date, `${year}-12-31`)
        )
      );

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySum = new Array(12).fill(0);

    for (const r of records) {
      const monthIndex = parseInt(r.date.substring(5, 7), 10) - 1;
      monthlySum[monthIndex] += parseFloat(r.baseAmount);
    }

    return months.map((m, idx) => {
      const incomeStr = Money.toDbString(monthlySum[idx]);
      return {
        month: m,
        monthIndex: idx + 1,
        income: incomeStr,
        amount: parseFloat(incomeStr),
      };
    });
  }

  async getSpendingMatrix(userId: string, year: number = new Date().getFullYear(), walletFilterId?: string) {
    // 1. Get all active spending categories for user
    const categories = await db
      .select()
      .from(schema.spendingCategories)
      .where(and(eq(schema.spendingCategories.userId, userId), eq(schema.spendingCategories.isDeleted, false)))
      .orderBy(schema.spendingCategories.name);

    // 2. Query spending items within the year, filtered by wallet if specified
    const items = await db
      .select({
        date: schema.spendings.date,
        categoryId: schema.spendingItems.categoryId,
        baseLineTotal: schema.spendingItems.baseLineTotal,
      })
      .from(schema.spendingItems)
      .innerJoin(schema.spendings, eq(schema.spendingItems.spendingId, schema.spendings.id))
      .where(
        and(
          eq(schema.spendings.userId, userId),
          eq(schema.spendings.isDeleted, false),
          gte(schema.spendings.date, `${year}-01-01`),
          lte(schema.spendings.date, `${year}-12-31`),
          walletFilterId ? eq(schema.spendings.paidFromWalletId, walletFilterId) : undefined
        )
      );

    // Matrix grid: rows = categories + 'Uncategorized', cols = 12 months
    const monthColumns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const columnTotals = new Array(12).fill(Money.from(0));
    let grandTotal = Money.from(0);

    const categoryMap = new Map<string, { id: string; name: string; color: string; months: any[]; rowTotal: any }>();

    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        months: new Array(12).fill('0.00'),
        rowTotal: Money.from(0),
      });
    }

    // Add uncategorized row
    categoryMap.set('uncategorized', {
      id: 'uncategorized',
      name: 'Uncategorized',
      color: '#94a3b8',
      months: new Array(12).fill('0.00'),
      rowTotal: Money.from(0),
    });

    for (const item of items) {
      const monthIdx = parseInt(item.date.substring(5, 7), 10) - 1;
      const amount = Money.from(item.baseLineTotal);
      const catKey = item.categoryId && categoryMap.has(item.categoryId) ? item.categoryId : 'uncategorized';
      const row = categoryMap.get(catKey)!;

      const currentCell = Money.from(row.months[monthIdx]);
      const newCell = Money.add(currentCell, amount);
      row.months[monthIdx] = Money.toDbString(newCell);
      row.rowTotal = Money.add(row.rowTotal, amount);

      columnTotals[monthIdx] = Money.add(columnTotals[monthIdx], amount);
      grandTotal = Money.add(grandTotal, amount);
    }

    const rows = Array.from(categoryMap.values()).map((r) => ({
      ...r,
      rowTotal: Money.toDbString(r.rowTotal),
    }));

    const categoriesFormatted = rows.map((r) => {
      const monthlyAmounts: Record<string, string> = {};
      r.months.forEach((amt: string, idx: number) => {
        const monthKey = String(idx + 1).padStart(2, '0');
        monthlyAmounts[monthKey] = amt;
      });
      return {
        id: r.id,
        name: r.name,
        color: r.color,
        monthlyAmounts,
        total: r.rowTotal,
        months: r.months,
      };
    });

    const monthlyTotals: Record<string, string> = {};
    columnTotals.forEach((c: any, idx: number) => {
      const monthKey = String(idx + 1).padStart(2, '0');
      monthlyTotals[monthKey] = Money.toDbString(c);
    });

    return {
      year,
      monthColumns,
      rows,
      categories: categoriesFormatted,
      monthlyTotals,
      columnTotals: columnTotals.map((c) => Money.toDbString(c)),
      grandTotal: Money.toDbString(grandTotal),
    };
  }

  async getNetWorthHistory(userId: string) {
    const wallets = await db
      .select({
        id: schema.wallets.id,
        name: schema.wallets.name,
        type: schema.wallets.type,
        currentBalance: schema.wallets.currentBalance,
        color: schema.wallets.color,
      })
      .from(schema.wallets)
      .where(and(eq(schema.wallets.userId, userId), eq(schema.wallets.status, 'active')));

    let total = Money.from(0);
    for (const w of wallets) {
      if (w.type === 'asset') {
        total = Money.add(total, Money.from(w.currentBalance));
      } else {
        total = Money.subtract(total, Money.from(w.currentBalance));
      }
    }

    const todayDate = new Date().toISOString().substring(0, 10);
    return [
      {
        date: todayDate,
        amount: parseFloat(Money.toDbString(total)),
      },
    ];
  }
}

export const dashboardService = new DashboardService();

