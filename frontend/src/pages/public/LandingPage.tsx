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
  RiSunLine,
  RiMoonLine,
  RiCheckLine,
  RiAddLine,
  RiSubtractLine,
  RiLineChartLine,
  RiLockPasswordLine,
  RiSparkling2Fill,
  RiCoinsLine,
  RiPieChartLine,
  RiSafe2Line,
  RiCloseLine,
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

  const valueProps = [
    {
      title: '100% Private & Autonomous',
      desc: 'No data harvesting, no bank data sales, no targeted ads. Your wealth details stay strictly confidential under your own account.',
      stat: 'Zero',
      statLabel: 'Data Tracking or Ads',
    },
    {
      title: 'Tri-Currency Native Core',
      desc: 'Manage MAD (Moroccan Dirham), USD ($), and EUR (€) seamlessly with automated daily exchange rates and historical accuracy.',
      stat: '3-in-1',
      statLabel: 'MAD • USD • EUR Sync',
    },
    {
      title: 'Itemized Receipt Breakdown',
      desc: 'Never wonder where $150 vanished. Break receipts down into individual items, quantities, unit prices, and store merchants.',
      stat: '100%',
      statLabel: 'Itemized Expense Clarity',
    },
    {
      title: 'Multi-User Private Spaces',
      desc: 'Invite your partner, spouse, or family members. Everyone enjoys an independent, private financial dashboard on this instance.',
      stat: 'Multi-User',
      statLabel: 'Completely Isolated Data',
    },
  ];

  const features = [
    {
      icon: RiLineChartLine,
      title: 'Unified Net Worth at a Glance',
      badge: 'Total Clarity',
      description:
        'Aggregate all your bank accounts, cash reserves, and liabilities into one crystal-clear real-time net worth valuation in your base currency.',
      highlight: 'Live updates across all wallets',
    },
    {
      icon: RiReceiptLine,
      title: 'Deep Itemized Expense Tracking',
      badge: 'Stop Money Leaks',
      description:
        'Say goodbye to mysterious lumped expenses. Record full itemized receipts with articles, units, and categories to spot runaway costs instantly.',
      highlight: 'Pinpoint grocery & dining inflation',
    },
    {
      icon: RiGlobalLine,
      title: 'Seamless Multi-Currency Conversion',
      badge: 'Global Ready',
      description:
        'Hold cash in MAD, earn freelance revenue in USD, and invest in EUR without mental math. Automated rates convert every transaction accurately.',
      highlight: 'Historical rates locked per transaction',
    },
    {
      icon: RiFocus3Line,
      title: 'Visual Budget Guardrails',
      badge: 'Impulse Defense',
      description:
        'Set category spending limits that actively protect your paycheck. Amber warnings fire at 80% and red alerts stop you before you blow your budget.',
      highlight: 'Proactive 80% & 100% warning thresholds',
    },
    {
      icon: RiSafe2Line,
      title: 'Milestone Savings Accelerators',
      badge: 'Reach Goals Faster',
      description:
        'Whether saving for a down payment, emergency fund, or dream vacation, visual goal bars calculate the exact monthly deposit to cross the finish line.',
      highlight: 'Dynamic monthly contribution calculation',
    },
    {
      icon: RiShieldCheckLine,
      title: 'Complete Financial Privacy',
      badge: 'Your Data, Your Rules',
      description:
        'Commercial finance apps connect to brokers and sell your shopping behavior. Finance Tracker keeps your wealth strictly private and sovereign.',
      highlight: 'Multi-tenant encrypted isolation',
    },
  ];

  const workflowPillars = [
    {
      id: 'income',
      tabLabel: '1. Revenue Mastery',
      tagline: 'Track Every Revenue Stream Without False Balances',
      description:
        'True financial mastery separates revenue inflow from spendable cash. Log your salaries, client retainers, dividends, and freelance earnings by source and category so you always know your exact earning velocity.',
      points: [
        'Color-coded source and category breakdown',
        'Multi-currency earnings with automatic base conversion',
        'Prevents premature spending before cash is physically banked',
      ],
      previewHeadline: 'Verified Revenue Stream',
      previewValue: '+34,500.00 MAD',
      previewSub: 'Freelance & Retainer Income this month',
      previewBadge: 'Velocity +18%',
    },
    {
      id: 'wallets',
      tabLabel: '2. Multi-Wallet Hub',
      tagline: 'Checking, Cash & Liabilities Reconciled in Seconds',
      description:
        'Consolidate checking accounts, physical cash stashes, credit balances, and debt accounts in one unified command center. Simple reconciliation snapshots keep your real balances aligned with reality.',
      points: [
        'Asset vs. Liability segregation with instant net worth',
        'Single-click delta reconciliation against physical balances',
        'Automatic cross-wallet conversion into your primary currency',
      ],
      previewHeadline: 'Total Consolidated Net Worth',
      previewValue: '142,500.00 MAD',
      previewSub: 'Across 4 Asset Accounts & 1 Liability',
      previewBadge: 'Debt Down -14%',
    },
    {
      id: 'spending',
      tabLabel: '3. Itemized Receipts',
      tagline: 'Line-by-Line Spending Logs That Stop Hidden Leaks',
      description:
        'Lump-sum expense tracking hides waste. With itemized bills, log every supermarket trip, dining receipt, or tech purchase down to the exact item, quantity, and unit price deducted automatically from designated wallets.',
      points: [
        'Itemized line items with quantities, units, and prices',
        'Atomic deduction from your chosen payment wallet',
        'Category tagging to spot which habits drain your wealth',
      ],
      previewHeadline: 'Itemized Receipt Breakdown',
      previewValue: '-1,240.50 MAD',
      previewSub: 'Supermarket Carrefour • 8 Line Items Logged',
      previewBadge: 'Receipt Verified',
    },
    {
      id: 'budgets',
      tabLabel: '4. Guardrails & Goals',
      tagline: 'Set Spending Limits & Accelerate Milestone Goals',
      description:
        'Never get blindsided at the end of the month. Category budget meters alert you when spending reaches 80%, while visual savings milestone trackers calculate your required monthly pace to achieve your dreams.',
      points: [
        'Visual health bars with green, amber (80%), and red warnings',
        'Automated monthly saving quota calculation for each goal',
        'Zero guilt: know exactly what is safe to spend every week',
      ],
      previewHeadline: 'Emergency Fund Milestone',
      previewValue: '85% Complete',
      previewSub: '42,500 / 50,000 MAD Target • On Track for Dec',
      previewBadge: 'Target in Sight',
    },
  ];

  const comparisonPoints = [
    {
      feature: 'Data Privacy & Ownership',
      traditional: 'Your financial habits and receipts are monetized or fed into ad algorithms.',
      financeTracker: '100% private. Stored securely under your own account with zero telemetry or data sales.',
    },
    {
      feature: 'Multi-Currency Support',
      traditional: 'Clunky conversions, hidden fees, or locked to a single foreign currency.',
      financeTracker: 'Native MAD, USD, and EUR support with real-time conversion and historical accuracy.',
    },
    {
      feature: 'Expense Detail Level',
      traditional: 'Vague single-line totals (e.g., "$120 at Mart") with zero breakdown.',
      financeTracker: 'Full itemized line items: see every grocery, unit price, quantity, and category.',
    },
    {
      feature: 'Multi-User Independence',
      traditional: 'Expensive per-seat upgrades or forced account sharing.',
      financeTracker: 'Complete multi-user support with isolated private accounts on this instance.',
    },
  ];

  const faqs = [
    {
      q: 'Is Finance Tracker really free to use?',
      a: 'Yes, 100% free! You can create your account, set up unlimited wallets, log unlimited itemized receipts, and track all your goals without paywalls, subscriptions, or credit card requirements.',
    },
    {
      q: 'How does Finance Tracker protect my privacy compared to commercial apps?',
      a: 'Unlike popular finance apps that sell your spending habits to credit bureaus and marketing companies, Finance Tracker has zero trackers and zero third-party advertising. All your financial data is strictly partitioned by your private user account.',
    },
    {
      q: 'Can my partner or family members also create their own accounts?',
      a: 'Yes! Finance Tracker is multi-tenant by design. Other people can register their own accounts on this instance. Each user gets their own private login, custom base currency (MAD, USD, or EUR), and isolated wallets.',
    },
    {
      q: 'How does multi-currency conversion work with fluctuating exchange rates?',
      a: 'Finance Tracker pulls automated exchange rates for MAD, USD, and EUR. When you record a transaction, it automatically calculates and stores both the original currency amount and the base currency equivalent using that date’s rate, keeping historical reports accurate.',
    },
    {
      q: 'Why does itemizing receipts make such a big difference?',
      a: 'Lump-sum tracking creates the illusion that money "just disappeared." By recording individual articles and quantities, you instantly identify price increases, impulse buys, and lifestyle creep so you can make informed decisions and save hundreds every month.',
    },
    {
      q: 'What if I mostly use cash or multiple bank accounts?',
      a: 'Finance Tracker is built specifically for this! You can create checking wallets, physical cash envelopes, savings accounts, and liability/debt balances. Whenever you spend, you simply pick which wallet funded the transaction.',
    },
  ];

  const activePillar = workflowPillars.find((p) => p.id === activeWorkflowTab) || workflowPillars[0];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[color:var(--color-text)] font-[family-name:var(--font-body)] flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. Header / Navigation */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-[var(--blur-glass)] sticky top-0 z-[var(--z-sticky)]">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] flex items-center justify-center font-bold text-base shadow-[var(--shadow-sm)] group-hover:scale-105 transition-transform">
              FT
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[length:var(--font-size-step-1)] font-[family-name:var(--font-heading)] tracking-tight text-[color:var(--color-text)] leading-tight">
                Finance Tracker
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[color:var(--color-primary-text)]">
                Wealth Operating System
              </span>
            </div>
          </Link>

          {/* Centered navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-[length:var(--font-size-step-sub1)] font-semibold text-[color:var(--color-muted)]">
            <a href="#benefits" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              Why Us
            </a>
            <a href="#features" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
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
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[length:var(--font-size-step-sub1)] font-semibold text-[color:var(--color-on-primary)] bg-[var(--color-primary)] hover:brightness-110 rounded-[var(--radius-base)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
            >
              <span>Get Started Free</span>
              <RiArrowRightLine size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: High-Converting Salesman Hero */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Pitch (Sales Copy) */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            {/* Trust Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-xs font-bold text-[color:var(--color-primary-text)] mb-6 shadow-sm">
              <RiSparkling2Fill size={14} className="text-amber-500" />
              <span>Smart Wealth & Budgeting Platform &bull; 100% Free</span>
            </div>

            {/* Sales Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[2.95rem] font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] tracking-tight leading-[1.12] mb-6">
              Stop wondering where your money went.{' '}
              <span className="text-[color:var(--color-primary-text)] underline decoration-emerald-500/30 decoration-wavy">
                Master your wealth
              </span>{' '}
              with total precision.
            </h1>

            {/* Sales Subtitle */}
            <p className="text-base sm:text-lg text-[color:var(--color-muted)] mb-8 max-w-xl leading-relaxed">
              Spreadsheets are tedious and commercial banking apps monetize your personal data. Finance Tracker gives you crystal-clear multi-currency cash flow, itemized receipt accounting, and visual savings goals in one private, beautifully fast command center.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-6">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-bold text-[length:var(--font-size-step-0)] hover:brightness-110 shadow-[var(--shadow-base)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5 transition-all touch-target"
              >
                <span>Start Tracking Free — No Card Needed</span>
                <RiArrowRightLine size={19} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-4 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[color:var(--color-text)] font-semibold text-[length:var(--font-size-step-0)] hover:bg-[var(--color-background)] shadow-[var(--shadow-sm)] transition-all touch-target"
              >
                Sign In to Workspace
              </Link>
            </div>

            {/* Friction Reducers / Trust badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[color:var(--color-muted)]">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <RiCheckLine size={16} />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <RiCheckLine size={16} />
                <span>100% Private Data Isolation</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <RiCheckLine size={16} />
                <span>MAD &bull; USD &bull; EUR Native</span>
              </div>
            </div>
          </div>

          {/* Right Product Showcase: High-Res 3D Dashboard Mockup replacing code box */}
          <div className="lg:col-span-6 w-full relative">
            {/* Ambient Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[28px] blur-2xl opacity-70 pointer-events-none" />

            <div className="relative rounded-[20px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-hover)] group">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
                  <span className="ml-2 text-xs font-semibold text-[color:var(--color-muted)]">
                    Finance Tracker &bull; Live Wealth Dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>
              </div>

              {/* Showcase Image */}
              <div className="relative overflow-hidden bg-slate-950">
                <img
                  src="/hero-dashboard.jpg"
                  alt="Finance Tracker Dashboard Preview showing multi-currency wallets, net worth growth, and budget meters"
                  className="w-full h-auto object-cover transform group-hover:scale-[1.015] transition-transform duration-500"
                  loading="eager"
                />

                {/* Floating Metric Overlay Cards */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-xl p-3 shadow-xl hidden sm:flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <RiLineChartLine size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Net Worth</div>
                    <div className="text-sm font-black text-emerald-400">142,500.00 MAD</div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 shadow-xl hidden sm:flex items-center gap-2 text-xs text-slate-200">
                  <RiCoinsLine size={16} className="text-amber-400" />
                  <span className="font-semibold">Auto-Exchange: USD, EUR &rarr; MAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Proof & Trust Metric Strip */}
      <section id="benefits" className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-8">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, idx) => (
              <div key={idx} className="p-4 rounded-[var(--radius-base)] bg-[var(--color-background)]/60 border border-[var(--color-border)] flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-black font-mono text-[color:var(--color-primary-text)] mb-1">
                    {prop.stat}
                  </div>
                  <div className="text-xs font-bold text-[color:var(--color-text)] mb-2 uppercase tracking-wide">
                    {prop.statLabel}
                  </div>
                  <p className="text-xs text-[color:var(--color-muted)] leading-relaxed">
                    {prop.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Finance Tracker: Old Frustrating Way vs New Smart Way */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            The Wealth Clarity Breakthrough
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
            Stop fighting broken spreadsheets and invasive banking apps
          </h2>
          <p className="text-base text-[color:var(--color-muted)] mt-3">
            Most people lose thousands every year simply because they don't have true visibility into their finances. Here is how Finance Tracker changes the game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Old Way */}
          <div className="p-6 sm:p-8 rounded-[var(--radius-surface)] border border-rose-300 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold mb-4">
                <RiCloseLine size={16} />
                <span>The Frustrating Old Way</span>
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-rose-950 dark:text-rose-200 mb-4">
                Manual chaos, missing receipts & privacy risks
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-rose-900/80 dark:text-rose-300/80">
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-rose-500 mt-0.5">&times;</span>
                  <span>Spreadsheets that break formulas and take hours of boring data entry every weekend.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-rose-500 mt-0.5">&times;</span>
                  <span>Free commercial apps that sell your private spending habits to advertisers and insurers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-rose-500 mt-0.5">&times;</span>
                  <span>Lump-sum bank entries like "$85 Supermarket" that hide runaway grocery and impulse costs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-rose-500 mt-0.5">&times;</span>
                  <span>Mental exhaustion converting foreign payments (MAD, USD, EUR) to know your actual net worth.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* New Finance Tracker Way */}
          <div className="p-6 sm:p-8 rounded-[var(--radius-surface)] border border-emerald-400 dark:border-emerald-700/60 bg-emerald-50/60 dark:bg-emerald-950/30 flex flex-col justify-between shadow-[var(--shadow-base)]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-4">
                <RiCheckLine size={16} />
                <span>The Finance Tracker Standard</span>
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-emerald-950 dark:text-emerald-100 mb-4">
                Effortless control, deep itemization & absolute privacy
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-emerald-900/85 dark:text-emerald-200/90">
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">&check;</span>
                  <span>Automatic unified net worth across all your accounts, cash reserves, and liabilities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">&check;</span>
                  <span>Zero trackers, zero ads: your finances are strictly private and isolated by account.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">&check;</span>
                  <span>Detailed receipt itemization: capture articles, quantities, and unit prices in seconds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">&check;</span>
                  <span>Automated daily exchange rates that convert MAD, USD, and EUR into one unified balance.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Features: 6 Benefit-Rich Modules */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Powerful Wealth Features
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
            Engineered to put you in complete financial command
          </h2>
          <p className="text-base text-[color:var(--color-muted)] mt-2">
            Every module was crafted to give you total control over cash flow, budgets, and long-term milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Icon size={22} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-bold bg-[var(--color-background)] border border-[var(--color-border)] text-[color:var(--color-primary-text)]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-muted)] leading-relaxed mb-4">
                    {feat.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--color-border)]/60 text-xs font-semibold text-[color:var(--color-primary-text)] flex items-center gap-1.5">
                  <RiCheckLine size={15} />
                  <span>{feat.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Interactive How It Works Showcase (Replacing old raw code boxes) */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)] border-y border-[var(--color-border)] w-full">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
              Intuitive & Disciplined
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
              How Finance Tracker puts your money on autopilot
            </h2>
            <p className="text-base text-[color:var(--color-muted)] mt-2">
              Explore the four pillars designed to keep your money growing month after month.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10" role="tablist">
            {workflowPillars.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeWorkflowTab === tab.id}
                onClick={() => setActiveWorkflowTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-[var(--radius-base)] text-xs sm:text-sm font-bold transition-all touch-target ${
                  activeWorkflowTab === tab.id
                    ? 'bg-[var(--color-primary)] text-[color:var(--color-on-primary)] shadow-[var(--shadow-base)] scale-105'
                    : 'bg-[var(--color-background)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-border)]/40'
                }`}
              >
                {tab.tabLabel}
              </button>
            ))}
          </div>

          {/* Interactive Feature Showcase with Visual replacing the code box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[var(--color-background)] p-6 sm:p-10 rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-base)]">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] border border-[var(--color-border)]">
                <RiSparkling2Fill size={13} className="text-amber-500" />
                <span>Pillar {activePillar.tabLabel.split('.')[0]}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] leading-snug">
                {activePillar.tagline}
              </h3>
              <p className="text-sm sm:text-base text-[color:var(--color-muted)] leading-relaxed">
                {activePillar.description}
              </p>
              <ul className="space-y-3 pt-2">
                {activePillar.points.map((pt, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[color:var(--color-text)]">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <RiCheckLine size={14} />
                    </div>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--color-primary-text)] hover:underline"
                >
                  <span>Experience this in your free account</span>
                  <RiArrowRightLine size={16} />
                </Link>
              </div>
            </div>

            {/* Right Rich Visual Showcase: 3D Finance Illustration & Card */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-[18px] overflow-hidden border border-[var(--color-border)] shadow-xl bg-slate-950 group">
                {/* Visual Image */}
                <div className="relative overflow-hidden">
                  <img
                    src="/features-preview.jpg"
                    alt="Finance Tracker feature preview showing itemized receipts, budget progress and multi-currency badges"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Dynamic interactive overlay card based on active tab */}
                  <div className="absolute inset-x-4 bottom-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-white shadow-2xl flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase font-bold text-slate-400">
                        {activePillar.previewHeadline}
                      </div>
                      <div className="text-lg font-black text-emerald-400">
                        {activePillar.previewValue}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {activePillar.previewSub}
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      {activePillar.previewBadge}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Comparison Table: Feature vs Traditional Apps */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Direct Comparison
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
            How we compare to typical apps
          </h2>
        </div>

        <div className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="grid grid-cols-12 bg-[var(--color-primary-bg)] border-b border-[var(--color-border)] p-4 text-xs font-bold text-[color:var(--color-primary-text)] uppercase tracking-wider">
            <div className="col-span-4 sm:col-span-3">Capability</div>
            <div className="col-span-4 sm:col-span-4 text-rose-600 dark:text-rose-400">Other Commercial Apps</div>
            <div className="col-span-4 sm:col-span-5 text-emerald-600 dark:text-emerald-400 font-extrabold">Finance Tracker</div>
          </div>

          <div className="divide-y divide-[var(--color-border)] text-xs sm:text-sm">
            {comparisonPoints.map((row, i) => (
              <div key={i} className="grid grid-cols-12 p-4 items-center hover:bg-[var(--color-background)]/50 transition-colors">
                <div className="col-span-4 sm:col-span-3 font-bold text-[color:var(--color-text)]">
                  {row.feature}
                </div>
                <div className="col-span-4 sm:col-span-4 text-[color:var(--color-muted)] pr-2">
                  {row.traditional}
                </div>
                <div className="col-span-4 sm:col-span-5 font-semibold text-emerald-700 dark:text-emerald-300">
                  {row.financeTracker}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions (Overcoming Objections) */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[color:var(--color-muted)] mt-2">
            Everything you need to know about setting up your wealth tracker in under a minute.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-[var(--shadow-sm)] hover:border-[var(--color-primary)]/40 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[color:var(--color-text)] hover:bg-[var(--color-background)] transition-colors touch-target"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <RiSubtractLine size={20} className="text-[color:var(--color-primary-text)] shrink-0 ml-2" />
                  ) : (
                    <RiAddLine size={20} className="text-[color:var(--color-muted)] shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[color:var(--color-muted)] leading-relaxed border-t border-[var(--color-border)] bg-[var(--color-background)]/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. High-Impact Closing CTA (The Closer) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] border-t border-[var(--color-border)] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] border border-[var(--color-border)] mb-5">
            <RiSparkling2Fill size={13} className="text-amber-500" />
            <span>Start in 30 Seconds &bull; Completely Free</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] tracking-tight mb-4">
            Take total command of your financial future today.
          </h2>
          <p className="text-base sm:text-lg text-[color:var(--color-muted)] mb-8 max-w-xl mx-auto leading-relaxed">
            Stop letting small expenses drain your wealth. Create your free account now and experience the clarity of truly organized personal finances.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-bold text-base hover:brightness-110 shadow-[var(--shadow-base)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5 transition-all touch-target"
            >
              <span>Create Your Free Account Now</span>
              <RiArrowRightLine size={18} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[color:var(--color-text)] font-semibold text-base hover:bg-[var(--color-background)] transition-all touch-target"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-6 text-xs text-[color:var(--color-muted)] font-medium">
            Multi-User Enabled &bull; No Credit Card Required &bull; 100% Private
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="mt-auto py-8 bg-[var(--color-surface)] text-[color:var(--color-muted)] text-xs border-t border-[var(--color-border)]">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] flex items-center justify-center font-bold text-xs">
              FT
            </div>
            <span className="font-bold text-[color:var(--color-text)] font-[family-name:var(--font-heading)]">
              Finance Tracker
            </span>
            <span>&bull; Intelligent Wealth & Multi-Currency Platform</span>
          </div>
          <p className="text-[11px] text-[color:var(--color-muted)]">
            Private Multi-User Support &bull; English &bull; MIT Open-Source
          </p>
        </div>
      </footer>
    </div>
  );
};
