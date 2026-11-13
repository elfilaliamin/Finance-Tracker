import { Router } from 'express';
import { incomeSourcesController } from './incomeSources.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const router = Router();

const sourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).trim(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code (e.g. #10b981)').optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

router.use(authenticate);

router.get('/', incomeSourcesController.list);
router.post('/', validateRequest({ body: sourceSchema }), incomeSourcesController.create);
router.put('/:id', validateRequest({ body: sourceSchema.partial() }), incomeSourcesController.update);
router.delete('/:id', incomeSourcesController.delete);

export default router;

