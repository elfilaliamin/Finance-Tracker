import { Router } from 'express';
import { incomeCategoriesController } from './incomeCategories.controller.js';
import { spendingCategoriesController } from './spendingCategories.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  description: z.string().max(500).trim().optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code (e.g. #3b82f6)').optional(),
  icon: z.string().max(50).optional(),
});

// All category routes require authentication
router.use(authenticate);

// Income Categories Routes
router.get('/income', incomeCategoriesController.list);
router.post('/income', validateRequest({ body: categorySchema }), incomeCategoriesController.create);
router.put('/income/:id', validateRequest({ body: categorySchema.partial() }), incomeCategoriesController.update);
router.delete('/income/:id', incomeCategoriesController.delete);

// Spending Categories Routes (Strictly Separate)
router.get('/spending', spendingCategoriesController.list);
router.post('/spending', validateRequest({ body: categorySchema }), spendingCategoriesController.create);
router.put('/spending/:id', validateRequest({ body: categorySchema.partial() }), spendingCategoriesController.update);
router.delete('/spending/:id', spendingCategoriesController.delete);

export default router;

