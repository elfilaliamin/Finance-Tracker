import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Wallet,
  Receipt,
  TrendingUp,
  Target,
  ShieldCheck,
  Globe2,
  ArrowRight,
  PieChart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Wallet,
      title: 'Net Worth by Wallet',
      description: 'Track liquid assets, bank accounts, cash, and liabilities with manual adjustments and carry-forward balance snapshots.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: TrendingUp,
      title: 'Income Tracking',
      description: 'Monitor all revenue streams with color-coded sources. Strictly separated from wallet balances.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: Receipt,
      title: 'Itemized Spending',
      description: 'Log detailed receipts with line items, quantities, and merchant details. Deducts directly from your designated wallet.',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      icon: Target,
      title: 'Budgets & Goals',
      description: 'Set spending limits per category or wallet with 80%/100% threshold warnings, plus saving goals with target dates.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Globe2,
      title: 'Multi-Currency Core',
      description: 'Native MAD, USD, and EUR conversion with automated live rates and point-in-time historical valuation.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: ShieldCheck,
      title: '100% Private & Self-Hosted',
      description: 'Runs on your own server with Docker and PostgreSQL. Your financial data never leaves your infrastructure.',
      color: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-sm">
              FT
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Finance-Tracker</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors touch-target"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors touch-target"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-indigo-700 mb-6">
          <PieChart size={14} />
          <span>Self-Hosted Personal Wealth & Spending System</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6 max-w-4xl">
          Take control of your wealth with <span className="text-indigo-600">clarity and privacy.</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 max-w-2xl">
          Track multi-currency income, net worth across wallets, itemized receipt spending, and visual saving goals — without vendor lock-in or third-party tracking.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 shadow-md transition-all touch-target"
          >
            <span>Create Free Account</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-base hover:bg-slate-50 shadow-sm transition-all touch-target"
          >
            Sign In to Existing Account
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Engineered for financial discipline</h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Designed from first principles to separate revenue tracking from cash pool balances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Finance-Tracker</span>
            <span>&bull; Self-Hosted Financial Freedom</span>
          </div>
          <p className="text-xs text-slate-500">English Only &bull; Open-Source &bull; Docker Ready</p>
        </div>
      </footer>
    </div>
  );
};

