import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { runMigrationsAndSeed } from './db/migrate.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { sendSuccess } from './utils/responseEnvelope.js';
import authRoutes from './modules/auth/auth.routes.js';
import currencyRoutes from './modules/currencies/currency.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import incomeSourcesRoutes from './modules/incomeSources/incomeSources.routes.js';
import walletRoutes from './modules/wallets/wallet.routes.js';
import incomeRoutes from './modules/incomes/income.routes.js';
import spendingRoutes from './modules/spendings/spending.routes.js';
import budgetRoutes from './modules/budgets/budget.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import dangerZoneRoutes from './modules/dangerZone/dangerZone.routes.js';
import { generalRateLimiter } from './middlewares/rateLimiter.js';

const app = express();
const port = process.env.PORT || 4000;

app.set('trust proxy', process.env.TRUST_PROXY === '1' || true);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Base healthcheck endpoint (no rate limit for docker healthcheck)
app.get('/api/v1/health', (_req: Request, res: Response) => {
  sendSuccess(res, { status: 'ok' });
});

// General rate limiter for API routes
app.use('/api/v1', generalRateLimiter);

// Module routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', currencyRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/income-sources', incomeSourcesRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/incomes', incomeRoutes);
app.use('/api/v1/spendings', spendingRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/danger-zone', dangerZoneRoutes);

// Centralized error handling
app.use(errorHandler);

async function startServer() {
  if (process.env.DATABASE_URL) {
    try {
      await runMigrationsAndSeed();
    } catch (err) {
      console.error('[Finance-Tracker] Database migration on boot failed:', err);
    }
  }

  app.listen(port, () => {
    console.log(`[Finance-Tracker] Backend service listening on port ${port}`);
  });
}

startServer();

export default app;
