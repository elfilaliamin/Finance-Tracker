import { z } from 'zod';

export const createIncomeSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
    sourceId: z.string().uuid('Valid source ID is required'),
    categoryId: z.string().uuid('Valid category ID is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    currency: z.enum(['MAD', 'USD', 'EUR']),
    description: z.string().min(1, 'Description is required').max(255).trim(),
    notes: z.string().max(1000).optional(),
  })
  .strict(); // Strict mode rejects any extraneous fields like wallet_id

export const updateIncomeSchema = createIncomeSchema.partial();

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

