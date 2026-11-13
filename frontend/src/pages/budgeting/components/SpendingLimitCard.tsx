import React from 'react';
import { AlertTriangle, CheckCircle, Flame, Trash2 } from 'lucide-react';
import { Budget } from '@/api/budgetApi';

interface SpendingLimitCardProps {
  budget: Budget;
  onDelete: (id: string) => void;
}

export const SpendingLimitCard: React.FC<SpendingLimitCardProps> = ({ budget, onDelete }) => {
  const progress = budget.progress || {
    currentAmount: '0',
    percentage: 0,
    status: 'normal',
    remainingAmount: budget.targetAmount,
  };

  const pct = Math.min(progress.percentage, 100);
  const target = parseFloat(budget.targetAmount);
  const current = parseFloat(progress.currentAmount);

  // Status color schemes:
  // Normal (<80%): Emerald
  // Warning (80-99%): Amber
  // Exceeded (>=100%): Rose
  const statusConfig = {
    normal: {
      color: 'bg-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: CheckCircle,
      label: 'Within Budget',
    },
    warning: {
      color: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertTriangle,
      label: 'Near Limit (>=80%)',
    },
    exceeded: {
      color: 'bg-rose-500',
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: Flame,
      label: 'Exceeded Limit',
    },
  }[progress.status] || {
    color: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
    label: 'Within Budget',
  };

  const Icon = statusConfig.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{budget.name}</h3>
            <span className="text-xs text-slate-400 capitalize">{budget.period} limit</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
          >
            <Icon size={13} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-600">
              Spent: {current.toFixed(2)} {budget.currency}
            </span>
            <span className="text-slate-900 font-bold font-mono">{progress.percentage.toFixed(0)}%</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${statusConfig.color} transition-all duration-500 rounded-full`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <span>Target: {target.toFixed(2)} {budget.currency}</span>
          <span>
            {progress.status === 'exceeded'
              ? `Over by ${(current - target).toFixed(2)} ${budget.currency}`
              : `Remaining: ${progress.remainingAmount} ${budget.currency}`}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <button
          onClick={() => {
            if (confirm(`Delete budget "${budget.name}"?`)) {
              onDelete(budget.id);
            }
          }}
          className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 touch-target py-1 px-2"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

