import { z } from 'zod';

export const spendingItemInputSchema = z
  .object({
    articleName: z.string().max(150).trim().optional(),
    name: z.string().max(150).trim().optional(),
    categoryId: z.string().optional().nullable(),
    unitPrice: z.coerce.number().positive('Unit price must be positive'),
    quantity: z.coerce.number().positive('Quantity must be positive').default(1),
  })
  .transform((item) => {
    const articleName = (item.articleName || item.name || '').trim();
    const categoryId = item.categoryId && item.categoryId.trim().length > 0 ? item.categoryId.trim() : undefined;
    return {
      articleName,
      name: articleName,
      categoryId,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    };
  })
  .refine((item) => item.articleName.length > 0, {
    message: 'Article name is required',
    path: ['articleName'],
  });

export const createSpendingSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
    paidFromWalletId: z.string().uuid().optional().nullable(),
    store: z.string().max(150).trim().optional().nullable(),
    storeMerchant: z.string().max(150).trim().optional().nullable(),
    currency: z.enum(['MAD', 'USD', 'EUR']),
    notes: z.string().max(1000).optional().nullable(),
    items: z.array(spendingItemInputSchema).min(1, 'At least one line item is required'),
  })
  .transform((data) => ({
    date: data.date,
    paidFromWalletId: data.paidFromWalletId || undefined,
    store: (data.store || data.storeMerchant)?.trim() || undefined,
    currency: data.currency,
    notes: data.notes?.trim() || undefined,
    items: data.items,
  }));

export const updateSpendingSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    paidFromWalletId: z.string().uuid().optional().nullable(),
    store: z.string().max(150).trim().optional().nullable(),
    storeMerchant: z.string().max(150).trim().optional().nullable(),
    currency: z.enum(['MAD', 'USD', 'EUR']).optional(),
    notes: z.string().max(1000).optional().nullable(),
    items: z.array(spendingItemInputSchema).min(1).optional(),
  })
  .transform((data) => ({
    date: data.date,
    paidFromWalletId: data.paidFromWalletId !== undefined ? data.paidFromWalletId || undefined : undefined,
    store: (data.store || data.storeMerchant)?.trim() || undefined,
    currency: data.currency,
    notes: data.notes !== undefined ? data.notes?.trim() || undefined : undefined,
    items: data.items,
  }));

export const spendingFilterSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    walletId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    store: z.string().optional(),
    storeMerchant: z.string().optional(),
    search: z.string().optional(),
    currency: z.enum(['MAD', 'USD', 'EUR']).optional(),
  })
  .transform((data) => ({
    page: data.page,
    limit: data.limit,
    from: data.from || data.startDate,
    to: data.to || data.endDate,
    walletId: data.walletId,
    categoryId: data.categoryId,
    store: data.store || data.storeMerchant,
    search: data.search,
    currency: data.currency,
  }));

export interface SpendingItemInput {
  articleName: string;
  name?: string;
  categoryId?: string | null;
  unitPrice: number;
  quantity: number;
}

export interface CreateSpendingInput {
  date: string;
  paidFromWalletId?: string | null;
  store?: string | null;
  storeMerchant?: string | null;
  currency: 'MAD' | 'USD' | 'EUR';
  notes?: string | null;
  items: SpendingItemInput[];
}

export type UpdateSpendingInput = z.infer<typeof updateSpendingSchema>;
export type SpendingFilterInput = z.infer<typeof spendingFilterSchema>;

