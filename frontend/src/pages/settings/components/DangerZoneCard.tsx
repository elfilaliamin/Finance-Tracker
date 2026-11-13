import React, { useState } from 'react';
import { Download, Upload, Trash2, AlertOctagon } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertOctagon size={18} />
        </div>
        <div>
          <h3 className="font-bold text-rose-950 text-base">Workspace Data & Danger Zone</h3>
          <p className="text-xs text-rose-700/80">Manage tenant backups, restorations, and resets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Export Backup */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Export JSON Backup</h4>
            <p className="text-[11px] text-slate-500">
              Download complete serialized package of your wallets, incomes, spendings, and budgets.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 touch-target"
          >
            <Download size={14} />
            <span>Download Backup</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Restore from Backup</h4>
            <p className="text-[11px] text-slate-500">
              Import a previously exported JSON workspace with dry-run conflict validation.
            </p>
          </div>
          <button
            onClick={onOpenImportModal}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 touch-target"
          >
            <Upload size={14} />
            <span>Launch Restore Wizard</span>
          </button>
        </div>

        {/* Purge Everything */}
        <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-900 mb-1">Purge Workspace</h4>
            <p className="text-[11px] text-rose-700">
              Permanently wipe all wallets, ledgers, and transactions. Cannot be undone!
            </p>
          </div>
          <button
            onClick={() => {
              setConfirmInput('');
              setIsPurgeModalOpen(true);
            }}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 touch-target"
          >
            <Trash2 size={14} />
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
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            <span className="font-bold">Warning: </span> All your wallets, income records, spending bills,
            and budgets will be irreversibly erased from the PostgreSQL database.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Type <span className="font-mono text-rose-700 font-bold">PERMANENTLY DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="PERMANENTLY DELETE"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm"
            />
          </div>

          {purgeError && <p className="text-xs text-rose-600">{purgeError}</p>}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsPurgeModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 touch-target"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={confirmInput !== 'PERMANENTLY DELETE' || isPurging}
              onClick={handleExecutePurge}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 touch-target"
            >
              {isPurging ? 'Purging...' : 'Delete Everything'}
            </button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
};

