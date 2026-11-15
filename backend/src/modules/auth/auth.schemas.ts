import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    displayName: z.string().max(100).trim().optional(),
    name: z.string().max(100).trim().optional(),
    baseCurrency: z.enum(['MAD', 'USD', 'EUR']).optional(),
  })
  .transform((data) => ({
    email: data.email,
    password: data.password,
    displayName: (data.displayName || data.name || data.email.split('@')[0]).trim(),
    baseCurrency: data.baseCurrency || 'MAD',
  }));

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

