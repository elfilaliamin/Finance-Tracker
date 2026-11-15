import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { RiUserAddLine, RiAlertLine, RiShieldCheckLine } from '@remixicon/react';
import { useAuth } from '@/hooks/useAuth';
import { AppLogo } from '@/components/ui/AppLogo';

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  baseCurrency: z.enum(['MAD', 'USD', 'EUR']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isRegistering, isAuthenticated, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      baseCurrency: 'MAD',
    },
  });

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setErrorMessage(null);
      await registerUser(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* AI-Generated Finance Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 dark:opacity-25 filter blur-[1px] transform scale-105"
        style={{
          backgroundImage: 'url(/auth-bg.jpg)'
        }}
      />
      {/* Ambient gradient glow in background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 25%, var(--color-primary-bg) 0%, transparent 80%)'
        }}
      />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
          <AppLogo size={48} className="shadow-[var(--shadow-md)] group-hover:scale-105 transition-transform" />
          <span className="font-heading font-black text-2xl tracking-tight text-[var(--color-text)]">
            Finance<span className="text-[var(--color-accent)]">Tracker</span>
          </span>
        </Link>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-[var(--color-text)]">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-surface)] py-8 px-6 shadow-[var(--shadow-lg)] border border-[var(--color-border)] rounded-[var(--radius-surface)] sm:px-10">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 flex items-center gap-2.5 text-[var(--color-danger)] text-sm">
              <RiAlertLine className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                autoComplete="name"
                {...register('name')}
                className="w-full px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent text-sm transition-all"
                placeholder="Alex Morgan"
              />
              {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="w-full px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent text-sm transition-all"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Password (min. 8 characters)
              </label>
              <input
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="w-full px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent text-sm transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Default Base Currency
              </label>
              <select
                {...register('baseCurrency')}
                className="w-full px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent text-sm transition-all"
              >
                <option value="MAD">MAD - Moroccan Dirham</option>
                <option value="USD">USD - United States Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
              {errors.baseCurrency && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.baseCurrency.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 px-4 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-ring)] shadow-[var(--shadow-base)] hover:shadow-[var(--shadow-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 touch-target"
              >
                {isRegistering ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RiUserAddLine className="w-5 h-5" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
            <RiShieldCheckLine className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Zero telemetry, self-hosted privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

