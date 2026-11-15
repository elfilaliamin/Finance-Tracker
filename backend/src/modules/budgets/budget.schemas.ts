import { z } from 'zod';

const baseBudgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  type: z.enum(['spending_limit', 'saving_goal']),
  walletId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  spendingCategoryId: z.string().uuid().optional().nullable(),
  period: z.enum(['monthly', 'yearly', 'custom']).default('monthly'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD')
    .optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  currency: z.enum(['MAD', 'USD', 'EUR']).default('MAD'),
  notes: z.string().max(1000).optional().nullable(),
});

export const createBudgetSchema = baseBudgetSchema.transform((data) => {
  const categoryId = data.categoryId || data.spendingCategoryId || undefined;
  const startDate = data.startDate || new Date().toISOString().split('T')[0];
  return {
    ...data,
    categoryId,
    startDate,
    endDate: data.endDate || undefined,
    walletId: data.walletId || undefined,
    notes: data.notes?.trim() || undefined,
  };
});

export const updateBudgetSchema = baseBudgetSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .transform((data) => {
    const categoryId =
      data.categoryId !== undefined
        ? data.categoryId
        : data.spendingCategoryId !== undefined
        ? data.spendingCategoryId
        : undefined;
    return {
      ...data,
      ...(categoryId !== undefined ? { categoryId: categoryId || undefined } : {}),
    };
  });

export const budgetFilterSchema = z.object({
  type: z.enum(['spending_limit', 'saving_goal']).optional(),
  walletId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetFilterInput = z.infer<typeof budgetFilterSchema>;

