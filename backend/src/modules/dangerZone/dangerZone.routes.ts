import { Router } from 'express';
import { dangerZoneController } from './dangerZone.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const router = Router();

const purgeSchema = z.object({
  module: z.enum(['income', 'spending', 'all']),
  typedConfirmation: z.string(),
});

router.use(authenticate);

router.get('/export', dangerZoneController.export);
router.post('/import/dry-run', dangerZoneController.dryRun);
router.post('/purge', validateRequest({ body: purgeSchema }), dangerZoneController.purge);

export default router;

