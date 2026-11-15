import { Router } from 'express';
import { dangerZoneController } from './dangerZone.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const router = Router();

const purgeSchema = z
  .object({
    module: z.enum(['income', 'spending', 'all']).optional(),
    typedConfirmation: z.string().optional(),
    confirmation: z.string().optional(),
  })
  .transform((data) => ({
    module: data.module || 'all',
    typedConfirmation: (data.typedConfirmation || data.confirmation || '').trim(),
  }))
  .refine((data) => data.typedConfirmation.length > 0, {
    message: 'Confirmation is required',
    path: ['typedConfirmation'],
  });

router.use(authenticate);

router.get('/export', dangerZoneController.export);
router.post('/import/dry-run', dangerZoneController.dryRun);
router.post('/import', dangerZoneController.executeImport);
router.post('/purge', validateRequest({ body: purgeSchema }), dangerZoneController.purge);

export default router;

