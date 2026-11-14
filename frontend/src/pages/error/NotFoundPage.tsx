import React from 'react';
import { Link } from 'react-router-dom';
import { RiHome4Line, RiCompassLine } from '@remixicon/react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Ambient gradient glow in background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 40%, var(--color-primary) 0%, transparent 60%)'
        }}
      />

      <div className="relative z-10 max-w-lg space-y-6">
        <div className="w-16 h-16 mx-auto rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center shadow-[var(--shadow-md)]">
          <RiCompassLine className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="font-heading font-black text-7xl sm:text-9xl tracking-tight text-[var(--color-accent)] block">
            404
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--color-text)] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-md mx-auto">
            The page you are looking for doesn't exist, has been relocated, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-base)] hover:shadow-[var(--shadow-hover)] transition-all touch-target"
          >
            <RiHome4Line className="w-5 h-5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
