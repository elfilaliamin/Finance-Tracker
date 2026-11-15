import React, { useState } from 'react';
import { RiFilter3Line, RiCloseLine, RiCheckLine } from '@remixicon/react';
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
      <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[color:var(--color-muted)] text-[length:var(--font-size-step-sub1)] font-semibold uppercase tracking-wider shrink-0">
            <RiFilter3Line size={16} />
            <span>Filters:</span>
          </div>
          <div className="flex-1 flex flex-wrap items-center gap-3">{children}</div>
          {activeCount > 0 && onClear && (
            <button
              onClick={onClear}
              className="text-[length:var(--font-size-step-sub1)] font-medium text-[color:var(--color-muted)] hover:text-[color:var(--color-danger-text)] transition-colors px-2 py-1.5 touch-target"
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
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-base)] text-[length:var(--font-size-step-sub1)] font-medium border touch-target transition-colors ${
            activeCount > 0
              ? 'bg-[var(--color-primary-bg)] border-[var(--color-primary)] text-[color:var(--color-primary-text)] font-semibold'
              : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[color:var(--color-text)] shadow-[var(--shadow-sm)]'
          }`}
        >
          <RiFilter3Line size={16} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] text-[10px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-[length:var(--font-size-step-sub1)] text-[color:var(--color-danger-text)] font-medium px-2 py-1 touch-target"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-[var(--color-scrim)] transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-[var(--color-surface)] rounded-t-[var(--radius-surface)] shadow-[var(--shadow-lg)] p-4 flex flex-col max-h-[85vh] pb-[calc(1.5rem+var(--safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200 z-10 border-t border-[var(--color-border)]">
            <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-3 shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] shrink-0">
              <h3 className="font-bold text-[color:var(--color-text)] text-[length:var(--font-size-step-1)] font-[family-name:var(--font-heading)]">
                {title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] rounded-[var(--radius-base)] touch-target"
                aria-label="Close filters"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1">{children}</div>

            <div className="pt-3 border-t border-[var(--color-border)] flex items-center gap-2 shrink-0">
              {onClear && (
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[length:var(--font-size-step-sub1)] font-medium text-[color:var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-background)] touch-target transition-colors"
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
                className="flex-1 py-2.5 px-4 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] text-[length:var(--font-size-step-sub1)] font-semibold hover:brightness-110 shadow-[var(--shadow-base)] flex items-center justify-center gap-1.5 touch-target transition-all"
              >
                <RiCheckLine size={18} />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
