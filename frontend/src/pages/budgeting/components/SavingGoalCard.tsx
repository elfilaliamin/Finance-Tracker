import React from 'react';
import {
  RiFocus3Line,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiDeleteBinLine,
  RiEditLine,
  RiWallet3Line,
} from '@remixicon/react';
import { Budget } from '@/api/budgetApi';

interface SavingGoalCardProps {
  goal: Budget;
  onEdit: (goal: Budget) => void;
  onDelete: (id: string) => void;
}

export const SavingGoalCard: React.FC<SavingGoalCardProps> = ({ goal, onEdit, onDelete }) => {
  // Directly reflect the money in the linked wallet
  const currentAmountStr =
    goal.currentAmount ??
    goal.progress?.currentAmount ??
    goal.wallet?.currentBalance ??
    '0';
  const target = parseFloat(goal.targetAmount) || 0;
  const current = parseFloat(currentAmountStr) || 0;

  const pct = target > 0 ? (current / target) * 100 : 0;
  const clampedPct = Math.min(Math.max(pct, 0), 100);
  const isReached = current >= target && target > 0;
  const remaining = Math.max(0, target - current);

  const requiredMonthly =
    goal.requiredMonthlySavings ?? goal.progress?.requiredMonthlySavings;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-base)] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <RiFocus3Line className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[var(--color-text)] text-base">
                {goal.name}
              </h3>
              {goal.wallet && (
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                  <RiWallet3Line className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Wallet:{' '}
                    <strong className="text-[var(--color-text)] font-semibold">
                      {goal.wallet.name}
                    </strong>
                  </span>
                </span>
              )}
              {goal.endDate && (
                <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                  <RiCalendarLine className="w-3 h-3" /> Target Date: {goal.endDate}
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold border ${
              isReached
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80'
            }`}
          >
            {isReached ? <RiCheckboxCircleLine className="w-3.5 h-3.5" /> : null}
            <span>{isReached ? 'Goal Reached!' : `${pct.toFixed(0)}% Saved`}</span>
          </span>
        </div>

        {/* Balance vs Target */}
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-[var(--color-text)]">
              Wallet Balance:{' '}
              <strong className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {current.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {goal.currency}
              </strong>
            </span>
            <span className="text-[var(--color-text)] font-bold font-mono">
              Target:{' '}
              {target.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {goal.currency}
            </span>
          </div>

          <div className="w-full h-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-[var(--radius-pill)] overflow-hidden border border-[var(--color-border)]">
            <div
              className={`h-full transition-all duration-500 rounded-[var(--radius-pill)] ${
                isReached ? 'bg-emerald-600' : 'bg-[var(--color-primary)]'
              }`}
              style={{ width: `${clampedPct}%` }}
            />
          </div>

          {!isReached && (
            <div className="flex justify-between items-center text-[11px] text-[var(--color-text-muted)] mt-1">
              <span>
                Remaining:{' '}
                <strong>
                  {remaining.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {goal.currency}
                </strong>
              </span>
              <span>{pct.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Required Monthly Contribution */}
        {requiredMonthly && parseFloat(requiredMonthly) > 0 && !isReached && (
          <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-[var(--radius-base)] mt-3 text-xs text-[var(--color-text)]">
            <span className="font-semibold text-[var(--color-text-muted)]">
              Required Savings:{' '}
            </span>
            <span className="font-bold font-mono text-emerald-800 dark:text-emerald-300">
              ~{requiredMonthly} {goal.currency}/month
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-1.5">
        <button
          onClick={() => onEdit(goal)}
          className="p-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 rounded-[var(--radius-base)] hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors touch-target"
          title="Edit saving goal"
        >
          <RiEditLine className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete saving goal "${goal.name}"?`)) {
              onDelete(goal.id);
            }
          }}
          className="p-1.5 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 rounded-[var(--radius-base)] hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors touch-target"
          title="Delete saving goal"
        >
          <RiDeleteBinLine className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

