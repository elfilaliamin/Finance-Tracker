import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/layout/AppShell';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Protected Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { IncomePage } from '@/pages/income/IncomePage';
import { IncomeSourcesPage } from '@/pages/income/IncomeSourcesPage';
import { NetworthPage } from '@/pages/networth/NetworthPage';
import { SpendingPage } from '@/pages/spending/SpendingPage';
import { BudgetingPage } from '@/pages/budgeting/BudgetingPage';
import { ReportPage } from '@/pages/reports/ReportPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

// Error Pages
import { NotFoundPage } from '@/pages/error/NotFoundPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/income-sources" element={<IncomeSourcesPage />} />
        <Route path="/net-worth" element={<NetworthPage />} />
        <Route path="/spending" element={<SpendingPage />} />
        <Route path="/budgets" element={<BudgetingPage />} />
        <Route path="/reports" element={<ReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

