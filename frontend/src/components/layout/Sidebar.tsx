import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  RiDashboardLine,
  RiReceiptLine,
  RiWallet3Line,
  RiArrowUpCircleLine,
  RiBriefcaseLine,
  RiFocus3Line,
  RiFileChartLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSunLine,
  RiMoonLine,
} from '@remixicon/react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AppLogo } from '@/components/ui/AppLogo';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface NavGroup {
  group: string;
  items: {
    path: string;
    label: string;
    icon: React.ComponentType<any>;
  }[];
}

export const navGroups: NavGroup[] = [
  {
    group: 'Core System',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
      { path: '/spending', label: 'Spending', icon: RiReceiptLine },
      { path: '/net-worth', label: 'Net Worth', icon: RiWallet3Line },
      { path: '/income', label: 'Income', icon: RiArrowUpCircleLine },
    ],
  },
  {
    group: 'Planning & Audit',
    items: [
      { path: '/income-sources', label: 'Income Sources', icon: RiBriefcaseLine },
      { path: '/budgets', label: 'Budgets & Goals', icon: RiFocus3Line },
      { path: '/reports', label: 'Reports', icon: RiFileChartLine },
    ],
  },
  {
    group: 'Preferences',
    items: [
      { path: '/settings', label: 'Settings', icon: RiSettings3Line },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-[var(--z-sticky)] flex flex-col bg-[var(--color-surface)] text-[color:var(--color-text)] transition-all duration-[var(--duration-base)] border-r border-[var(--color-border)] ${
        collapsed ? 'w-20' : 'w-64 xl:w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <AppLogo size={32} />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[length:var(--font-size-step-1)] font-[family-name:var(--font-heading)] tracking-tight text-[color:var(--color-text)] truncate">
                Finance Tracker
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <AppLogo size={32} />
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] touch-target transition-colors"
          >
            {collapsed ? <RiArrowRightSLine size={18} /> : <RiArrowLeftSLine size={18} />}
          </button>
        )}
      </div>

      {/* Classic-Grouped Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto" role="navigation" aria-label="Main Navigation">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-muted)] mb-1">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-base)] text-[length:var(--font-size-step-sub1)] font-medium transition-all touch-target ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-semibold shadow-[var(--shadow-sm)]'
                        : 'text-[color:var(--color-muted)] hover:bg-[var(--color-primary-bg)] hover:text-[color:var(--color-primary-text)]'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                >
                  <Icon size={19} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Controls: Workspace, Theme & Logout */}
      <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-[color:var(--color-text)] truncate">
                {user.name || user.email}
              </p>
              <p className="text-[10px] text-[color:var(--color-muted)] uppercase tracking-wider font-mono">
                {user.baseCurrency} Base
              </p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              className="p-1.5 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
            </button>
          </div>
        )}

        {collapsed && (
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            className="w-full flex items-center justify-center p-2 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
          </button>
        )}

        <button
          onClick={() => logout()}
          title="Sign out"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-base)] text-[length:var(--font-size-step-sub1)] font-medium text-[color:var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors touch-target ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <RiLogoutBoxRLine size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
