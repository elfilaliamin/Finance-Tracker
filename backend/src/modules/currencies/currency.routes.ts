import { Router } from 'express';
import { currencyController } from './currency.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const router = Router();

const manualRateSchema = z.object({
  base: z.string().length(3).toUpperCase(),
  target: z.string().length(3).toUpperCase(),
  rate: z.coerce.number().positive('Rate must be positive'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
});

// Currencies
router.get('/currencies', currencyController.getCurrencies);

// Exchange Rates
router.get('/exchange-rates/latest', currencyController.getLatestRates);
router.get('/exchange-rates/history', authenticate, currencyController.getHistory);
router.post('/exchange-rates/sync', authenticate, currencyController.syncRates);
router.post('/exchange-rates/refresh', authenticate, currencyController.syncRates);
router.post(
  '/exchange-rates/manual',
  authenticate,
  validateRequest({ body: manualRateSchema }),
  currencyController.setManualRate
);

export default router;
