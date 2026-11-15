import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RiFileTextLine,
  RiFileExcelLine,
  RiDownloadLine,
  RiFilterLine,
} from '@remixicon/react';
import { reportApi } from '@/api/reportApi';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveTable, Column } from '@/components/ui/ResponsiveTable';

export const ReportPage: React.FC = () => {
  const { user } = useAuth();
  const defaultCurrency = user?.baseCurrency || 'MAD';

  // Date filters (defaults to current year)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const [type, setType] = useState<'all' | 'income' | 'spending'>('all');

  const [isExporting, setIsExporting] = useState<string | null>(null);

  const { data: previewData, isLoading } = useQuery({
    queryKey: ['reportPreview', startDate, endDate, type],
    queryFn: () => reportApi.getPreview({ startDate, endDate, type }),
  });

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      setIsExporting(format);
      if (format === 'csv') {
        await reportApi.downloadCsv({ startDate, endDate, type });
      } else if (format === 'xlsx') {
        await reportApi.downloadXlsx({ startDate, endDate, type });
      } else if (format === 'pdf') {
        await reportApi.downloadPdf({ startDate, endDate, type });
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(null);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (r) => <span className="font-mono text-[var(--color-text)]">{r.date}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold capitalize border ${
            r.type === 'income'
              ? 'bg-[var(--color-primary-bg)] text-[var(--color-accent)] border-[var(--color-border)]'
              : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20'
          }`}
        >
          {r.type}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (r) => <span className="text-[var(--color-text)]">{r.category || 'General'}</span>,
    },
    {
      key: 'sourceOrWallet',
      header: 'Source / Wallet',
      render: (r) => <span className="text-[var(--color-text-muted)] font-medium">{r.sourceOrWallet || '-'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => (
        <span
          className={`font-bold font-mono text-sm ${
            r.type === 'income' ? 'text-[var(--color-accent)]' : 'text-[var(--color-danger)]'
          }`}
        >
          {r.type === 'income' ? '+' : '-'}
          {parseFloat(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
          {r.currency}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text)]">Financial Reports & Exports</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Generate and stream clean CSV, Excel (XLSX), or PDF reports with UTF-8 BOM.
          </p>
        </div>

        {/* Streaming Download Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={!!isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-base)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-semibold hover:bg-[var(--color-primary-bg)] shadow-[var(--shadow-sm)] disabled:opacity-60 touch-target transition-colors"
          >
            <RiDownloadLine className="w-4 h-4" />
            <span>{isExporting === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => handleExport('xlsx')}
            disabled={!!isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-[var(--color-accent)] text-xs font-semibold hover:bg-[var(--color-border)]/50 shadow-[var(--shadow-sm)] disabled:opacity-60 touch-target transition-colors"
          >
            <RiFileExcelLine className="w-4 h-4" />
            <span>{isExporting === 'xlsx' ? 'Exporting...' : 'Export XLSX'}</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={!!isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)] disabled:opacity-60 touch-target transition-colors"
          >
            <RiFileTextLine className="w-4 h-4" />
            <span>{isExporting === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters Card */}
      <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2 text-[var(--color-text)] font-semibold text-xs uppercase tracking-wider mb-3">
          <RiFilterLine className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Report Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-mono shadow-sm focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-mono shadow-sm focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Transaction Scope</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-semibold shadow-sm focus:ring-1 focus:ring-[var(--color-ring)] focus:outline-none"
            >
              <option value="all" className="bg-[var(--color-surface)] text-[var(--color-text)]">All (Income & Spending)</option>
              <option value="income" className="bg-[var(--color-surface)] text-[var(--color-text)]">Income Only</option>
              <option value="spending" className="bg-[var(--color-surface)] text-[var(--color-text)]">Spending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Banner */}
      {previewData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium block">Total Income</span>
            <span className="text-xl font-bold font-mono text-[var(--color-accent)] mt-0.5 block">
              +{parseFloat(previewData.summary?.totalIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs text-[var(--color-text-muted)]">{defaultCurrency}</span>
            </span>
          </div>

          <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium block">Total Spending</span>
            <span className="text-xl font-bold font-mono text-[var(--color-danger)] mt-0.5 block">
              -{parseFloat(previewData.summary?.totalSpending || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs text-[var(--color-text-muted)]">{defaultCurrency}</span>
            </span>
          </div>

          <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium block">Net Savings</span>
            <span className="text-xl font-bold font-mono text-[var(--color-text)] mt-0.5 block">
              {parseFloat(previewData.summary?.netSavings || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs text-[var(--color-text-muted)]">{defaultCurrency}</span>
            </span>
          </div>

          <div className="bg-[var(--color-surface)] rounded-[var(--radius-surface)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium block">Transactions</span>
            <span className="text-xl font-bold font-mono text-[var(--color-text)] mt-0.5 block">
              {previewData.summary?.count ?? previewData.rows?.length ?? 0} records
            </span>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-heading font-bold text-[var(--color-text)]">Data Preview</h3>
        <ResponsiveTable
          columns={columns}
          data={previewData?.rows || []}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="No transactions found in selected date range."
        />
      </div>
    </div>
  );
};

