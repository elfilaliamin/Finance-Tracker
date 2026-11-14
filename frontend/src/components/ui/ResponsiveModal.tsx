import React, { useEffect, useRef } from 'react';
import { RiCloseLine } from '@remixicon/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  closeOnBackdrop?: boolean;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  closeOnBackdrop = true,
}) => {
  const { isMobile } = useBreakpoint();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Focus first focusable element
      setTimeout(() => {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        }
      }, 50);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        if (triggerRef.current) {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[var(--z-modal)] flex flex-col justify-end">
        {/* Backdrop Scrim */}
        <div
          className="fixed inset-0 bg-[var(--color-scrim)] backdrop-blur-[var(--blur-glass)] transition-opacity animate-in fade-in"
          onClick={closeOnBackdrop ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Mobile Bottom Sheet */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="relative bg-[var(--color-surface)] text-[color:var(--color-text)] rounded-t-[var(--radius-surface)] border-t border-[var(--color-border)] shadow-[var(--shadow-lg)] flex flex-col max-h-[92vh] pb-[calc(1rem+var(--safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200 z-10"
        >
          {/* Pull Bar */}
          <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto my-3 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-[var(--color-border)] shrink-0">
            <div>
              <h2 id="modal-title" className="text-[length:var(--font-size-step-1)] font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
                {title}
              </h2>
              {description && (
                <p className="text-[length:var(--font-size-step-sub1)] text-[color:var(--color-muted)] mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] rounded-[var(--radius-base)] touch-target transition-colors"
              aria-label="Close dialog"
            >
              <RiCloseLine size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    );
  }

  // Desktop / Tablet Centered Dialog
  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--color-scrim)] backdrop-blur-[var(--blur-glass)] transition-opacity animate-in fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Centered Modal Surface */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative bg-[var(--color-surface)] text-[color:var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-surface)] shadow-[var(--shadow-lg)] w-full ${maxWidthClasses} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <h2 id="modal-title" className="text-[length:var(--font-size-step-2)] font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
              {title}
            </h2>
            {description && (
              <p className="text-[length:var(--font-size-step-sub1)] text-[color:var(--color-muted)] mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] rounded-[var(--radius-base)] touch-target transition-colors"
            aria-label="Close dialog"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
