import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { RiLoginBoxLine, RiAlertLine, RiShieldCheckLine } from '@remixicon/react';
import { useAuth } from '@/hooks/useAuth';
import { AppLogo } from '@/components/ui/AppLogo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isLoggingIn, isAuthenticated, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setErrorMessage(null);
      await login(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient gradient glow in background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 20%, var(--color-primary) 0%, transparent 70%)'
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Or{' '}
          <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
            create a new account
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="w-full px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent text-sm transition-all"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="w-full px-4 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent text-sm transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{errors.password.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-ring)] shadow-[var(--shadow-base)] hover:shadow-[var(--shadow-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 touch-target"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RiLoginBoxLine className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
            <RiShieldCheckLine className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Encrypted & self-hosted security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

