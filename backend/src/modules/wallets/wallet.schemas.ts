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

export const createAdjustmentSchema = z
  .object({
    adjustmentDate: z.string().optional(),
    date: z.string().optional(),
    adjustmentType: z.enum(['delta', 'reconcile']).optional(),
    type: z.enum(['delta', 'reconcile']).optional(),
    amount: z.coerce.number(), // for delta: positive or negative delta; for reconcile: target balance
    notes: z.string().max(500).optional().nullable(),
  })
  .transform((data) => {
    let rawDate = data.adjustmentDate || data.date || new Date().toISOString().split('T')[0];
    if (rawDate.includes('T')) {
      rawDate = rawDate.split('T')[0];
    }
    const adjustmentType = data.adjustmentType || data.type || 'delta';
    return {
      adjustmentDate: rawDate,
      adjustmentType,
      amount: data.amount,
      notes: data.notes || undefined,
    };
  })
  .refine((data) => /^\d{4}-\d{2}-\d{2}$/.test(data.adjustmentDate), {
    message: 'Date must be formatted YYYY-MM-DD',
    path: ['date'],
  });

export const createTransferSchema = z
  .object({
    fromWalletId: z.string().uuid('Source wallet is required'),
    toWalletId: z.string().uuid('Destination wallet is required'),
    amount: z.coerce.number().positive('Transfer amount must be greater than 0'),
    transferDate: z.string().optional(),
    date: z.string().optional(),
    notes: z.string().max(500).optional().nullable(),
  })
  .transform((data) => {
    let rawDate = data.transferDate || data.date || new Date().toISOString().split('T')[0];
    if (rawDate.includes('T')) {
      rawDate = rawDate.split('T')[0];
    }
    return {
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      amount: data.amount,
      transferDate: rawDate,
      notes: data.notes || undefined,
    };
  })
  .refine((data) => data.fromWalletId !== data.toWalletId, {
    message: 'Source and destination wallets must be different',
    path: ['toWalletId'],
  })
  .refine((data) => /^\d{4}-\d{2}-\d{2}$/.test(data.transferDate), {
    message: 'Date must be formatted YYYY-MM-DD',
    path: ['date'],
  });

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;

