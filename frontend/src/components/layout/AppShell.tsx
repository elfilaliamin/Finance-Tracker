import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar, navGroups } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { AppLogo } from '@/components/ui/AppLogo';
import { RiSunLine, RiMoonLine } from '@remixicon/react';

export const AppShell: React.FC = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const [collapsedTablet, setCollapsedTablet] = useState(true);
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { avatar } = useUserAvatar();
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
        {/* Top Header: Solid modern bar without glass effect */}
        <header className="sticky top-0 z-[var(--z-sticky)] h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-6 flex items-center justify-between shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Link to="/dashboard" className="shrink-0 flex items-center shadow-xs rounded-[var(--radius-base)]" title="Finance Tracker">
                <AppLogo size={32} />
              </Link>
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

          <div className="flex items-center gap-3">
            {/* User Profile Pill with Avatar & Name */}
            {user && (
              <Link
                to="/settings"
                title="Manage profile & avatar in Settings"
                className="flex items-center gap-2.5 p-0 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-[var(--color-primary-bg)] border-0 sm:border sm:border-[var(--color-border)] transition-colors group"
              >
                {/* Avatar Image or Initials */}
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user.name || user.email}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-accent)] shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs shrink-0 border-2 border-[var(--color-accent)]">
                    {(user.name || user.email).charAt(0)}
                  </div>
                )}
                <div className="flex flex-col text-left hidden sm:flex min-w-0 pr-1">
                  <span className="text-xs font-semibold text-[var(--color-text)] leading-tight truncate max-w-[130px]">
                    {user.name || user.email}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono leading-tight">
                    {user.baseCurrency} Base
                  </span>
                </div>
              </Link>
            )}

            {/* Quick theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              className="p-2 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
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
