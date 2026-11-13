import { z } from 'zod';

export const createWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required').max(100).trim(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code').default('#3b82f6'),
  icon: z.string().max(50).optional(),
  type: z.enum(['asset', 'liability']),
  defaultCurrency: z.enum(['MAD', 'USD', 'EUR']).default('MAD'),
  initialBalance: z.coerce.number().default(0),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateWalletSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  status: z.enum(['active', 'archived']).optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const createAdjustmentSchema = z.object({
  adjustmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  adjustmentType: z.enum(['delta', 'reconcile']).default('delta'),
  amount: z.coerce.number(), // for delta: positive or negative delta; for reconcile: target balance
  notes: z.string().max(500).optional(),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;

