import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface FilterDrawerProps {
  children: React.ReactNode;
  activeCount?: number;
  onClear?: () => void;
  onApply?: () => void;
  title?: string;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  children,
  activeCount = 0,
  onClear,
  onApply,
  title = 'Filter Records',
}) => {
  const { isMobile } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);

  // Desktop / Tablet: Inline bar
  if (!isMobile) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider shrink-0">
            <Filter size={16} />
            <span>Filters:</span>
          </div>
          <div className="flex-1 flex flex-wrap items-center gap-3">{children}</div>
          {activeCount > 0 && onClear && (
            <button
              onClick={onClear}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors px-2 py-1.5 touch-target"
            >
              Clear filters ({activeCount})
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mobile: Filter trigger button + Bottom sheet
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border touch-target transition-colors ${
            activeCount > 0
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <Filter size={16} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-xs text-rose-600 font-medium px-2 py-1 touch-target"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-t-2xl shadow-2xl p-4 flex flex-col max-h-[85vh] pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200 z-10">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-900 text-base">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full touch-target"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1">{children}</div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
              {onClear && (
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 touch-target"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (onApply) onApply();
                  setIsOpen(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-1.5 touch-target"
              >
                <Check size={18} />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

