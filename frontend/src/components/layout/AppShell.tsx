import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, navItems } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/hooks/useAuth';

export const AppShell: React.FC = () => {
  const { breakpoint, isMobile, isTablet } = useBreakpoint();
  const [collapsedTablet, setCollapsedTablet] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  // Find active page title
  const currentNav = navItems.find((item) => item.path === location.pathname);
  const pageTitle = currentNav?.label || 'Finance-Tracker';

  const isCollapsed = isTablet ? collapsedTablet : false;
  const sidebarWidthClass = isMobile ? 'ml-0' : isCollapsed ? 'ml-20' : 'ml-64';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Desktop / Tablet Sidebar */}
      {!isMobile && (
        <Sidebar
          collapsed={isCollapsed}
          onToggleCollapse={isTablet ? () => setCollapsedTablet(!collapsedTablet) : undefined}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarWidthClass}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shrink-0">
                FT
              </div>
            )}
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {user.baseCurrency}
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-500 font-medium truncate max-w-[140px]">
                  {user.name || user.email}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <main className={`flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto ${isMobile ? 'pb-24' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <BottomNav />}
    </div>
  );
};

