import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  RiWallet3Line,
  RiReceiptLine,
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
  RiCoinsLine,
  RiPieChartLine,
  RiSafe2Line,
  RiSparkling2Fill,
} from '@remixicon/react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const steps = [
    {
      step: 'Step 1',
      title: 'Add your accounts & wallets',
      description:
        'Put in your bank account, physical cash, and savings. The dashboard adds them all together so you instantly know your true net worth in one clear number.',
      badge: 'Unified Balance',
    },
    {
      step: 'Step 2',
      title: 'Log your daily spending',
      description:
        'Record everyday purchases in seconds. Add simple expense totals or full grocery receipts with itemized prices to see where your cash really goes.',
      badge: 'Easy Logging',
    },
    {
      step: 'Step 3',
      title: 'Watch your savings grow',
      description:
        'Open your simplified reports to see clear category breakdowns, track monthly trends, and watch your net worth climb toward your savings goals.',
      badge: 'Clear Reports',
    },
  ];

  const coreFeatures = [
    {
      icon: RiLineChartLine,
      title: 'Simplified Net Worth Dashboard',
      description:
        'See all your money in one clean screen. Checking accounts, cash in your wallet, and savings are neatly summed up into your total net worth.',
      benefit: 'Always know where you stand',
    },
    {
      icon: RiPieChartLine,
      title: 'Visual Spending Reports',
      description:
        'Clean, colorful charts show you exactly how much you spend on food, rent, shopping, and entertainment so you never have to guess.',
      benefit: 'Find & cut unnecessary spending',
    },
    {
      icon: RiReceiptLine,
      title: 'Receipt & Item Tracking',
      description:
        'Log quick expenses or break down supermarket receipts into line items. See the real price of your habits down to the penny.',
      benefit: 'No mystery charges',
    },
    {
      icon: RiGlobalLine,
      title: 'Multi-Currency Made Simple',
      description:
        'Hold money in Moroccan Dirhams (MAD), US Dollars ($), or Euros (€). We automatically convert everything into your chosen home currency.',
      benefit: 'MAD, USD, and EUR in one place',
    },
    {
      icon: RiSafe2Line,
      title: 'Visual Savings Targets',
      description:
        'Set simple goals for emergencies, vacations, or a new home. A visual progress meter shows how much to set aside each month to reach your target.',
      benefit: 'Hit your savings goals faster',
    },
    {
      icon: RiShieldCheckLine,
      title: '100% Private & Free',
      description:
        'Your finances are nobody else’s business. No advertisements, no bank data sales, and completely free private accounts for everyone on this instance.',
      benefit: 'Your financial data stays yours',
    },
  ];

  const faqs = [
    {
      q: 'What is Finance Tracker and how does it help me?',
      a: 'Finance Tracker is a simple personal finance webapp. It gives you an easy-to-read dashboard showing all your money (bank accounts, cash, savings) and visual reports of where your spending goes, so you can save more and grow your net worth.',
    },
    {
      q: 'Is it simple to use compared to Excel or other finance apps?',
      a: 'Yes, absolutely. There are no broken formulas to manage and no complicated accounting jargon. You just enter your wallets, log your spending, and the app automatically updates your net worth and spending reports.',
    },
    {
      q: 'Can my partner, friends, or family create their own accounts?',
      a: 'Yes! Anyone can register on this app. Each user gets their own private login, completely independent wallets, and their own personal reports.',
    },
    {
      q: 'Can I track cash as well as bank accounts?',
      a: 'Yes. You can create a wallet for your bank account, a wallet for cash in your pocket, and a savings wallet. When you spend, just pick which wallet paid for it.',
    },
    {
      q: 'How does currency conversion work?',
      a: 'You can choose MAD (Moroccan Dirham), USD ($), or EUR (€) as your main currency. If you record income or spending in another currency, the app converts it using live exchange rates so your net worth is always accurate.',
    },
    {
      q: 'Is Finance Tracker really free?',
      a: 'Yes, 100% free with no subscription fees, no locked features, and no credit card required.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[color:var(--color-text)] font-[family-name:var(--font-body)] flex flex-col">
      {/* 1. Header (Clean, solid, no glass blur) */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-[var(--z-sticky)]">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] flex items-center justify-center font-bold text-base shadow-[var(--shadow-sm)]">
              FT
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[length:var(--font-size-step-1)] font-[family-name:var(--font-heading)] tracking-tight text-[color:var(--color-text)] leading-tight">
                Finance Tracker
              </span>
              <span className="text-[10px] font-bold tracking-wider text-[color:var(--color-primary-text)] uppercase">
                Simple Spending & Net Worth
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-[length:var(--font-size-step-sub1)] font-semibold text-[color:var(--color-muted)]">
            <a href="#how-it-works" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              Features
            </a>
            <a href="#reports" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              Dashboard & Reports
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[length:var(--font-size-step-sub1)] font-semibold text-[color:var(--color-on-primary)] bg-[var(--color-primary)] hover:brightness-110 rounded-[var(--radius-base)] shadow-[var(--shadow-sm)] transition-all touch-target"
            >
              <span>Start Free</span>
              <RiArrowRightLine size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Direct, Simple, Persuasive with Money Growth Visual */}
      <section className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-xs font-bold text-[color:var(--color-primary-text)] mb-6">
              <RiSparkling2Fill size={14} className="text-amber-500" />
              <span>Simple Personal Finance &bull; 100% Free</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] tracking-tight leading-[1.15] mb-5">
              Track your spending. Watch your net worth grow.
            </h1>

            <p className="text-base sm:text-lg text-[color:var(--color-muted)] mb-8 max-w-xl leading-relaxed">
              No complicated spreadsheets and no confusing financial jargon. See all your bank accounts and cash in one simple dashboard, track where your money goes every day, and build lasting savings with clean visual reports.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-6">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-bold text-[length:var(--font-size-step-0)] hover:brightness-110 shadow-[var(--shadow-base)] hover:-translate-y-0.5 transition-all touch-target"
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

            {/* Trust points */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[color:var(--color-muted)]">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <RiCheckLine size={16} />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <RiCheckLine size={16} />
                <span>Your Data Stays Strictly Private</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <RiCheckLine size={16} />
                <span>MAD, USD & EUR Ready</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Money Saving & Growth Image (Clean Solid Frame, No Glass) */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-[20px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-hover)]">
              {/* Card top banner */}
              <div className="px-5 py-3.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-bold text-[color:var(--color-text)]">
                    Smart Wealth Growth & Savings
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  +24% Saved This Year
                </span>
              </div>

              {/* Solid image frame */}
              <div className="relative bg-[var(--color-background)] overflow-hidden">
                <img
                  src="/growing-money.jpg"
                  alt="Personal savings and money growing with piggy bank and financial chart"
                  className="w-full h-auto object-cover max-h-[420px]"
                />

                {/* Floating solid card overlay */}
                <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <RiLineChartLine size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[color:var(--color-muted)]">Total Net Worth</div>
                      <div className="text-base font-extrabold text-[color:var(--color-text)]">142,500.00 MAD</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[color:var(--color-muted)]">Monthly Savings</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+5,200.00 MAD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Big 3 Truths (Why this app works) */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-8">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)]">
              <span className="text-xl font-extrabold text-[color:var(--color-primary-text)] block mb-1">
                1. Know Your True Balance
              </span>
              <p className="text-xs text-[color:var(--color-muted)]">
                See bank accounts and cash in your pocket combined in one honest total.
              </p>
            </div>
            <div className="p-4 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)]">
              <span className="text-xl font-extrabold text-[color:var(--color-primary-text)] block mb-1">
                2. Stop Guessing Spending
              </span>
              <p className="text-xs text-[color:var(--color-muted)]">
                Record daily expenses or itemized receipts in seconds so you know where every dollar went.
              </p>
            </div>
            <div className="p-4 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)]">
              <span className="text-xl font-extrabold text-[color:var(--color-primary-text)] block mb-1">
                3. Grow Real Savings
              </span>
              <p className="text-xs text-[color:var(--color-muted)]">
                Simple visual reports show if you're saving money each month and keep you motivated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works: 3 Simple Steps */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
            How it works in 3 easy steps
          </h2>
          <p className="text-base text-[color:var(--color-muted)] mt-2">
            Taking control of your money has never been this straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="p-6 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-extrabold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-background)] border border-[var(--color-border)] text-[color:var(--color-primary-text)]">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[color:var(--color-muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Simplified Dashboard & Reports Showcase */}
      <section id="reports" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)] border-y border-[var(--color-border)] w-full">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Image: Saving and Growing Money */}
            <div className="lg:col-span-6">
              <div className="rounded-[18px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-md)]">
                <img
                  src="/money-saving-growth.jpg"
                  alt="Growing savings jar with green plant sprout"
                  className="w-full h-auto object-cover max-h-[380px]"
                />
                <div className="p-5 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[color:var(--color-text)] uppercase tracking-wide">
                      Monthly Spending Breakdown
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Under Budget
                    </span>
                  </div>
                  {/* Visual progress bar */}
                  <div className="w-full h-3 bg-[var(--color-background)] rounded-full overflow-hidden flex border border-[var(--color-border)]">
                    <div className="h-full bg-emerald-500 w-[45%]" title="Housing & Bills 45%" />
                    <div className="h-full bg-teal-500 w-[25%]" title="Groceries 25%" />
                    <div className="h-full bg-amber-500 w-[15%]" title="Shopping 15%" />
                    <div className="h-full bg-blue-500 w-[15%]" title="Saved 15%" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[color:var(--color-muted)] mt-2 font-medium">
                    <span>Bills (45%)</span>
                    <span>Food (25%)</span>
                    <span>Shopping (15%)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Saved (15%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Narrative */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] border border-[var(--color-border)]">
                <RiPieChartLine size={14} />
                <span>Simplified Reports & Insights</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] leading-tight">
                Clear reports that actually help you save money
              </h2>
              <p className="text-sm sm:text-base text-[color:var(--color-muted)] leading-relaxed">
                Most budgeting apps overload you with complicated tables and confusing graphs. Finance Tracker gives you simple, easy-to-read reports that answer the only two questions that matter:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[color:var(--color-text)]">
                      "Where did my money go this month?"
                    </h4>
                    <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                      Visual category charts reveal exactly which categories take up most of your income.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[color:var(--color-text)]">
                      "Is my total net worth going up or down?"
                    </h4>
                    <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                      Track your wealth trajectory over time and celebrate every milestone as your debts shrink and savings grow.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] text-sm font-bold shadow-[var(--shadow-sm)] hover:brightness-110 transition-all"
                >
                  <span>See your reports for free</span>
                  <RiArrowRightLine size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Grid: The 6 Core Essentials */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Everything You Need
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
            Built for simple, stress-free money management
          </h2>
          <p className="text-base text-[color:var(--color-muted)] mt-2">
            No bloated menus. Just the essential tools you need to track spending and save money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-base)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-muted)] leading-relaxed mb-4">
                    {feat.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--color-border)] text-xs font-semibold text-[color:var(--color-primary-text)] flex items-center gap-1.5">
                  <RiCheckLine size={16} />
                  <span>{feat.benefit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Clear FAQ */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[color:var(--color-text)]">
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
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[color:var(--color-muted)] leading-relaxed border-t border-[var(--color-border)] bg-[var(--color-background)]/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary-bg)] border-t border-[var(--color-border)] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] tracking-tight mb-4">
            Start tracking your spending and growing your wealth today
          </h2>
          <p className="text-base text-[color:var(--color-muted)] mb-8">
            Set up your free account in under 30 seconds. No credit card needed, no complex configuration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-bold text-base hover:brightness-110 shadow-[var(--shadow-base)] transition-all touch-target"
            >
              <span>Create Your Free Account</span>
              <RiArrowRightLine size={18} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[color:var(--color-text)] font-semibold text-base hover:bg-[var(--color-background)] transition-all touch-target"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-xs text-[color:var(--color-muted)] font-medium">
            Multi-User Ready &bull; Completely Free &bull; Zero Advertisements
          </p>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="mt-auto py-8 bg-[var(--color-surface)] text-[color:var(--color-muted)] text-xs border-t border-[var(--color-border)]">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] flex items-center justify-center font-bold text-xs">
              FT
            </div>
            <span className="font-bold text-[color:var(--color-text)] font-[family-name:var(--font-heading)]">
              Finance Tracker
            </span>
            <span>&bull; Simplified Spending & Net Worth Management</span>
          </div>
          <p className="text-[11px] text-[color:var(--color-muted)]">
            Private Multi-User Support &bull; English &bull; Open-Source
          </p>
        </div>
      </footer>
    </div>
  );
};
