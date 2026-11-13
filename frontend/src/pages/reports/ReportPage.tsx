import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, FileSpreadsheet, Download, Calendar, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
      render: (r) => <span className="font-mono text-slate-800">{r.date}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${
            r.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {r.type}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (r) => <span className="text-slate-700">{r.category || 'General'}</span>,
    },
    {
      key: 'sourceOrWallet',
      header: 'Source / Wallet',
      render: (r) => <span className="text-slate-600 font-medium">{r.sourceOrWallet || '-'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => (
        <span
          className={`font-bold font-mono text-sm ${
            r.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Financial Reports & Exports</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate and stream clean CSV, Excel (XLSX), or PDF reports with UTF-8 BOM.
          </p>
        </div>

        {/* Streaming Download Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={!!isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm disabled:opacity-60 touch-target"
          >
            <Download size={14} />
            <span>{isExporting === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => handleExport('xlsx')}
            disabled={!!isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 shadow-sm disabled:opacity-60 touch-target"
          >
            <FileSpreadsheet size={14} />
            <span>{isExporting === 'xlsx' ? 'Exporting...' : 'Export XLSX'}</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={!!isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-60 touch-target"
          >
            <FileText size={14} />
            <span>{isExporting === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider mb-3">
          <Filter size={15} />
          <span>Report Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Transaction Scope</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold shadow-sm"
            >
              <option value="all">All (Income & Spending)</option>
              <option value="income">Income Only</option>
              <option value="spending">Spending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Banner */}
      {previewData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Total Income</span>
            <span className="text-xl font-bold font-mono text-emerald-600 mt-0.5 block">
              +{parseFloat(previewData.summary.totalIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs text-slate-400">{defaultCurrency}</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Total Spending</span>
            <span className="text-xl font-bold font-mono text-rose-600 mt-0.5 block">
              -{parseFloat(previewData.summary.totalSpending || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs text-slate-400">{defaultCurrency}</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Net Savings</span>
            <span className="text-xl font-bold font-mono text-indigo-700 mt-0.5 block">
              {parseFloat(previewData.summary.netSavings || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs text-slate-400">{defaultCurrency}</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Transactions</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
              {previewData.summary.count} records
            </span>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-800">Data Preview</h3>
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

