import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { settingsApi } from '@/api/settingsApi';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { ExchangeRatesCard } from './components/ExchangeRatesCard';
import { DangerZoneCard } from './components/DangerZoneCard';
import { ImportWizardModal } from './components/ImportWizardModal';
import { DashboardCustomizationCard } from './components/DashboardCustomizationCard';
import {
  RiUserLine,
  RiLockPasswordLine,
  RiSunLine,
  RiMoonLine,
  RiComputerLine,
  RiCheckboxCircleLine,
  RiPaletteLine,
  RiCameraLine,
  RiDeleteBinLine,
} from '@remixicon/react';

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
  const { theme, setTheme } = useTheme();
  const { avatar, setAvatar } = useUserAvatar();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Resize to maximum 256x256 to ensure ultra-fast loading and minimal storage
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(dataUrl);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

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
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">User Settings & Preferences</h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
          Manage your account credentials, visual theme, currency rates, and data backups.
        </p>
      </div>

      {/* Account Info Card */}
      {user && (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
              <RiUserLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[var(--color-text)] text-base">Account Profile</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Tenant identifier and base currency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-[var(--color-primary-bg)] p-3 rounded-[var(--radius-base)] border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] block text-[10px] uppercase font-semibold">User Email</span>
              <span className="font-semibold text-[var(--color-text)] text-sm mt-0.5 block truncate">{user.email}</span>
            </div>
            <div className="bg-[var(--color-primary-bg)] p-3 rounded-[var(--radius-base)] border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] block text-[10px] uppercase font-semibold">Display Name</span>
              <span className="font-semibold text-[var(--color-text)] text-sm mt-0.5 block truncate">
                {user.name || 'Not set'}
              </span>
            </div>
            <div className="bg-[var(--color-primary-bg)] p-3 rounded-[var(--radius-base)] border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] block text-[10px] uppercase font-semibold">Base Currency</span>
              <span className="font-bold text-[var(--color-accent)] text-sm mt-0.5 block">{user.baseCurrency}</span>
            </div>
          </div>

          {/* Profile Picture Management */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <h4 className="text-xs font-semibold text-[var(--color-text)] mb-3">Profile Picture</h4>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Circular Avatar Preview */}
              <div className="relative group shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user.name || user.email}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-accent)] shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center uppercase shadow-sm">
                    {(user.name || user.email).charAt(0)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] cursor-pointer shadow-xs transition-colors">
                    <RiCameraLine size={15} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar(null)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-danger)] text-xs font-semibold hover:bg-[var(--color-danger)]/10 transition-colors"
                    >
                      <RiDeleteBinLine size={15} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Upload a photo (PNG, JPG, WebP). It will be displayed beside your name in the navbar and sidebar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appearance & Theme Selector Card */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
            <RiPaletteLine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[var(--color-text)] text-base">Appearance & Theme</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Choose your visual appearance preference</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 rounded-[var(--radius-base)] border flex flex-col items-center gap-2 text-xs font-semibold transition-all touch-target ${
              theme === 'light'
                ? 'bg-[var(--color-primary-bg)] border-[var(--color-accent)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <RiSunLine className="w-5 h-5" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-[var(--radius-base)] border flex flex-col items-center gap-2 text-xs font-semibold transition-all touch-target ${
              theme === 'dark'
                ? 'bg-[var(--color-primary-bg)] border-[var(--color-accent)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <RiMoonLine className="w-5 h-5" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3 rounded-[var(--radius-base)] border flex flex-col items-center gap-2 text-xs font-semibold transition-all touch-target ${
              theme === 'system'
                ? 'bg-[var(--color-primary-bg)] border-[var(--color-accent)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <RiComputerLine className="w-5 h-5" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Dashboard Customization Card */}
      <DashboardCustomizationCard />

      {/* Exchange Rates Live Engine Card */}
      <ExchangeRatesCard />

      {/* Change Password Card */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
            <RiLockPasswordLine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[var(--color-text)] text-base">Security & Password</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Update your Argon2id encrypted account password</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-xs text-[var(--color-accent)] flex items-center gap-2">
            <RiCheckboxCircleLine className="w-4 h-4" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-2.5 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-xs text-[var(--color-danger)]">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Current Password *
            </label>
            <input
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            />
            {errors.currentPassword && (
              <p className="text-xs text-[var(--color-danger)] mt-0.5">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              New Password (min 8 chars) *
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('newPassword')}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            />
            {errors.newPassword && (
              <p className="text-xs text-[var(--color-danger)] mt-0.5">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-[var(--color-danger)] mt-0.5">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-60 transition-colors touch-target"
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

