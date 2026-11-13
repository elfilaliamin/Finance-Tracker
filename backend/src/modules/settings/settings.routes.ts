import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const router = Router();

const updateSettingsSchema = z.object({
  displayCurrency: z.enum(['MAD', 'USD', 'EUR']).optional(),
  conversionMode: z.enum(['historical', 'latest']).optional(),
  exchangeRateFrequency: z.enum(['daily', 'manual']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  defaultSpendingWalletId: z.string().uuid().optional().nullable(),
  dashboardLayout: z.any().optional(),
});

router.use(authenticate);

router.get('/', settingsController.get);
router.put('/', validateRequest({ body: updateSettingsSchema }), settingsController.update);

export default router;

