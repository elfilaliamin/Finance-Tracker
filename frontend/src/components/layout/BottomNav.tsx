import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  TrendingUp,
  MoreHorizontal,
  FolderKanban,
  Target,
  FileSpreadsheet,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const primaryNav = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/spending', label: 'Spending', icon: Receipt },
  { path: '/net-worth', label: 'Net Worth', icon: Wallet },
  { path: '/income', label: 'Income', icon: TrendingUp },
];

const secondaryNav = [
  { path: '/income-sources', label: 'Income Sources', icon: FolderKanban },
  { path: '/budgets', label: 'Budgets & Goals', icon: Target },
  { path: '/reports', label: 'Reports', icon: FileSpreadsheet },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg md:hidden pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center h-full touch-target text-[11px] font-medium transition-colors ${
                    isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                <Icon size={20} className="mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* More Action */}
          <button
            type="button"
            onClick={() => setShowMore(true)}
            aria-label="Open more navigation options"
            className={`flex flex-col items-center justify-center h-full touch-target text-[11px] font-medium transition-colors ${
              showMore ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MoreHorizontal size={20} className="mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet Drawer */}
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMore(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Menu */}
          <div className="relative bg-white rounded-t-2xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900">Navigation Menu</h3>
                {user && (
                  <p className="text-xs text-slate-500">
                    {user.email} &bull; <span className="font-medium text-indigo-600">{user.baseCurrency}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 touch-target"
                aria-label="Close menu"
              >
                <X size={20} />
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
                      `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors touch-target ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon size={20} className="text-slate-500" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowMore(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors touch-target"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

