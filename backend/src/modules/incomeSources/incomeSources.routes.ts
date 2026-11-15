import { Router } from 'express';
import { incomeSourcesController } from './incomeSources.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const router = Router();

const sourceSchema = z
  .object({
    title: z.string().max(100).trim().optional(),
    name: z.string().max(100).trim().optional(),
    description: z.string().max(500).optional().nullable(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code (e.g. #10b981)').optional(),
    status: z.enum(['active', 'inactive']).optional(),
    isActive: z.boolean().optional(),
  })
  .transform((data) => {
    const title = (data.title || data.name || '').trim();
    const status =
      data.status || (data.isActive !== undefined ? (data.isActive ? 'active' : 'inactive') : 'active');
    return {
      title,
      description: data.description || undefined,
      color: data.color || '#10b981',
      status,
    };
  })
  .refine((data) => data.title.length > 0, {
    message: 'Source name is required',
    path: ['name'],
  });

const updateSourceSchema = z
  .object({
    title: z.string().max(100).trim().optional(),
    name: z.string().max(100).trim().optional(),
    description: z.string().max(500).optional().nullable(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code (e.g. #10b981)').optional(),
    status: z.enum(['active', 'inactive']).optional(),
    isActive: z.boolean().optional(),
  })
  .transform((data) => {
    const title = (data.title || data.name)?.trim();
    const status =
      data.status || (data.isActive !== undefined ? (data.isActive ? 'active' : 'inactive') : undefined);
    return {
      ...(title ? { title } : {}),
      ...(data.description !== undefined ? { description: data.description || undefined } : {}),
      ...(data.color ? { color: data.color } : {}),
      ...(status ? { status } : {}),
    };
  });

router.use(authenticate);

router.get('/', incomeSourcesController.list);
router.post('/', validateRequest({ body: sourceSchema }), incomeSourcesController.create);
router.put('/:id', validateRequest({ body: updateSourceSchema }), incomeSourcesController.update);
router.delete('/:id', incomeSourcesController.delete);

export default router;

