import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  type: z.enum(['spending_limit', 'saving_goal']),
  walletId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  period: z.enum(['monthly', 'yearly', 'custom']).default('monthly'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  currency: z.enum(['MAD', 'USD', 'EUR']).default('MAD'),
});

export const updateBudgetSchema = createBudgetSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const budgetFilterSchema = z.object({
  type: z.enum(['spending_limit', 'saving_goal']).optional(),
  walletId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetFilterInput = z.infer<typeof budgetFilterSchema>;

