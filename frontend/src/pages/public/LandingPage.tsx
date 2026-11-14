import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  RiWallet3Line,
  RiReceiptLine,
  RiArrowUpCircleLine,
  RiFocus3Line,
  RiShieldCheckLine,
  RiGlobalLine,
  RiArrowRightLine,
  RiCodeLine,
  RiSunLine,
  RiMoonLine,
  RiCheckLine,
  RiAddLine,
  RiSubtractLine,
} from '@remixicon/react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'income' | 'wallets' | 'spending' | 'budgets'>('income');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: RiWallet3Line,
      title: 'Net Worth by Wallet',
      description: 'Track liquid assets, checking accounts, cash, and liabilities with manual delta adjustments and carry-forward snapshots.',
      badge: 'Assets & Debts',
    },
    {
      icon: RiArrowUpCircleLine,
      title: 'Decoupled Income Engine',
      description: 'Monitor all revenue streams with color-coded sources. Completely isolated from wallet balances by design.',
      badge: 'Isolated Revenues',
    },
    {
      icon: RiReceiptLine,
      title: 'Itemized Receipt Spending',
      description: 'Log itemized bills with articles, quantities, unit prices, and merchant details. Deducts atomically from designated wallets.',
      badge: 'Itemized Accounting',
    },
    {
      icon: RiFocus3Line,
      title: 'Budgets & Saving Goals',
      description: 'Set spending limits with 80% warning and 100% exceeded thresholds, plus saving targets with required monthly contribution math.',
      badge: 'Visual Boundaries',
    },
    {
      icon: RiGlobalLine,
      title: 'Multi-Currency Core',
      description: 'Native MAD, USD, and EUR conversion with live automated rates and point-in-time historical valuation using decimal arithmetic.',
      badge: 'Live ECB & Open Rates',
    },
    {
      icon: RiShieldCheckLine,
      title: '100% Self-Hosted & Sovereign',
      description: 'Runs on your own Alpine Linux home server via Docker Compose and PostgreSQL 16. Your financial life never leaves your server.',
      badge: 'Zero Telemetry',
    },
  ];

  const workflowTabs = [
    {
      id: 'income',
      title: '1. Revenue Tracking',
      headline: 'Income Never Changes Wallets Automatically',
      content:
        'In true financial planning, revenue is not liquid cash until verified. Income entries specify date, source, category, and amount, but cannot be tied to a wallet foreign key.',
      codeSnippet: `// Income schema invariant: zero wallet association
POST /api/v1/incomes
{
  "date": "2026-11-14",
  "amount": 25000.00,
  "currency": "MAD",
  "sourceId": "client-acme-corp",
  "category": "Consulting"
  // Note: wallet_id strictly rejected by validator
}`,
    },
    {
      id: 'wallets',
      title: '2. Wallet Adjustments',
      headline: 'Snapshots & Count Reconciliation',
      content:
        'Wallets track asset pools (checking, cash, savings) and liabilities. Balances change exclusively via manual count reconciliation or itemized spending deductions.',
      codeSnippet: `// Atomic adjustment transaction
POST /api/v1/wallets/:id/adjustments
{
  "date": "2026-11-14",
  "amount": 14250.00,
  "type": "reconcile", // sets exact counted balance
  "notes": "Bank statement verification"
}`,
    },
    {
      id: 'spending',
      title: '3. Itemized Bills',
      headline: 'Invoice Mechanics with Line Items',
      content:
        'Spending records emulate a physical receipt. Each bill contains header metadata, optional paying wallet, and line items with quantities and unit prices.',
      codeSnippet: `// Spending bill with wallet deduction
POST /api/v1/spendings
{
  "date": "2026-11-14",
  "paidFromWalletId": "wallet-checking-01",
  "storeMerchant": "Supermarket",
  "items": [
    { "name": "Groceries", "unitPrice": 45.50, "quantity": 2 }
  ]
}`,
    },
    {
      id: 'budgets',
      title: '4. Progress Visuals',
      headline: 'Limits & Saving Targets',
      content:
        'Track spending caps across categories and saving goals towards specific milestones. Thresholds trigger green, amber (80%), and red (100%+) warnings.',
      codeSnippet: `// Budget progress aggregation
GET /api/v1/budgets/:id
{
  "targetAmount": "5000.00",
  "currentAmount": "4250.00",
  "percentage": 85.0,
  "status": "warning" // >=80% alert threshold
}`,
    },
  ];

  const faqs = [
    {
      q: 'Why does income never affect wallet balances?',
      a: 'This is a foundational invariant of Finance Tracker. Income records tell you where your earnings originated and in what currency. Wallet balances represent physical or digital money pools (cash, bank, crypto) and only change when you manually count/reconcile them or log an expense paid from that wallet.',
    },
    {
      q: 'Is multi-currency conversion accurate for past dates?',
      a: 'Yes. Every income and spending transaction records both the original currency amount and the base currency equivalent calculated using the historical exchange rate on the transaction date.',
    },
    {
      q: 'Can multiple users create independent accounts?',
      a: 'Yes. Finance Tracker is multi-tenant from day one. Every user registers their own email, password, and chosen base currency (MAD, USD, or EUR), and all domain data is strictly scoped by user ID in PostgreSQL.',
    },
    {
      q: 'What are the server resource requirements?',
      a: 'The complete stack runs comfortably on less than 832 MiB total RAM (PostgreSQL capped at 384M, Node backend at 384M, and Nginx at 64M). It is optimized for low-power home servers like an Intel i5-2410M.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[color:var(--color-text)] font-[family-name:var(--font-body)] flex flex-col">
      {/* 1. Navbar: minimal-center */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-[var(--blur-glass)] sticky top-0 z-[var(--z-sticky)]">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] flex items-center justify-center font-bold text-sm shadow-[var(--shadow-sm)]">
              FT
            </div>
            <span className="font-extrabold text-[length:var(--font-size-step-1)] font-[family-name:var(--font-heading)] tracking-tight text-[color:var(--color-text)]">
              Finance Tracker
            </span>
          </div>

          {/* Centered navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-[length:var(--font-size-step-sub1)] font-medium text-[color:var(--color-muted)]">
            <a href="#features" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              Architecture
            </a>
            <a href="#faq" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              className="p-2 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] transition-colors touch-target"
            >
              {isDark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            </button>
            <Link
              to="/login"
              className="px-3.5 py-2 text-[length:var(--font-size-step-sub1)] font-semibold text-[color:var(--color-text)] hover:text-[color:var(--color-primary-text)] transition-colors touch-target"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-[length:var(--font-size-step-sub1)] font-semibold text-[color:var(--color-on-primary)] bg-[var(--color-primary)] hover:brightness-110 rounded-[var(--radius-base)] shadow-[var(--shadow-sm)] transition-all touch-target"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero: warm-editorial hero-code-split */}
      <section className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Pitch (45%) */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-xs font-semibold text-[color:var(--color-primary-text)] mb-6">
              <RiShieldCheckLine size={14} />
              <span>Self-Hosted &bull; Multi-Currency &bull; Zero Tracking</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] tracking-tight leading-[1.15] mb-6">
              Take control of your wealth with <span className="text-[color:var(--color-primary-text)]">precision and privacy.</span>
            </h1>

            <p className="text-base sm:text-lg text-[color:var(--color-muted)] mb-8 max-w-xl leading-relaxed">
              Track multi-currency income, net worth across wallets, itemized receipt spending, and visual saving goals — deployed on your own infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-semibold text-[length:var(--font-size-step-0)] hover:brightness-110 shadow-[var(--shadow-base)] transition-all touch-target"
              >
                <span>Create Free Account</span>
                <RiArrowRightLine size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[color:var(--color-text)] font-semibold text-[length:var(--font-size-step-0)] hover:bg-[var(--color-background)] shadow-[var(--shadow-sm)] transition-all touch-target"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Floating Dark Code Window (55%) */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-slate-950 text-emerald-400 p-5 rounded-[var(--radius-surface)] shadow-[var(--shadow-hover)] border border-emerald-900/40 font-mono text-xs overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <RiCodeLine size={13} />
                  <span>finance-tracker-telemetry</span>
                </div>
              </div>

              <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
                <code>{`// Point-in-Time Net Worth & Ledger Snapshot
{
  "tenant": "alex@financetracker.local",
  "baseCurrency": "MAD",
  "netWorth": {
    "totalAssets": "142,500.00 MAD",
    "totalLiabilities": "18,200.00 MAD",
    "netWorthToday": "124,300.00 MAD"
  },
  "wallets": [
    { "name": "Attijariwafa Checking", "balance": "38,500.00 MAD" },
    { "name": "USD Savings", "balance": "$8,200.00", "inBase": "82,820.00 MAD" },
    { "name": "Emergency Cash", "balance": "21,180.00 MAD" }
  ],
  "invariants": {
    "incomeDecoupledFromWallets": true,
    "spendingDeductsFromWallet": true,
    "precisionRounding": "ROUND_HALF_UP"
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Badges Strip */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-6">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3">
              <span className="font-extrabold text-[length:var(--font-size-step-2)] text-[color:var(--color-primary-text)] block font-mono">
                100%
              </span>
              <span className="text-xs text-[color:var(--color-muted)] font-medium">Self-Hosted Privacy</span>
            </div>
            <div className="p-3">
              <span className="font-extrabold text-[length:var(--font-size-step-2)] text-[color:var(--color-primary-text)] block font-mono">
                &lt; 832 MiB
              </span>
              <span className="text-xs text-[color:var(--color-muted)] font-medium">Ultra-Low RAM Footprint</span>
            </div>
            <div className="p-3">
              <span className="font-extrabold text-[length:var(--font-size-step-2)] text-[color:var(--color-primary-text)] block font-mono">
                3 Currencies
              </span>
              <span className="text-xs text-[color:var(--color-muted)] font-medium">MAD &bull; USD &bull; EUR</span>
            </div>
            <div className="p-3">
              <span className="font-extrabold text-[length:var(--font-size-step-2)] text-[color:var(--color-primary-text)] block font-mono">
                Multi-Tenant
              </span>
              <span className="text-xs text-[color:var(--color-muted)] font-medium">Isolated User Accounts</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features: features-6grid */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Core Accounting Modules
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
            Engineered for strict financial discipline
          </h2>
          <p className="text-sm text-[color:var(--color-muted)] mt-2">
            Built from first principles to keep revenue tracking separated from cash pool snapshots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-base)] hover:shadow-[var(--shadow-hover)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-semibold bg-[var(--color-background)] border border-[var(--color-border)] text-[color:var(--color-muted)]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-muted)] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Workflow Inspection Tabs */}
      <section id="workflow" className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)] border-y border-[var(--color-border)] w-full">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
              Architectural Invariants
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
              Inspect how the ledger operates
            </h2>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8" role="tablist">
            {workflowTabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeWorkflowTab === tab.id}
                onClick={() => setActiveWorkflowTab(tab.id as any)}
                className={`px-4 py-2 rounded-[var(--radius-base)] text-xs font-semibold transition-all touch-target ${
                  activeWorkflowTab === tab.id
                    ? 'bg-[var(--color-primary)] text-[color:var(--color-on-primary)] shadow-[var(--shadow-sm)]'
                    : 'bg-[var(--color-background)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          {workflowTabs.map((tab) => {
            if (tab.id !== activeWorkflowTab) return null;
            return (
              <div
                key={tab.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[var(--color-background)] p-6 sm:p-8 rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
              >
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
                    {tab.headline}
                  </h3>
                  <p className="text-sm text-[color:var(--color-muted)] leading-relaxed">
                    {tab.content}
                  </p>
                  <ul className="space-y-2 text-xs text-[color:var(--color-text)]">
                    <li className="flex items-center gap-2">
                      <RiCheckLine size={16} className="text-[color:var(--color-primary-text)]" />
                      <span>Strict Zod runtime request validation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <RiCheckLine size={16} className="text-[color:var(--color-primary-text)]" />
                      <span>ACID database transaction guarantees</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6">
                  <pre className="bg-slate-950 text-emerald-400 p-4 rounded-[var(--radius-base)] border border-emerald-900/40 text-[11px] font-mono overflow-x-auto">
                    <code>{tab.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-[var(--shadow-sm)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-[color:var(--color-text)] hover:bg-[var(--color-background)] transition-colors touch-target"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <RiSubtractLine size={18} className="text-[color:var(--color-muted)] shrink-0" />
                  ) : (
                    <RiAddLine size={18} className="text-[color:var(--color-muted)] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[color:var(--color-muted)] leading-relaxed border-t border-[var(--color-border)]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary-bg)] border-t border-[var(--color-border)] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] mb-3">
            Ready to track your wealth privately?
          </h2>
          <p className="text-sm text-[color:var(--color-muted)] mb-6">
            Create an account on this instance and start tracking with multi-currency ledgers today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-semibold text-sm hover:brightness-110 shadow-[var(--shadow-base)] transition-all touch-target"
          >
            <span>Create Your Account</span>
            <RiArrowRightLine size={16} />
          </Link>
        </div>
      </section>

      {/* 8. Footer: minimal-inline */}
      <footer className="mt-auto py-6 bg-[var(--color-surface)] text-[color:var(--color-muted)] text-xs border-t border-[var(--color-border)]">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[color:var(--color-text)] font-[family-name:var(--font-heading)]">
              Finance Tracker
            </span>
            <span>&bull; Self-Hosted Personal Wealth & Spending System</span>
          </div>
          <p className="text-[11px]">English Only &bull; Open-Source &bull; Docker-Native</p>
        </div>
      </footer>
    </div>
  );
};
