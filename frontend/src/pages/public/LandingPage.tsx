import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  RiReceiptLine,
  RiShieldCheckLine,
  RiGlobalLine,
  RiArrowRightLine,
  RiSunLine,
  RiMoonLine,
  RiCheckLine,
  RiAddLine,
  RiSubtractLine,
  RiLineChartLine,
  RiPieChartLine,
  RiSafe2Line,
  RiSparkling2Fill,
  RiMenuLine,
  RiCloseLine,
} from '@remixicon/react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AppLogo } from '@/components/ui/AppLogo';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const bigThree = [
    {
      num: '01',
      title: 'Know Your Net Worth',
      description:
        'See all your bank accounts, cash in hand, and savings combined in one honest, real-time total.',
    },
    {
      num: '02',
      title: 'Track Your Spending',
      description:
        'Log daily expenses and itemized receipts in seconds so you know exactly where every dollar goes.',
    },
    {
      num: '03',
      title: 'Grow Your Savings',
      description:
        'Clear visual reports show your habits and celebrate hitting your financial targets month after month.',
    },
  ];

  const steps = [
    {
      step: 'Step 1',
      title: 'Add your accounts & wallets',
      description:
        'Put in your bank accounts, physical cash, and savings. The dashboard adds them all together so you instantly know your true balance.',
      badge: 'Unified Balance',
    },
    {
      step: 'Step 2',
      title: 'Log your daily spending',
      description:
        'Record everyday purchases in seconds. Add simple expense totals or full grocery receipts with itemized prices to see where cash really goes.',
      badge: 'Easy Logging',
    },
    {
      step: 'Step 3',
      title: 'Watch your savings grow',
      description:
        'Open your simplified reports to see clear category breakdowns, track monthly trends, and celebrate hitting your savings targets.',
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
    <div className="min-h-screen bg-[var(--color-background)] text-[color:var(--color-text)] font-[family-name:var(--font-body)] flex flex-col text-base">
      {/* 1. Header (Navbar + AppLogo, Desktop + Mobile Hamburger Menu) */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-[var(--z-sticky)]">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <AppLogo size={40} className="group-hover:scale-105 transition-transform shadow-[var(--shadow-sm)]" />
            <span className="font-extrabold text-xl sm:text-2xl font-[family-name:var(--font-heading)] tracking-tight text-[color:var(--color-text)]">
              Finance Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-base font-semibold text-[color:var(--color-muted)]">
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

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              className="p-2.5 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[var(--color-background)] transition-colors touch-target"
            >
              {isDark ? <RiSunLine size={20} /> : <RiMoonLine size={20} />}
            </button>
            <Link
              to="/login"
              className="px-4 py-2.5 text-base font-semibold text-[color:var(--color-text)] hover:text-[color:var(--color-primary-text)] transition-colors touch-target"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-base font-bold text-[color:var(--color-on-primary)] bg-[var(--color-primary)] hover:brightness-110 rounded-[var(--radius-base)] shadow-[var(--shadow-sm)] transition-all touch-target"
            >
              <span>Start Free</span>
              <RiArrowRightLine size={18} />
            </Link>
          </div>

          {/* Mobile Hamburger & Theme Toggle Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              className="p-2.5 rounded-[var(--radius-base)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] transition-colors touch-target"
            >
              {isDark ? <RiSunLine size={20} /> : <RiMoonLine size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2.5 rounded-[var(--radius-base)] text-[color:var(--color-text)] bg-[var(--color-background)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/30 transition-colors touch-target"
            >
              {mobileMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 space-y-4 shadow-lg animate-fadeIn">
            <nav className="flex flex-col space-y-3.5 text-base font-bold text-[color:var(--color-text)]">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[color:var(--color-primary-text)] transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[color:var(--color-primary-text)] transition-colors"
              >
                Features
              </a>
              <a
                href="#reports"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[color:var(--color-primary-text)] transition-colors"
              >
                Dashboard & Reports
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[color:var(--color-primary-text)] transition-colors"
              >
                FAQ
              </a>
            </nav>

            <div className="pt-4 border-t border-[var(--color-border)] flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-base font-bold text-[color:var(--color-text)] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-base)] hover:bg-[var(--color-border)]/40 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-base font-bold text-[color:var(--color-on-primary)] bg-[var(--color-primary)] rounded-[var(--radius-base)] shadow-[var(--shadow-sm)] hover:brightness-110 transition-all"
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section: No Sign In button here (kept in navbar) */}
      <section className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 flex flex-col items-start text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-sm font-bold text-[color:var(--color-primary-text)] mb-6 transition-all duration-300 hover:scale-105">
              <RiSparkling2Fill size={16} className="text-amber-500 animate-pulse" />
              <span>Simple Personal Finance &bull; 100% Free</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] tracking-tight leading-[1.12] mb-6">
              Track your spending. Watch your net worth grow.
            </h1>

            <p className="text-lg sm:text-xl text-[color:var(--color-muted)] mb-8 max-w-xl leading-relaxed">
              No complicated spreadsheets and no confusing financial jargon. See all your bank accounts and cash in one simple dashboard, track where your money goes every day, and build lasting savings with clean visual reports.
            </p>

            {/* Hero CTA: Only Primary "Create Free Account" button (Sign In kept in navbar) */}
            <div className="w-full sm:w-auto mb-8">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-bold text-lg hover:brightness-110 shadow-[var(--shadow-base)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 touch-target"
              >
                <span>Create Free Account</span>
                <RiArrowRightLine size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust points with bigger text */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm sm:text-base font-semibold text-[color:var(--color-muted)]">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <RiCheckLine size={18} />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <RiCheckLine size={18} />
                <span>Your Data Stays Strictly Private</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <RiCheckLine size={18} />
                <span>MAD, USD & EUR Ready</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Money Saving & Growth Image (Clean Solid Frame, No Glass) */}
          <div className="lg:col-span-6 w-full animate-fade-in">
            <div className="rounded-[20px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-hover)] transition-card hover:shadow-xl group">
              {/* Card top banner */}
              <div className="px-5 py-3.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span className="text-sm font-bold text-[color:var(--color-text)]">
                    Smart Wealth Growth & Savings
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-float-gentle">
                  +24% Saved This Year
                </span>
              </div>

              {/* Solid image frame */}
              <div className="relative bg-[var(--color-background)] overflow-hidden">
                <img
                  src="/growing-money.jpg"
                  alt="Personal savings and money growing with piggy bank and financial chart"
                  className="w-full h-auto object-cover max-h-[440px] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                {/* Solid bottom status card */}
                <div className="p-4 sm:p-5 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-105">
                      <RiLineChartLine size={22} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-[color:var(--color-muted)]">Total Net Worth</div>
                      <div className="text-lg sm:text-xl font-black text-[color:var(--color-text)]">142,500.00 MAD</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-semibold text-[color:var(--color-muted)]">Monthly Savings</div>
                    <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">+5,200.00 MAD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 3 Cards: Perfectly consistent, aligned view with smooth hover */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-8 sm:py-10 reveal-on-scroll scroll-driven-view">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {bigThree.map((item) => (
              <div
                key={item.num}
                className="p-6 sm:p-7 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)] text-left flex flex-col justify-between h-full shadow-[var(--shadow-sm)] transition-card hover:border-[var(--color-primary)]/40 hover:shadow-md group cursor-default"
              >
                <div>
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[color:var(--color-primary-text)] mb-3 block group-hover:translate-x-1 transition-transform duration-200">
                    {item.num}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] mb-3 leading-snug whitespace-nowrap">
                    {item.title}
                  </h3>
                  <p className="text-base sm:text-lg text-[color:var(--color-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works: 3 Simple Steps (Text Left & Readable with hover transitions) */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full reveal-on-scroll scroll-driven-view">
        <div className="text-left max-w-3xl mb-14">
          <span className="text-sm font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] leading-tight">
            How it works in 3 easy steps
          </h2>
          <p className="text-lg text-[color:var(--color-muted)] mt-3">
            Taking control of your money has never been this straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="p-6 sm:p-7 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] flex flex-col justify-between text-left h-full transition-card hover:border-[var(--color-primary)]/40 hover:shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-black text-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {index + 1}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-background)] border border-[var(--color-border)] text-[color:var(--color-primary-text)]">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="text-base sm:text-lg text-[color:var(--color-muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Simplified Dashboard & Reports Showcase */}
      <section id="reports" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)] border-y border-[var(--color-border)] w-full reveal-on-scroll scroll-driven-view">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            {/* Left Image Card: Matched height with right narrative */}
            <div className="lg:col-span-6 flex flex-col h-full">
              <div className="h-full flex flex-col justify-between rounded-[18px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]">
                {/* Visual Image container with flex-1 to fill all vertical height */}
                <div className="relative flex-1 w-full min-h-[260px] sm:min-h-[320px] overflow-hidden bg-slate-950">
                  <img
                    src="/spending-reports.jpg"
                    alt="Simplified financial reports, category breakdown rings, and wealth trajectory insights"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Spending breakdown card footer */}
                <div className="p-5 sm:p-6 bg-[var(--color-surface)] border-t border-[var(--color-border)] text-left shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-[color:var(--color-text)] uppercase tracking-wide">
                      Monthly Spending Breakdown
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      Under Budget
                    </span>
                  </div>
                  {/* Visual progress bar */}
                  <div className="w-full h-3.5 bg-[var(--color-background)] rounded-full overflow-hidden flex border border-[var(--color-border)]">
                    <div className="h-full bg-emerald-500 w-[45%]" title="Housing & Bills 45%" />
                    <div className="h-full bg-teal-500 w-[25%]" title="Groceries 25%" />
                    <div className="h-full bg-amber-500 w-[15%]" title="Shopping 15%" />
                    <div className="h-full bg-blue-500 w-[15%]" title="Saved 15%" />
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[color:var(--color-muted)] mt-3 font-semibold">
                    <span>Bills (45%)</span>
                    <span>Food (25%)</span>
                    <span>Shopping (15%)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Saved (15%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Narrative (Text Left, Smaller Subtitles & Height-Matched) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 text-left h-full">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] border border-[var(--color-border)] mb-3">
                    <RiPieChartLine size={16} />
                    <span>Simplified Reports & Insights</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] leading-tight">
                    Clear reports that actually help you save money
                  </h2>
                </div>
                <p className="text-base sm:text-lg text-[color:var(--color-muted)] leading-relaxed">
                  Most budgeting apps overload you with complicated tables and confusing graphs. Finance Tracker gives you simple, easy-to-read reports that answer the only two questions that matter:
                </p>

                <div className="space-y-3.5">
                  <div className="p-4 sm:p-4.5 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)] flex items-start gap-3.5 text-left">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-[color:var(--color-text)]">
                        "Where did my money go this month?"
                      </h4>
                      <p className="text-xs sm:text-sm text-[color:var(--color-muted)] mt-0.5 leading-relaxed">
                        Visual category charts reveal exactly which categories take up most of your income.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-4.5 rounded-[var(--radius-base)] bg-[var(--color-background)] border border-[var(--color-border)] flex items-start gap-3.5 text-left">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-[color:var(--color-text)]">
                        "Is my total net worth going up or down?"
                      </h4>
                      <p className="text-xs sm:text-sm text-[color:var(--color-muted)] mt-0.5 leading-relaxed">
                        Track your wealth trajectory over time and celebrate every milestone as your debts shrink and savings grow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] text-base font-bold shadow-[var(--shadow-sm)] hover:brightness-110 transition-all"
                >
                  <span>See your reports for free</span>
                  <RiArrowRightLine size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Grid: The 6 Core Essentials (Bigger, readable text with smooth hover transitions) */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[var(--breakpoint-wide)] mx-auto w-full reveal-on-scroll scroll-driven-view">
        <div className="text-left max-w-3xl mb-14">
          <span className="text-sm font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Everything You Need
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] leading-tight">
            Built for simple, stress-free money management
          </h2>
          <p className="text-lg text-[color:var(--color-muted)] mt-2">
            No bloated menus. Just the essential tools you need to track spending and save money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 sm:p-7 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] hover:shadow-md transition-card hover:border-[var(--color-primary)]/40 flex flex-col justify-between text-left group"
              >
                <div>
                  <div className="w-12 h-12 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[color:var(--color-primary-text)] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-[color:var(--color-on-primary)] transition-all duration-300 shadow-sm">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] text-[color:var(--color-text)] mb-3 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-base sm:text-lg text-[color:var(--color-muted)] leading-relaxed mb-5">
                    {feat.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--color-border)] text-sm sm:text-base font-semibold text-[color:var(--color-primary-text)] flex items-center gap-2">
                  <RiCheckLine size={18} />
                  <span>{feat.benefit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Frequently Asked Questions: Text to the Left, +/- Button to the Right */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full reveal-on-scroll scroll-driven-view">
        <div className="text-left mb-12">
          <span className="text-sm font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-2 block">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-[color:var(--color-muted)] mt-2">
            Everything you need to know about setting up and using Finance Tracker.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-[var(--shadow-sm)] text-left transition-all duration-200 hover:border-[var(--color-primary)]/40"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left font-bold text-lg sm:text-xl text-[color:var(--color-text)] hover:bg-[var(--color-background)] transition-colors duration-150 touch-target gap-4"
                >
                  <span className="text-left flex-1">{faq.q}</span>
                  <span className={`shrink-0 p-1.5 rounded-full bg-[var(--color-background)] text-[color:var(--color-primary-text)] border border-[var(--color-border)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    {isOpen ? (
                      <RiSubtractLine size={20} className="shrink-0" />
                    ) : (
                      <RiAddLine size={20} className="shrink-0" />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 text-base sm:text-lg text-[color:var(--color-muted)] leading-relaxed text-left border-t border-[var(--color-border)] bg-[var(--color-background)]/40 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Call to Action Banner: Sign In button removed (kept only on navbar) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary-bg)] border-t border-[var(--color-border)] text-center reveal-on-scroll scroll-driven-view">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-heading)] text-[color:var(--color-text)] tracking-tight mb-5 leading-tight">
            Start tracking your spending and growing your wealth today
          </h2>
          <p className="text-lg sm:text-xl text-[color:var(--color-muted)] mb-8 leading-relaxed">
            Set up your free account in under 30 seconds. No credit card needed, no complex configuration.
          </p>
          <div className="flex justify-center">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-[color:var(--color-on-primary)] font-bold text-lg hover:brightness-110 shadow-[var(--shadow-base)] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 touch-target"
            >
              <span>Create Your Free Account</span>
              <RiArrowRightLine size={20} />
            </Link>
          </div>
          <p className="mt-5 text-sm sm:text-base text-[color:var(--color-muted)] font-medium">
            Multi-User Ready &bull; Completely Free &bull; Zero Advertisements
          </p>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="mt-auto py-8 bg-[var(--color-surface)] text-[color:var(--color-muted)] text-sm border-t border-[var(--color-border)]">
        <div className="max-w-[var(--breakpoint-wide)] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AppLogo size={32} />
            <span className="font-bold text-[color:var(--color-text)] font-[family-name:var(--font-heading)] text-base">
              Finance Tracker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[color:var(--color-muted)]">
            Private Multi-User Support &bull; English &bull; Open-Source
          </p>
        </div>
      </footer>
    </div>
  );
};
