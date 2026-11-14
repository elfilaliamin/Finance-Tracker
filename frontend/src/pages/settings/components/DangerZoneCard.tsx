import React, { useState } from 'react';
import { RiDownloadLine, RiUploadLine, RiDeleteBinLine, RiErrorWarningLine } from '@remixicon/react';
import { settingsApi } from '@/api/settingsApi';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';

interface DangerZoneCardProps {
  onOpenImportModal: () => void;
  onPurgeSuccess: () => void;
}

export const DangerZoneCard: React.FC<DangerZoneCardProps> = ({
  onOpenImportModal,
  onPurgeSuccess,
}) => {
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isPurging, setIsPurging] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);

  const handleExportBackup = async () => {
    try {
      await settingsApi.exportData();
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleExecutePurge = async () => {
    if (confirmInput !== 'PERMANENTLY DELETE') return;
    try {
      setIsPurging(true);
      setPurgeError(null);
      await settingsApi.purgeData('PERMANENTLY DELETE');
      setIsPurgeModalOpen(false);
      onPurgeSuccess();
    } catch (err: any) {
      setPurgeError(err.message || 'Purge failed.');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-danger)]/30 p-5 shadow-[var(--shadow-sm)] space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20 flex items-center justify-center">
          <RiErrorWarningLine className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-[var(--color-text)] text-base">Workspace Data & Danger Zone</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Manage tenant backups, restorations, and resets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Export Backup */}
        <div className="p-3.5 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-[var(--radius-base)] flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-[var(--color-text)] mb-1">Export JSON Backup</h4>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Download complete serialized package of your wallets, incomes, spendings, and budgets.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-primary-bg)] touch-target transition-colors"
          >
            <RiDownloadLine className="w-3.5 h-3.5" />
            <span>Download Backup</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="p-3.5 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-[var(--radius-base)] flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-[var(--color-text)] mb-1">Restore from Backup</h4>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Import a previously exported JSON workspace with dry-run conflict validation.
            </p>
          </div>
          <button
            onClick={onOpenImportModal}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] touch-target transition-colors"
          >
            <RiUploadLine className="w-3.5 h-3.5" />
            <span>Launch Restore Wizard</span>
          </button>
        </div>

        {/* Purge Everything */}
        <div className="p-3.5 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-[var(--radius-base)] flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-[var(--color-danger)] mb-1">Purge Workspace</h4>
            <p className="text-[11px] text-[var(--color-danger)]/80">
              Permanently wipe all wallets, ledgers, and transactions. Cannot be undone!
            </p>
          </div>
          <button
            onClick={() => {
              setConfirmInput('');
              setIsPurgeModalOpen(true);
            }}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-base)] bg-[var(--color-danger)] text-white text-xs font-semibold hover:bg-[var(--color-danger)]/90 touch-target transition-colors"
          >
            <RiDeleteBinLine className="w-3.5 h-3.5" />
            <span>Purge Workspace</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Purge */}
      <ResponsiveModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        title="Confirm Scoped Purge"
        description="This action will delete all financial data associated with your user account."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-[var(--radius-base)] text-xs text-[var(--color-danger)]">
            <span className="font-bold">Warning: </span> All your wallets, income records, spending bills,
            and budgets will be irreversibly erased from the PostgreSQL database.
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Type <span className="font-mono text-[var(--color-danger)] font-bold">PERMANENTLY DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="PERMANENTLY DELETE"
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-mono text-sm focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            />
          </div>

          {purgeError && <p className="text-xs text-[var(--color-danger)]">{purgeError}</p>}

          <div className="pt-3 border-t border-[var(--color-border)] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsPurgeModalOpen(false)}
              className="px-4 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-primary-bg)] touch-target"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={confirmInput !== 'PERMANENTLY DELETE' || isPurging}
              onClick={handleExecutePurge}
              className="px-4 py-2 rounded-[var(--radius-base)] bg-[var(--color-danger)] text-white text-xs font-semibold hover:bg-[var(--color-danger)]/90 disabled:opacity-50 touch-target"
            >
              {isPurging ? 'Purging...' : 'Delete Everything'}
            </button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
};

