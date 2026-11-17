import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  RiWallet3Line,
  RiArrowRightDownLine,
  RiArrowRightUpLine,
  RiSwapLine,
  RiFilterLine,
  RiCalendarLine,
  RiSearchLine,
  RiHistoryLine,
  RiShoppingBag3Line,
  RiEqualizerLine,
  RiAddLine,
} from '@remixicon/react';
import { walletApi, Wallet, WalletTransactionItem, CreateWalletInput, CreateAdjustmentInput } from '@/api/walletApi';
import { dashboardApi, NetWorthHistoryPoint } from '@/api/dashboardApi';
import { incomeApi } from '@/api/incomeApi';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveChartWrapper } from '@/components/ui/ResponsiveChartWrapper';
import { WalletModal } from './components/WalletModal';
import { AdjustmentModal } from './components/AdjustmentModal';
import { TransferModal } from './components/TransferModal';

export const NetworthPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const baseCurrency = user?.baseCurrency || 'MAD';
  const currentYear = new Date().getFullYear();

  // Filters state
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('this_year');
  const [txFilterType, setTxFilterType] = useState<'all' | 'in' | 'spending' | 'transfer' | 'adjustment'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingWallet, setAdjustingWallet] = useState<Wallet | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferDefaultWallet, setTransferDefaultWallet] = useState<Wallet | null>(null);

  // Queries
  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.getWallets(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['dashboard', 'metrics', selectedWalletId !== 'all' ? selectedWalletId : undefined],
    queryFn: () => dashboardApi.getMetrics(selectedWalletId !== 'all' ? selectedWalletId : undefined),
  });

  const { data: serverAvailableYears = [] } = useQuery({
    queryKey: ['availableYears'],
    queryFn: () => incomeApi.getAvailableYears(),
  });

  // Fetch Net Worth & Debt Timeline for the 2 charts
  const { data: timelinePoints = [], isLoading: isTimelineLoading } = useQuery({
    queryKey: ['dashboard', 'netWorthHistory', selectedWalletId, selectedPeriod],
    queryFn: () =>
      dashboardApi.getNetWorthHistory({
        walletId: selectedWalletId !== 'all' ? selectedWalletId : undefined,
        period: selectedPeriod,
      }),
  });

  // Fetch Wallet Transactions for History List
  const { data: transactionsData, isLoading: isTxLoading } = useQuery({
    queryKey: ['walletTransactions', selectedWalletId],
    queryFn: () => walletApi.getTransactions(selectedWalletId || 'all'),
  });

  const transactions = transactionsData?.transactions || [];

  // Mutations
  const createWalletMutation = useMutation({
    mutationFn: (data: CreateWalletInput) => walletApi.createWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsWalletModalOpen(false);
    },
  });

  const updateWalletMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWalletInput> }) =>
      walletApi.updateWallet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsWalletModalOpen(false);
    },
  });

  const adjustmentMutation = useMutation({
    mutationFn: ({ walletId, data }: { walletId: string; data: CreateAdjustmentInput }) =>
      walletApi.createAdjustment(walletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsAdjustModalOpen(false);
      setAdjustingWallet(null);
    },
  });

  // Available older recorded years
  const olderRecordedYears = Array.from(new Set(serverAvailableYears))
    .filter((yr) => typeof yr === 'number' && !isNaN(yr) && yr < currentYear - 1 && yr <= currentYear)
    .sort((a, b) => b - a);

  // Categorize wallets and compute high-level stats
  const assetWallets = wallets.filter((w) => w.type === 'asset');
  const liabilityWallets = wallets.filter((w) => w.type === 'liability');

  const totalAssets = metrics?.totalAssets
    ? parseFloat(metrics.totalAssets)
    : assetWallets.reduce((sum, w) => sum + parseFloat(w.currentBalance || '0'), 0);
  const totalLiabilities = metrics?.totalLiabilities
    ? parseFloat(metrics.totalLiabilities)
    : liabilityWallets.reduce((sum, w) => sum + parseFloat(w.currentBalance || '0'), 0);
  const netWorthVal = metrics?.todayNetWorth || metrics?.todaysNetWorth;
  const netWorth = netWorthVal ? parseFloat(netWorthVal) : totalAssets - totalLiabilities;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (txFilterType === 'in' && t.direction !== 'in') return false;
      if (txFilterType === 'spending' && t.source !== 'spending') return false;
      if (txFilterType === 'transfer' && t.source !== 'transfer') return false;
      if (txFilterType === 'adjustment' && t.source !== 'adjustment') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query);
        const matchesStore = t.spendingDetails?.store?.toLowerCase().includes(query);
        const matchesWallet = t.walletName?.toLowerCase().includes(query);
        const matchesOtherWallet = t.transferDetails?.otherWalletName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesNotes && !matchesStore && !matchesWallet && !matchesOtherWallet) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, txFilterType, searchQuery]);

  const handleOpenTransfer = (wallet?: Wallet) => {
    setTransferDefaultWallet(wallet || null);
    setIsTransferModalOpen(true);
  };

  const handleOpenAdjust = (w: Wallet) => {
    setAdjustingWallet(w);
    setIsAdjustModalOpen(true);
  };

  const formatYAxis = (val: any) => {
    const num = typeof val === 'number' ? val : parseFloat(val || '0');
    if (isNaN(num)) return '0';
    if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return String(num);
  };

  const customTooltipFormatter = (val: any, name: string) => {
    const num = typeof val === 'number' ? val : parseFloat(val || '0');
    const safeNum = isNaN(num) ? 0 : num;
    return [`${safeNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${baseCurrency}`, name];
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">
            Net Worth & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Monitor real-world asset holdings, debt exposure, and unified wallet transactions.
          </p>
        </div>

        {/* Action Buttons with Prominent Transfer */}
        <div className="flex items-center gap-2">
          {wallets.length >= 2 && (
            <button
              onClick={() => handleOpenTransfer()}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white font-medium text-xs sm:text-sm hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all touch-target"
            >
              <RiSwapLine className="w-4 h-4" />
              <span>Transfer Money</span>
            </button>
          )}

          <button
            onClick={() => {
              if (wallets.length > 0) {
                const initialWallet =
                  (selectedWalletId !== 'all' && wallets.find((w) => w.id === selectedWalletId)) ||
                  wallets[0];
                handleOpenAdjust(initialWallet);
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold text-xs sm:text-sm hover:bg-[var(--color-primary-bg)] shadow-[var(--shadow-sm)] transition-all touch-target"
          >
            <span>Adjust Balance</span>
          </button>

          <button
            onClick={() => {
              setEditingWallet(null);
              setIsWalletModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold text-xs sm:text-sm hover:bg-[var(--color-primary-bg)] shadow-[var(--shadow-sm)] transition-all touch-target"
          >
            <RiAddLine className="w-4 h-4" />
            <span>New Wallet</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Net Worth */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Net Worth
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
              <RiWallet3Line className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-text)] tracking-wider">
              {netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Assets minus liabilities</p>
        </div>

        {/* Total Assets */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Assets
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
              <RiArrowRightUpLine className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-accent)] tracking-wider">
              +{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{assetWallets.length} active asset accounts</p>
        </div>

        {/* Total Liabilities */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Liabilities & Debts
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-base)] bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20 flex items-center justify-center">
              <RiArrowRightDownLine className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-danger)] tracking-wider">
              -{totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{liabilityWallets.length} debt accounts</p>
        </div>
      </div>

      {/* Global Filter Bar (Time & Wallet Filters) */}
      <div className="bg-[var(--color-surface)] p-3.5 rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[var(--color-text)] font-semibold text-xs sm:text-sm">
          <RiFilterLine className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Analytics Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Period Filter */}
          <div className="flex items-center gap-1.5 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-[var(--radius-base)] px-2.5 py-1.5">
            <RiCalendarLine className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[var(--color-text)] focus:outline-none"
            >
              <option value="this_month" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                This Month
              </option>
              <option value="last_month" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                Last Month
              </option>
              <option value="this_year" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                This Year ({currentYear})
              </option>
              <option value="last_year" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                Last Year ({currentYear - 1})
              </option>
              {olderRecordedYears.map((yr) => (
                <option key={yr} value={String(yr)} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  {yr}
                </option>
              ))}
              <option value="all" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                All Time
              </option>
            </select>
          </div>

          {/* Wallet Filter */}
          <div className="flex items-center gap-1.5 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-[var(--radius-base)] px-2.5 py-1.5">
            <RiWallet3Line className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[var(--color-text)] focus:outline-none"
            >
              <option value="all" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                All Wallets ({wallets.length})
              </option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  {w.name} ({parseFloat(w.currentBalance).toFixed(2)} {w.defaultCurrency})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2 Charts Grid (Net Worth & Debt) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Net Worth Trajectory */}
        <ResponsiveChartWrapper
          title="Net Worth Trajectory"
          subtitle={`Balance evolution over time (${baseCurrency})`}
        >
          {isTimelineLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)]">
              Loading net worth trajectory...
            </div>
          ) : timelinePoints.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)]">
              No balance records for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelinePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="nwTrajectoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
                <Tooltip
                  formatter={(val: any) => customTooltipFormatter(val, 'Net Worth')}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-base)',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-base)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  name="Net Worth"
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#nwTrajectoryGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ResponsiveChartWrapper>

        {/* Chart 2: Debt & Liabilities Exposure */}
        <ResponsiveChartWrapper
          title="Debt & Liabilities Exposure"
          subtitle={`Total debt trajectory (${baseCurrency})`}
        >
          {isTimelineLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)]">
              Loading debt trajectory...
            </div>
          ) : timelinePoints.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)]">
              No debt records for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelinePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="debtExposureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} tickFormatter={formatYAxis} />
                <Tooltip
                  formatter={(val: any) => customTooltipFormatter(val, 'Debt / Liability')}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-base)',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-base)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="debt"
                  name="Debt Balance"
                  stroke="var(--color-danger)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#debtExposureGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ResponsiveChartWrapper>
      </div>

      {/* History of Transactions in the Wallet with Wallet Filter */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center">
              <RiHistoryLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--color-text)]">
                Wallet Transactions History
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                {selectedWalletId === 'all'
                  ? 'All wallet movements: money added, spendings, and transfers.'
                  : `Filtered by: ${wallets.find((w) => w.id === selectedWalletId)?.name || 'Selected Wallet'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wallets.length >= 2 && (
              <button
                onClick={() => handleOpenTransfer()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-base)] bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20 transition-colors touch-target"
              >
                <RiSwapLine size={14} />
                <span>Transfer</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Tabs */}
          <div className="flex items-center rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] p-1 border border-[var(--color-border)] text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setTxFilterType('all')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 ${
                txFilterType === 'all'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setTxFilterType('in')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 flex items-center gap-1 ${
                txFilterType === 'in'
                  ? 'bg-[var(--color-surface)] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span>Added (+)</span>
            </button>
            <button
              onClick={() => setTxFilterType('spending')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 flex items-center gap-1 ${
                txFilterType === 'spending'
                  ? 'bg-[var(--color-surface)] text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span>Spending (-)</span>
            </button>
            <button
              onClick={() => setTxFilterType('transfer')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 flex items-center gap-1 ${
                txFilterType === 'transfer'
                  ? 'bg-[var(--color-surface)] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span>Transfers</span>
            </button>
            <button
              onClick={() => setTxFilterType('adjustment')}
              className={`px-3 py-1.5 rounded-[var(--radius-base)] transition-all shrink-0 ${
                txFilterType === 'adjustment'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Adjustments
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <RiSearchLine className="absolute left-3 top-2.5 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store, note, wallet..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="max-h-[420px] overflow-y-auto space-y-2.5 pr-1 divide-y divide-[var(--color-border)]">
          {isTxLoading ? (
            <div className="py-12 flex justify-center text-xs text-[var(--color-text-muted)]">
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
              <RiHistoryLine className="w-10 h-10 mx-auto text-[var(--color-text-muted)]/40 mb-2" />
              <p className="text-sm font-medium">No transactions recorded.</p>
              <p className="text-xs mt-1">
                {searchQuery || txFilterType !== 'all'
                  ? 'Try clearing the search or filter.'
                  : 'Money added to wallets, transfers, and spendings will be tracked here.'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((t) => {
              const isTransfer = t.source === 'transfer';
              const isTransferReceiver = isTransfer && t.direction === 'in';
              const isTransferSender = isTransfer && t.direction === 'out';
              const isSpending = t.source === 'spending';
              const isReconcile = t.type === 'reconcile';
              const isAdded = !isTransfer && t.direction === 'in';

              // Visual styling mapping per user requirements:
              // Receiver: in blue
              // Sender (wallet that gives): in red
              // Spending: in red
              // Regular added: in green
              let badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
              let badgeLabel = 'Transfer In';
              let iconColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
              let amountColor = 'text-blue-600 dark:text-blue-400';
              let IconComponent = RiArrowRightDownLine;

              if (isTransferReceiver) {
                badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
                badgeLabel = t.transferDetails?.otherWalletName
                  ? `From ${t.transferDetails.otherWalletName}`
                  : 'Transfer In';
                iconColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                amountColor = 'text-blue-600 dark:text-blue-400';
                IconComponent = RiArrowRightDownLine;
              } else if (isTransferSender) {
                badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                badgeLabel = t.transferDetails?.otherWalletName
                  ? `To ${t.transferDetails.otherWalletName}`
                  : 'Transfer Out';
                iconColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
                amountColor = 'text-rose-600 dark:text-rose-400';
                IconComponent = RiArrowRightUpLine;
              } else if (isSpending) {
                badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                badgeLabel = 'Spending';
                iconColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
                amountColor = 'text-rose-600 dark:text-rose-400';
                IconComponent = RiShoppingBag3Line;
              } else if (isReconcile) {
                badgeColor = 'bg-[var(--color-primary-bg)] text-[var(--color-accent)] border-[var(--color-border)]';
                badgeLabel = 'Reconciliation';
                iconColor = 'bg-[var(--color-primary-bg)] text-[var(--color-accent)]';
                amountColor =
                  t.direction === 'in'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400';
                IconComponent = RiEqualizerLine;
              } else if (isAdded) {
                badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                badgeLabel = t.source === 'income' ? 'Income' : 'Money Added';
                iconColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                amountColor = 'text-emerald-600 dark:text-emerald-400';
                IconComponent = RiArrowRightDownLine;
              } else {
                badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                badgeLabel = 'Deduction';
                iconColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
                amountColor = 'text-rose-600 dark:text-rose-400';
                IconComponent = RiArrowRightUpLine;
              }

              return (
                <div
                  key={`${t.source}-${t.id}`}
                  className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-[var(--color-text)] truncate">
                          {t.title}
                        </h4>

                        {/* Wallet badge */}
                        {t.walletName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-medium bg-[var(--color-primary-bg)] text-[var(--color-text)] border border-[var(--color-border)]">
                            {t.walletColor && (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: t.walletColor }}
                              />
                            )}
                            <span>{t.walletName}</span>
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-[var(--radius-pill)] border ${badgeColor}`}
                        >
                          {badgeLabel}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                          {t.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <RiCalendarLine className="w-3 h-3" />
                          {t.date}
                        </span>
                        {t.adjustmentDetails && (
                          <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                            Balance: {parseFloat(t.adjustmentDetails.resultingBalance).toFixed(2)} {t.currency}
                          </span>
                        )}
                        {t.transferDetails?.exchangeRate && t.transferDetails.exchangeRate !== '1' && (
                          <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                            Rate: {parseFloat(t.transferDetails.exchangeRate).toFixed(4)}
                          </span>
                        )}
                        {t.notes && t.notes !== t.description && (
                          <span className="italic truncate max-w-[200px]">
                            &ldquo;{t.notes}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm sm:text-base font-bold font-mono tracking-wide ${amountColor}`}>
                      {t.signedAmount}{' '}
                      <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                        {t.currency}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add / Edit Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={editingWallet}
        onSubmit={async (data) => {
          if (editingWallet) {
            await updateWalletMutation.mutateAsync({ id: editingWallet.id, data });
          } else {
            await createWalletMutation.mutateAsync(data);
          }
        }}
        defaultCurrency={baseCurrency}
      />

      {/* Balance Adjustment Modal */}
      {adjustingWallet && (
        <AdjustmentModal
          isOpen={isAdjustModalOpen}
          onClose={() => {
            setIsAdjustModalOpen(false);
            setAdjustingWallet(null);
          }}
          wallet={adjustingWallet}
          wallets={wallets}
          onSubmit={async (input, targetWalletId) => {
            const finalWalletId = targetWalletId || adjustingWallet.id;
            await adjustmentMutation.mutateAsync({
              walletId: finalWalletId,
              data: input,
            });
          }}
        />
      )}

      {/* Transfer Funds Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferDefaultWallet(null);
        }}
        wallets={wallets}
        defaultFromWalletId={transferDefaultWallet?.id}
        onTransferSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['wallets'] });
          queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
};
