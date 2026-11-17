# Dashboard & Analytics API

The Dashboard API aggregates financial metrics across income streams, expenditure distributions, and multi-currency net worth timelines.

All endpoints require authentication (`auth_token` cookie).

---

## Endpoints

### 1. Key Performance Metrics (`/api/v1/dashboard/metrics`)
Retrieves real-time totals, period comparisons, and net savings ratios:
- Total Assets, Total Liabilities, and Net Worth in display currency.
- Total Income vs Total Spending for the selected timeframe.
- Savings Rate percentage (`(Income - Spending) / Income * 100`).

---

### 2. Historical Net Worth History (`/api/v1/dashboard/charts/net-worth-history`)
Calculates net worth snapshots across days, months, or years:
- Reconstructs historical wallet balances by rolling back transactions (spendings, incomes, transfers, and adjustments).
- Applies historical exchange rates to accurately represent multi-currency holdings at that moment in time.
- Supports yearly filters (`year=2026`, `year=all`, etc.).

#### Query Parameters
- `year` (`string`, optional): Specific 4-digit calendar year or `'all'`.
- `period` (`string`, optional): Sample density (`'daily'`, `'monthly'`, `'yearly'`).

---

### 3. Income Trend (`/api/v1/dashboard/charts/income-trend`)
Aggregates income timeline grouped by income source and category.

---

### 4. Spending Category Matrix (`/api/v1/dashboard/charts/spending-matrix`)
Computes category percentage breakdowns, top spending merchants, and average receipt totals.
