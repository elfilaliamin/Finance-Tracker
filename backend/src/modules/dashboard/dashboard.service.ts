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

    const [userSetting] = await db
      .select({ displayCurrency: schema.userSettings.displayCurrency })
      .from(schema.userSettings)
      .where(eq(schema.userSettings.userId, userId));
    const baseCurrency = userSetting?.displayCurrency || 'MAD';
    const todayStr = now.toISOString().split('T')[0];

    let totalAssets = Money.from(0);
    let totalLiabilities = Money.from(0);

    for (const w of activeWallets) {
      let balance = Money.from(w.currentBalance);
      if (w.defaultCurrency && w.defaultCurrency !== baseCurrency) {
        try {
          const rate = await currencyService.getRateForDate(w.defaultCurrency, baseCurrency, todayStr);
          balance = Money.convert(balance, rate);
        } catch {}
      }
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

  async getNetWorthHistory(
    userId: string,
    walletFilterId?: string,
    options?: { from?: string; to?: string; period?: string; year?: number }
  ) {
    const isAll = !walletFilterId || walletFilterId === 'all';

    // 1. Fetch active wallets (filtered if single wallet selected)
    const wallets = await db
      .select({
        id: schema.wallets.id,
        name: schema.wallets.name,
        type: schema.wallets.type,
        currentBalance: schema.wallets.currentBalance,
        defaultCurrency: schema.wallets.defaultCurrency,
        createdAt: schema.wallets.createdAt,
      })
      .from(schema.wallets)
      .where(
        and(
          eq(schema.wallets.userId, userId),
          eq(schema.wallets.status, 'active'),
          !isAll ? eq(schema.wallets.id, walletFilterId) : undefined
        )
      );

    const [userSetting] = await db
      .select({ displayCurrency: schema.userSettings.displayCurrency })
      .from(schema.userSettings)
      .where(eq(schema.userSettings.userId, userId));
    const baseCurrency = userSetting?.displayCurrency || 'MAD';

    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    const currentYear = now.getFullYear();

    // 2. Determine start and end dates based on period / year / options
    let startDate: string;
    let endDate: string = options?.to || todayStr;

    if (options?.period === 'this_month') {
      const ym = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      startDate = `${ym}-01`;
      endDate = todayStr;
    } else if (options?.period === 'last_month') {
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const ym = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const lastDay = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0).getDate();
      startDate = `${ym}-01`;
      endDate = `${ym}-${lastDay.toString().padStart(2, '0')}`;
    } else if (options?.period === 'this_year' || options?.year === currentYear) {
      startDate = `${currentYear}-01-01`;
      endDate = todayStr;
    } else if (options?.period === 'last_year' || options?.year === currentYear - 1) {
      const yr = currentYear - 1;
      startDate = `${yr}-01-01`;
      endDate = `${yr}-12-31`;
    } else if (options?.period && /^\d{4}$/.test(options.period)) {
      const yr = parseInt(options.period, 10);
      startDate = `${yr}-01-01`;
      endDate = yr === currentYear ? todayStr : `${yr}-12-31`;
    } else if (options?.from) {
      startDate = options.from;
    } else {
      // Default: Last 30 days up to today
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = thirtyDaysAgo.toISOString().substring(0, 10);
    }

    if (startDate > endDate) {
      startDate = endDate;
    }

    // 3. Fetch all wallet-altering events
    const walletIds = wallets.map((w) => w.id);
    if (walletIds.length === 0) {
      return [
        {
          date: todayStr,
          amount: 0,
          netWorth: 0,
          assets: 0,
          debt: 0,
          liabilities: 0,
        },
      ];
    }

    const adjustments = await db
      .select({
        walletId: schema.walletAdjustments.walletId,
        date: schema.walletAdjustments.adjustmentDate,
        amount: schema.walletAdjustments.amount,
      })
      .from(schema.walletAdjustments)
      .where(
        and(
          eq(schema.walletAdjustments.userId, userId),
          inArray(schema.walletAdjustments.walletId, walletIds)
        )
      );

    const spendings = await db
      .select({
        paidFromWalletId: schema.spendings.paidFromWalletId,
        date: schema.spendings.date,
        totalAmount: schema.spendings.totalAmount,
      })
      .from(schema.spendings)
      .where(
        and(
          eq(schema.spendings.userId, userId),
          eq(schema.spendings.isDeleted, false),
          isNotNull(schema.spendings.paidFromWalletId),
          inArray(schema.spendings.paidFromWalletId, walletIds)
        )
      );

    const transfers = await db
      .select({
        fromWalletId: schema.walletTransfers.fromWalletId,
        toWalletId: schema.walletTransfers.toWalletId,
        date: schema.walletTransfers.transferDate,
        amount: schema.walletTransfers.amount,
        targetAmount: schema.walletTransfers.targetAmount,
      })
      .from(schema.walletTransfers)
      .where(
        and(
          eq(schema.walletTransfers.userId, userId),
          or(
            inArray(schema.walletTransfers.fromWalletId, walletIds),
            inArray(schema.walletTransfers.toWalletId, walletIds)
          )
        )
      );

    // Group balance deltas by date and walletId
    // deltaMap[date][walletId] = change in wallet balance on that date
    const deltaMap = new Map<string, Map<string, typeof Money.prototype>>();

    const addDelta = (date: string, walletId: string, amount: string | number) => {
      if (!deltaMap.has(date)) {
        deltaMap.set(date, new Map());
      }
      const dayMap = deltaMap.get(date)!;
      const current = dayMap.get(walletId) || Money.from(0);
      dayMap.set(walletId, Money.add(current, amount));
    };

    // Delta adjustments add to balance
    for (const adj of adjustments) {
      addDelta(adj.date, adj.walletId, adj.amount);
    }

    // Spendings subtract from balance
    for (const sp of spendings) {
      if (sp.paidFromWalletId) {
        addDelta(sp.date, sp.paidFromWalletId, `-${sp.totalAmount}`);
      }
    }

    // Transfers: sender subtracts, receiver adds
    for (const tr of transfers) {
      addDelta(tr.date, tr.fromWalletId, `-${tr.amount}`);
      addDelta(tr.date, tr.toWalletId, tr.targetAmount);
    }

    // 4. Generate sampled timeline dates
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    const diffDays = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 3600 * 24)));

    // Pick sampling interval (daily if <= 31 days, every 2-3 days if <= 90 days, weekly/monthly if larger)
    let step = 1;
    if (diffDays > 180) {
      step = 7;
    } else if (diffDays > 60) {
      step = 3;
    } else if (diffDays > 31) {
      step = 2;
    }

    const sampledDates: string[] = [];
    const curr = new Date(startD);
    while (curr <= endD) {
      sampledDates.push(curr.toISOString().substring(0, 10));
      curr.setDate(curr.getDate() + step);
    }
    if (sampledDates[sampledDates.length - 1] !== endDate) {
      sampledDates.push(endDate);
    }

    // Also include any specific dates where transactions occurred within [startDate, endDate]
    for (const d of deltaMap.keys()) {
      if (d >= startDate && d <= endDate && !sampledDates.includes(d)) {
        sampledDates.push(d);
      }
    }
    sampledDates.sort();

    // 5. Calculate each wallet balance at each sampled date
    // Current balances are at todayStr. Working backwards:
    // Balance at date D = currentBalance - sum(deltas after D)
    const points: Array<{
      date: string;
      name?: string;
      amount: number;
      netWorth: number;
      assets: number;
      debt: number;
      liabilities: number;
    }> = [];

    // Pre-cache latest exchange rates
    const walletRateMap = new Map<string, string>();
    for (const w of wallets) {
      if (w.defaultCurrency && w.defaultCurrency !== baseCurrency) {
        try {
          const rate = await currencyService.getRateForDate(w.defaultCurrency, baseCurrency, todayStr);
          walletRateMap.set(w.id, rate);
        } catch {
          walletRateMap.set(w.id, '1.000000');
        }
      } else {
        walletRateMap.set(w.id, '1.000000');
      }
    }

    for (const date of sampledDates) {
      let dayAssets = Money.from(0);
      let dayDebt = Money.from(0);

      for (const w of wallets) {
        let bal = Money.from(w.currentBalance);

        // Subtract deltas that occurred AFTER this date
        for (const [d, dayDeltas] of deltaMap.entries()) {
          if (d > date && dayDeltas.has(w.id)) {
            const change = dayDeltas.get(w.id)!;
            bal = Money.subtract(bal, change);
          }
        }

        // Convert to base currency
        const rate = walletRateMap.get(w.id) || '1.000000';
        const converted = rate !== '1.000000' ? Money.convert(bal, rate) : bal;

        if (w.type === 'asset') {
          dayAssets = Money.add(dayAssets, converted);
        } else {
          dayDebt = Money.add(dayDebt, converted);
        }
      }

      let netWorth = Money.subtract(dayAssets, dayDebt);

      // If single wallet filter:
      if (!isAll && wallets.length === 1) {
        const singleW = wallets[0];
        if (singleW.type === 'liability') {
          // For a liability wallet: debt is its balance, net worth is negative of balance
          netWorth = Money.from(0).subtract(dayDebt);
        } else {
          netWorth = dayAssets;
        }
      }

      const nwNum = parseFloat(Money.toDbString(netWorth));
      const assetNum = Math.max(0, parseFloat(Money.toDbString(dayAssets)));
      const debtNum = Math.max(0, parseFloat(Money.toDbString(dayDebt)));

      points.push({
        date,
        name: date,
        amount: nwNum,
        netWorth: nwNum,
        assets: assetNum,
        debt: debtNum,
        liabilities: debtNum,
      });
    }

    // Ensure at least 2 points for smooth chart rendering
    if (points.length === 1) {
      const first = points[0];
      const earlierDate = new Date(new Date(first.date).getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .substring(0, 10);
      points.unshift({
        ...first,
        date: earlierDate,
        name: earlierDate,
      });
    }

    return points;
  }
}

export const dashboardService = new DashboardService();

