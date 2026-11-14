import React, { useState } from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { settingsApi } from '@/api/settingsApi';
import { RiUploadLine, RiCheckboxCircleLine, RiAlertLine } from '@remixicon/react';

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
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Select Backup File (.json)
          </label>
          <div className="border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-base)] p-6 text-center hover:border-[var(--color-ring)] transition-colors bg-[var(--color-primary-bg)]">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
              id="backupFileInput"
            />
            <label htmlFor="backupFileInput" className="cursor-pointer flex flex-col items-center">
              <RiUploadLine className="w-8 h-8 text-[var(--color-accent)] mb-2" />
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {fileName || 'Click to browse backup file'}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] mt-0.5">finance-tracker-backup.json</span>
            </label>
          </div>
        </div>

        {isValidating && (
          <div className="py-4 text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <span>Analyzing backup package schema & integrity...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-[var(--radius-base)] text-xs text-[var(--color-danger)] flex items-start gap-2">
            <RiAlertLine className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Dry Run Report */}
        {dryRunResult && (
          <div className="bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-[var(--radius-base)] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--color-accent)] font-bold text-xs uppercase tracking-wider">
              <RiCheckboxCircleLine className="w-4 h-4" />
              <span>Dry-Run Analysis Succeeded</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-[var(--color-surface)] p-2 rounded-[var(--radius-base)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] block text-[10px]">Wallets</span>
                <span className="font-bold text-[var(--color-text)] font-mono">
                  {dryRunResult.walletsCount ?? dryRunResult.wallets?.length ?? 0}
                </span>
              </div>
              <div className="bg-[var(--color-surface)] p-2 rounded-[var(--radius-base)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] block text-[10px]">Incomes</span>
                <span className="font-bold text-[var(--color-text)] font-mono">
                  {dryRunResult.incomesCount ?? dryRunResult.incomes?.length ?? 0}
                </span>
              </div>
              <div className="bg-[var(--color-surface)] p-2 rounded-[var(--radius-base)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] block text-[10px]">Spendings</span>
                <span className="font-bold text-[var(--color-text)] font-mono">
                  {dryRunResult.spendingsCount ?? dryRunResult.spendings?.length ?? 0}
                </span>
              </div>
              <div className="bg-[var(--color-surface)] p-2 rounded-[var(--radius-base)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] block text-[10px]">Categories</span>
                <span className="font-bold text-[var(--color-text)] font-mono">
                  {dryRunResult.categoriesCount ?? 0}
                </span>
              </div>
              <div className="bg-[var(--color-surface)] p-2 rounded-[var(--radius-base)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] block text-[10px]">Budgets</span>
                <span className="font-bold text-[var(--color-text)] font-mono">
                  {dryRunResult.budgetsCount ?? dryRunResult.budgets?.length ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[var(--color-border)] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-primary-bg)] touch-target"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={!dryRunResult || isImporting}
            className="px-5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-semibold shadow-[var(--shadow-sm)] disabled:opacity-60 touch-target"
          >
            {isImporting ? 'Restoring...' : 'Confirm & Restore'}
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

