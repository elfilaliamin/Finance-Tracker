import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface ResponsiveChartWrapperProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  mobileHeight?: number;
  desktopHeight?: number;
}

export const ResponsiveChartWrapper: React.FC<ResponsiveChartWrapperProps> = ({
  title,
  subtitle,
  action,
  children,
  mobileHeight = 240,
  desktopHeight = 320,
}) => {
  const { isMobile } = useBreakpoint();
  const height = isMobile ? mobileHeight : desktopHeight;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-base)] p-4 md:p-6 w-full flex flex-col transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-[color:var(--color-text)] font-[family-name:var(--font-heading)] text-[length:var(--font-size-step-1)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[length:var(--font-size-step-sub1)] text-[color:var(--color-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="self-start sm:self-auto">{action}</div>}
      </div>

      <div style={{ height: `${height}px`, width: '100%' }} className="relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};
