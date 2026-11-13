import { api } from './client';

export interface ReportPreviewItem {
  id: string;
  type: 'income' | 'spending';
  date: string;
  amount: string;
  currency: string;
  category: string;
  sourceOrWallet?: string;
  description?: string;
}

export interface ReportPreviewResponse {
  summary: {
    totalIncome: string;
    totalSpending: string;
    netSavings: string;
    count: number;
  };
  rows: ReportPreviewItem[];
}

export const reportApi = {
  getPreview: (filters: { startDate?: string; endDate?: string; type?: 'all' | 'income' | 'spending' }) =>
    api.get<ReportPreviewResponse>('/reports/preview', filters),

  downloadCsv: (filters: { startDate?: string; endDate?: string; type?: 'all' | 'income' | 'spending' }) =>
    api.download('/reports/export/csv', 'finance-tracker-report.csv', filters),

  downloadXlsx: (filters: { startDate?: string; endDate?: string; type?: 'all' | 'income' | 'spending' }) =>
    api.download('/reports/export/xlsx', 'finance-tracker-report.xlsx', filters),

  downloadPdf: (filters: { startDate?: string; endDate?: string; type?: 'all' | 'income' | 'spending' }) =>
    api.download('/reports/export/pdf', 'finance-tracker-report.pdf', filters),
};

