import React from 'react';
import { Target, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Target size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{goal.name}</h3>
              {goal.endDate && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar size={11} /> Target: {goal.endDate}
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isReached
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}
          >
            {isReached ? <CheckCircle2 size={13} /> : null}
            <span>{isReached ? 'Goal Reached!' : `${progress.percentage.toFixed(0)}% Saved`}</span>
          </span>
        </div>

        {/* Balance vs Target */}
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-600">
              Current: {current.toFixed(2)} {goal.currency}
            </span>
            <span className="text-slate-900 font-bold font-mono">
              Target: {target.toFixed(2)} {goal.currency}
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-500 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Required Monthly Contribution */}
        {progress.requiredMonthlySavings && parseFloat(progress.requiredMonthlySavings) > 0 && !isReached && (
          <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl mt-3 text-xs text-purple-900">
            <span className="font-semibold">Required Savings: </span>
            <span className="font-bold font-mono">
              ~{progress.requiredMonthlySavings} {goal.currency}/month
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <button
          onClick={() => {
            if (confirm(`Delete saving goal "${goal.name}"?`)) {
              onDelete(goal.id);
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

