import React, { useState } from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { settingsApi } from '@/api/settingsApi';
import { Upload, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fileContent, setFileContent] = useState<any | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [dryRunResult, setDryRunResult] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setDryRunResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        setFileContent(parsed);

        // Immediately trigger dry-run
        setIsValidating(true);
        const result = await settingsApi.dryRunImport(parsed);
        setDryRunResult(result);
      } catch (err: any) {
        setError(err.message || 'Failed to parse JSON file.');
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!fileContent) return;
    try {
      setIsImporting(true);
      setError(null);
      await settingsApi.executeImport(fileContent);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Import execution failed.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Workspace JSON"
      description="Restore backup data into your account with dry-run validation."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* File Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Backup File (.json)
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
              id="backupFileInput"
            />
            <label htmlFor="backupFileInput" className="cursor-pointer flex flex-col items-center">
              <Upload size={28} className="text-indigo-600 mb-2" />
              <span className="text-sm font-semibold text-slate-800">
                {fileName || 'Click to browse backup file'}
              </span>
              <span className="text-xs text-slate-500 mt-0.5">finance-tracker-backup.json</span>
            </label>
          </div>
        </div>

        {isValidating && (
          <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing backup package schema & integrity...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Dry Run Report */}
        {dryRunResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 size={16} />
              <span>Dry-Run Analysis Succeeded</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Wallets</span>
                <span className="font-bold text-slate-800 font-mono">
                  {dryRunResult.walletsCount ?? dryRunResult.wallets?.length ?? 0}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Incomes</span>
                <span className="font-bold text-slate-800 font-mono">
                  {dryRunResult.incomesCount ?? dryRunResult.incomes?.length ?? 0}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Spendings</span>
                <span className="font-bold text-slate-800 font-mono">
                  {dryRunResult.spendingsCount ?? dryRunResult.spendings?.length ?? 0}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Categories</span>
                <span className="font-bold text-slate-800 font-mono">
                  {dryRunResult.categoriesCount ?? 0}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Budgets</span>
                <span className="font-bold text-slate-800 font-mono">
                  {dryRunResult.budgetsCount ?? dryRunResult.budgets?.length ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 touch-target"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={!dryRunResult || isImporting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md disabled:opacity-60 touch-target"
          >
            {isImporting ? 'Restoring...' : 'Confirm & Restore'}
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

