import { z } from 'zod';

const baseIncomeObject = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
    sourceId: z.string().uuid('Valid source ID is required'),
    categoryId: z.string().uuid('Valid category ID is required').optional().nullable(),
    walletId: z.string().uuid('Valid wallet ID is required').optional().nullable(),
    amount: z.coerce.number().positive('Amount must be positive'),
    currency: z.enum(['MAD', 'USD', 'EUR']),
    description: z.string().max(255).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  })
  .strict();

export const createIncomeSchema = baseIncomeObject.transform((data) => ({
  ...data,
  description: data.description?.trim() || undefined,
  notes: data.notes?.trim() || undefined,
  categoryId: data.categoryId || undefined,
  walletId: data.walletId || undefined,
}));

export const updateIncomeSchema = baseIncomeObject.partial().transform((data) => ({
  ...data,
  description: data.description !== undefined ? data.description?.trim() || undefined : undefined,
  notes: data.notes !== undefined ? data.notes?.trim() || undefined : undefined,
  categoryId: data.categoryId !== undefined ? data.categoryId || undefined : undefined,
  walletId: data.walletId !== undefined ? data.walletId || undefined : undefined,
}));

export const incomeFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  sourceId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  currency: z.enum(['MAD', 'USD', 'EUR']).optional(),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type IncomeFilterInput = z.infer<typeof incomeFilterSchema>;

