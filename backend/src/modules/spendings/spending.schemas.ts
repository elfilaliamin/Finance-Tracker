import { z } from 'zod';

export const spendingItemInputSchema = z.object({
  articleName: z.string().min(1, 'Article name is required').max(150).trim(),
  categoryId: z.string().uuid('Valid category ID required').optional().nullable(),
  unitPrice: z.coerce.number().positive('Unit price must be positive'),
  quantity: z.coerce.number().positive('Quantity must be positive').default(1),
});

export const createSpendingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  paidFromWalletId: z.string().uuid().optional().nullable(),
  store: z.string().max(150).trim().optional().nullable(),
  currency: z.enum(['MAD', 'USD', 'EUR']),
  notes: z.string().max(1000).optional().nullable(),
  items: z.array(spendingItemInputSchema).min(1, 'At least one line item is required'),
});

export const updateSpendingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  paidFromWalletId: z.string().uuid().optional().nullable(),
  store: z.string().max(150).trim().optional().nullable(),
  currency: z.enum(['MAD', 'USD', 'EUR']).optional(),
  notes: z.string().max(1000).optional().nullable(),
  items: z.array(spendingItemInputSchema).min(1).optional(),
});

export const spendingFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  walletId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  store: z.string().optional(),
  search: z.string().optional(),
  currency: z.enum(['MAD', 'USD', 'EUR']).optional(),
});

export type SpendingItemInput = z.infer<typeof spendingItemInputSchema>;
export type CreateSpendingInput = z.infer<typeof createSpendingSchema>;
export type UpdateSpendingInput = z.infer<typeof updateSpendingSchema>;
export type SpendingFilterInput = z.infer<typeof spendingFilterSchema>;

