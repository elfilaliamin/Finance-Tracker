import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  RiDashboardLine,
  RiReceiptLine,
  RiWallet3Line,
  RiArrowUpCircleLine,
  RiMoreFill,
  RiBriefcaseLine,
  RiFocus3Line,
  RiFileChartLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiCloseLine,
  RiSunLine,
  RiMoonLine,
} from '@remixicon/react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const primaryNav = [
  { path: '/dashboard', label: 'Home', icon: RiDashboardLine },
  { path: '/spending', label: 'Spending', icon: RiReceiptLine },
  { path: '/net-worth', label: 'Net Worth', icon: RiWallet3Line },
  { path: '/income', label: 'Income', icon: RiArrowUpCircleLine },
];

const secondaryNav = [
  { path: '/wallets', label: 'Wallets', icon: RiWallet3Line },
  { path: '/income-sources', label: 'Income Sources', icon: RiBriefcaseLine },
  { path: '/budgets', label: 'Budgets & Goals', icon: RiFocus3Line },
  { path: '/reports', label: 'Reports', icon: RiFileChartLine },
  { path: '/settings', label: 'Settings', icon: RiSettings3Line },
];

export const BottomNav: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[var(--shadow-lg)] lg:hidden pb-[var(--safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center h-full touch-target text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'text-[color:var(--color-primary-text)] font-semibold'
                      : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]'
                  }`
                }
              >
                <Icon size={20} className="mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* More Action Drawer Trigger */}
          <button
            type="button"
            onClick={() => setShowMore(true)}
            aria-label="Open more navigation options"
            className={`flex flex-col items-center justify-center h-full touch-target text-[10px] font-medium transition-colors ${
              showMore
                ? 'text-[color:var(--color-primary-text)] font-semibold'
                : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]'
            }`}
          >
            <RiMoreFill size={20} className="mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet Drawer */}
      {showMore && (
        <div className="fixed inset-0 z-[var(--z-modal)] lg:hidden flex flex-col justify-end">
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-[var(--color-scrim)] transition-opacity"
            onClick={() => setShowMore(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Menu */}
          <div className="relative bg-[var(--color-surface)] rounded-t-[var(--radius-surface)] border-t border-[var(--color-border)] shadow-[var(--shadow-lg)] p-4 max-h-[85vh] overflow-y-auto pb-[calc(1.5rem+var(--safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <h3 className="font-bold text-[color:var(--color-text)] font-[family-name:var(--font-heading)]">
                  Menu & Preferences
                </h3>
                {user && (
                  <p className="text-xs text-[color:var(--color-muted)]">
                    {user.email} &bull; <span className="font-semibold text-[color:var(--color-primary-text)]">{user.baseCurrency}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] touch-target"
                aria-label="Close menu"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <div className="py-2 space-y-1">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMore(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-[var(--radius-base)] text-[length:var(--font-size-step-sub1)] font-medium transition-colors touch-target ${
                        isActive
                          ? 'bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] font-semibold'
                          : 'text-[color:var(--color-text)] hover:bg-[var(--color-background)]'
                      }`
                    }
                  >
                    <Icon size={20} className="text-[color:var(--color-muted)]" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-xs font-semibold text-[color:var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-background)] touch-target transition-colors"
              >
                {isDark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={() => {
                  setShowMore(false);
                  logout();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-[var(--radius-base)] text-xs font-semibold text-[color:var(--color-danger-text)] bg-[var(--color-danger-bg)] hover:brightness-95 touch-target transition-all"
              >
                <RiLogoutBoxRLine size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
