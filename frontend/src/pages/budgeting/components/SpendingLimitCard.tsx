import React from 'react';
import { RiAlertLine, RiCheckboxCircleLine, RiFireLine, RiDeleteBinLine } from '@remixicon/react';
import { Budget } from '@/api/budgetApi';

interface SpendingLimitCardProps {
  budget: Budget;
  onDelete: (id: string) => void;
}

export const SpendingLimitCard: React.FC<SpendingLimitCardProps> = ({ budget, onDelete }) => {
  const currentAmountStr = budget.currentAmount ?? budget.spentAmount ?? budget.progress?.currentAmount ?? '0';
  const percentageNum = budget.percentage ?? budget.progress?.percentage ?? 0;
  const statusStr = budget.status ?? budget.progress?.status ?? 'normal';
  const remainingStr = budget.remainingAmount ?? budget.progress?.remainingAmount ?? budget.targetAmount;

  const progress = {
    currentAmount: currentAmountStr,
    percentage: percentageNum,
    status: statusStr,
    remainingAmount: remainingStr,
  };

  const pct = Math.min(progress.percentage, 100);
  const target = parseFloat(budget.targetAmount);
  const current = parseFloat(progress.currentAmount);

  // Status color schemes:
  // Normal (<80%): Emerald / Accent
  // Warning (80-99%): Amber / Warning
  // Exceeded (>=100%): Rose / Danger
  const statusConfig = {
    normal: {
      color: 'bg-[var(--color-accent)]',
      text: 'text-[var(--color-accent)]',
      bg: 'bg-[var(--color-primary-bg)]',
      border: 'border-[var(--color-border)]',
      icon: RiCheckboxCircleLine,
      label: 'Within Budget',
    },
    warning: {
      color: 'bg-[var(--color-warning)]',
      text: 'text-[var(--color-warning)]',
      bg: 'bg-[var(--color-warning)]/10',
      border: 'border-[var(--color-warning)]/20',
      icon: RiAlertLine,
      label: 'Near Limit (>=80%)',
    },
    exceeded: {
      color: 'bg-[var(--color-danger)]',
      text: 'text-[var(--color-danger)]',
      bg: 'bg-[var(--color-danger)]/10',
      border: 'border-[var(--color-danger)]/20',
      icon: RiFireLine,
      label: 'Exceeded Limit',
    },
  }[progress.status] || {
    color: 'bg-[var(--color-accent)]',
    text: 'text-[var(--color-accent)]',
    bg: 'bg-[var(--color-primary-bg)]',
    border: 'border-[var(--color-border)]',
    icon: RiCheckboxCircleLine,
    label: 'Within Budget',
  };

  const Icon = statusConfig.icon;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-heading font-bold text-[var(--color-text)] text-base">{budget.name}</h3>
            <span className="text-xs text-[var(--color-text-muted)] capitalize">{budget.period} limit</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-[var(--color-text)]">
              Spent: {current.toFixed(2)} {budget.currency}
            </span>
            <span className="text-[var(--color-text)] font-bold font-mono">{progress.percentage.toFixed(0)}%</span>
          </div>

          <div className="w-full h-3 bg-[var(--color-primary-bg)] rounded-[var(--radius-pill)] overflow-hidden">
            <div
              className={`h-full ${statusConfig.color} transition-all duration-500 rounded-[var(--radius-pill)]`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mt-2">
          <span>Target: {target.toFixed(2)} {budget.currency}</span>
          <span>
            {progress.status === 'exceeded'
              ? `Over by ${(current - target).toFixed(2)} ${budget.currency}`
              : `Remaining: ${progress.remainingAmount} ${budget.currency}`}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex justify-end">
        <button
          onClick={() => {
            if (confirm(`Delete budget "${budget.name}"?`)) {
              onDelete(budget.id);
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

