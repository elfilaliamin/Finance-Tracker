import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { settingsApi } from '@/api/settingsApi';
import { useAuth } from '@/hooks/useAuth';
import { ExchangeRatesCard } from './components/ExchangeRatesCard';
import { DangerZoneCard } from './components/DangerZoneCard';
import { ImportWizardModal } from './components/ImportWizardModal';
import { KeyRound, Shield, CheckCircle2, User } from 'lucide-react';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordError(null);
      setPasswordSuccess(null);
      await settingsApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess('Password successfully updated.');
      reset();
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">User Settings & Preferences</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your account credentials, currency rates, and data backups.
        </p>
      </div>

      {/* Account Info Card */}
      {user && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Account Profile</h3>
              <p className="text-xs text-slate-500">Tenant identifier and base currency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">User Email</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">{user.email}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Display Name</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
                {user.name || 'Not set'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Base Currency</span>
              <span className="font-bold text-indigo-700 text-sm mt-0.5 block">{user.baseCurrency}</span>
            </div>
          </div>
        </div>
      )}

      {/* Exchange Rates Live Engine Card */}
      <ExchangeRatesCard />

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <KeyRound size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Security & Password</h3>
            <p className="text-xs text-slate-500">Update your Argon2id encrypted account password</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Current Password *
            </label>
            <input
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm shadow-sm"
            />
            {errors.currentPassword && (
              <p className="text-xs text-rose-600 mt-0.5">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Password (min 8 chars) *
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('newPassword')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm shadow-sm"
            />
            {errors.newPassword && (
              <p className="text-xs text-rose-600 mt-0.5">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm shadow-sm"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600 mt-0.5">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors touch-target"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Export / Import / Purge */}
      <DangerZoneCard
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onPurgeSuccess={() => {
          queryClient.clear();
          window.location.reload();
        }}
      />

      {/* Import Wizard Modal */}
      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries();
          alert('Workspace backup successfully restored.');
        }}
      />
    </div>
  );
};

