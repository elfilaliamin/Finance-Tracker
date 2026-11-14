import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, navGroups } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { RiSunLine, RiMoonLine } from '@remixicon/react';

export const AppShell: React.FC = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const [collapsedTablet, setCollapsedTablet] = useState(true);
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Find active nav item & group
  let pageTitle = 'Finance Tracker';
  let pageGroup = 'Application';
  for (const g of navGroups) {
    const found = g.items.find((i) => i.path === location.pathname);
    if (found) {
      pageTitle = found.label;
      pageGroup = g.group;
      break;
    }
  }

  const isCollapsed = isTablet ? collapsedTablet : false;
  const sidebarWidthClass = isMobile ? 'ml-0' : isCollapsed ? 'ml-20' : 'ml-64 xl:ml-72';

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[color:var(--color-text)] font-[family-name:var(--font-body)] flex flex-col">
      {/* Keyboard-Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-toast)] px-4 py-2 bg-[var(--color-primary)] text-[color:var(--color-on-primary)] rounded-[var(--radius-base)] shadow-[var(--shadow-lg)] font-medium text-sm transition-all"
      >
        Skip to main content
      </a>

      {/* Desktop / Tablet Sidebar (classic-grouped) */}
      {!isMobile && (
        <Sidebar
          collapsed={isCollapsed}
          onToggleCollapse={isTablet ? () => setCollapsedTablet(!collapsedTablet) : undefined}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-[var(--duration-base)] ${sidebarWidthClass}`}>
        {/* Top Header: minimal-center */}
        <header className="sticky top-0 z-[var(--z-sticky)] h-16 bg-[var(--color-surface)]/95 backdrop-blur-[var(--blur-glass)] border-b border-[var(--color-border)] px-4 md:px-6 flex items-center justify-between shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            {isMobile && (
              <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] flex items-center justify-center font-bold text-sm tracking-tight shrink-0 shadow-[var(--shadow-sm)]">
                FT
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-[color:var(--color-muted)] tracking-wider hidden sm:block">
                {pageGroup}
              </span>
              <h1 className="text-[length:var(--font-size-step-1)] md:text-[length:var(--font-size-step-2)] font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] tracking-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {user && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-pill)] text-xs font-semibold bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] border border-[var(--color-border)] font-mono">
                {user.baseCurrency}
              </span>
            )}

            {/* Quick theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              className="p-2 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] transition-colors touch-target"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <RiSunLine size={19} /> : <RiMoonLine size={19} />}
            </button>
          </div>
        </header>

        {/* Page Content Body bounded by 1280px */}
        <main
          id="main-content"
          className={`flex-1 p-4 md:p-6 lg:p-8 max-w-[var(--breakpoint-wide)] w-full mx-auto ${
            isMobile ? 'pb-24' : ''
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <BottomNav />}
    </div>
  );
};
