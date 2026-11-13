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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:p-6 w-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base md:text-lg">{title}</h3>
          {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="self-start sm:self-auto">{action}</div>}
      </div>

      <div style={{ height: `${height}px`, width: '100%' }} className="relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};

