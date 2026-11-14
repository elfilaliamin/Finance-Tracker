import React from 'react';
import { RiFocus3Line, RiCalendarLine, RiCheckboxCircleLine, RiDeleteBinLine } from '@remixicon/react';
import { Budget } from '@/api/budgetApi';

interface SavingGoalCardProps {
  goal: Budget;
  onDelete: (id: string) => void;
}

export const SavingGoalCard: React.FC<SavingGoalCardProps> = ({ goal, onDelete }) => {
  const progress = goal.progress || {
    currentAmount: '0',
    percentage: 0,
    status: 'normal',
    remainingAmount: goal.targetAmount,
    requiredMonthlySavings: '0.00',
  };

  const pct = Math.min(progress.percentage, 100);
  const target = parseFloat(goal.targetAmount);
  const current = parseFloat(progress.currentAmount);
  const isReached = pct >= 100;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
              <RiFocus3Line className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[var(--color-text)] text-base">{goal.name}</h3>
              {goal.endDate && (
                <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                  <RiCalendarLine className="w-3 h-3" /> Target: {goal.endDate}
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold border ${
              isReached
                ? 'bg-[var(--color-primary-bg)] text-[var(--color-accent)] border-[var(--color-border)]'
                : 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20'
            }`}
          >
            {isReached ? <RiCheckboxCircleLine className="w-3.5 h-3.5" /> : null}
            <span>{isReached ? 'Goal Reached!' : `${progress.percentage.toFixed(0)}% Saved`}</span>
          </span>
        </div>

        {/* Balance vs Target */}
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-[var(--color-text)]">
              Current: {current.toFixed(2)} {goal.currency}
            </span>
            <span className="text-[var(--color-text)] font-bold font-mono">
              Target: {target.toFixed(2)} {goal.currency}
            </span>
          </div>

          <div className="w-full h-3 bg-[var(--color-primary-bg)] rounded-[var(--radius-pill)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] transition-all duration-500 rounded-[var(--radius-pill)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Required Monthly Contribution */}
        {progress.requiredMonthlySavings && parseFloat(progress.requiredMonthlySavings) > 0 && !isReached && (
          <div className="p-2.5 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-[var(--radius-base)] mt-3 text-xs text-[var(--color-text)]">
            <span className="font-semibold text-[var(--color-text-muted)]">Required Savings: </span>
            <span className="font-bold font-mono text-[var(--color-accent)]">
              ~{progress.requiredMonthlySavings} {goal.currency}/month
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex justify-end">
        <button
          onClick={() => {
            if (confirm(`Delete saving goal "${goal.name}"?`)) {
              onDelete(goal.id);
            }
          }}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] font-medium flex items-center gap-1 touch-target py-1 px-2"
        >
          <RiDeleteBinLine className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

