import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import {
  RiUser3Line,
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCoinsLine,
  RiArrowRightLine,
  RiAlertLine,
} from '@remixicon/react';
import { useAuth } from '@/hooks/useAuth';
import { AppLogo } from '@/components/ui/AppLogo';
import authBg from '@/assets/auth-bg.jpg';

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
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
      const chosenName = data.name?.trim() || data.email.split('@')[0];
      await registerUser({
        email: data.email,
        password: data.password,
        displayName: chosenName,
        name: chosenName,
        baseCurrency: data.baseCurrency,
      });
    } catch (err: any) {
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        setErrorMessage(err.details.map((d: any) => d.issue || d.message).join(', '));
      } else {
        setErrorMessage(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Architectural/Office Interior Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{
          backgroundImage: `url(${authBg})`,
        }}
      />
      {/* Deep moody cinematic dark overlay (matching reference design) */}
      <div className="absolute inset-0 bg-[#081513]/75 dark:bg-[#030908]/85" />

      {/* Floating Center Card */}
      <div className="relative z-10 w-full max-w-[430px] bg-[#f8faf9] dark:bg-[#152722] py-9 px-7 sm:px-10 rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 animate-fade-in-up">
        {/* Top Center Logo */}
        <div className="flex justify-center mb-5">
          <Link to="/" className="group inline-block" title="Back to Finance Tracker">
            <AppLogo size={46} className="shadow-sm group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        {/* Card Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-[1.65rem] font-bold font-[family-name:var(--font-heading)] text-slate-900 dark:text-white tracking-tight">
            Create an account
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Set up your workspace to start tracking your finances.
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            <RiAlertLine className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name (Optional) */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 text-left"
            >
              Full Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <RiUser3Line size={16} />
              </div>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Alex Morgan"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-[#eaf6f0] dark:bg-[#1e3830] border border-[#bfe5d1] dark:border-[#2b5446] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white dark:focus:bg-[#1a332b] transition-colors"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 text-left">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 text-left"
            >
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <RiMailLine size={16} />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="alex.rivers@finance.local"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-[#eaf6f0] dark:bg-[#1e3830] border border-[#bfe5d1] dark:border-[#2b5446] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white dark:focus:bg-[#1a332b] transition-colors"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 text-left">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field with Eye Toggle */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 text-left"
            >
              Password <span className="text-slate-400 font-normal">(min. 8 characters)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <RiLockPasswordLine size={16} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-[#eaf6f0] dark:bg-[#1e3830] border border-[#bfe5d1] dark:border-[#2b5446] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white dark:focus:bg-[#1a332b] transition-colors font-mono"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 text-left">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Default Base Currency */}
          <div>
            <label
              htmlFor="baseCurrency"
              className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 text-left"
            >
              Default Currency
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <RiCoinsLine size={16} />
              </div>
              <select
                id="baseCurrency"
                {...register('baseCurrency')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#eaf6f0] dark:bg-[#1e3830] border border-[#bfe5d1] dark:border-[#2b5446] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white dark:focus:bg-[#1a332b] transition-colors cursor-pointer"
              >
                <option value="MAD">MAD - Moroccan Dirham</option>
                <option value="USD">USD - United States Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            {errors.baseCurrency && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 text-left">
                {errors.baseCurrency.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#064e3b] hover:bg-[#047857] active:scale-[0.99] shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 touch-target disabled:opacity-50"
            >
              {isRegistering ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Workspace Account</span>
                  <RiArrowRightLine size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#064e3b] dark:text-[#34d399] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
