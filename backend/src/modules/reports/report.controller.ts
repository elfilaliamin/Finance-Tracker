import { Request, Response, NextFunction } from 'express';
import { reportService, ReportFilterParams } from './report.service.js';
import { streamCsvResponse } from './csvStream.js';
import { streamXlsxResponse } from './xlsxStream.js';
import { streamPdfResponse, PdfColumn } from './pdfStream.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class ReportController {
  preview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const from = (req.query.from || req.query.startDate) as string | undefined;
      const to = (req.query.to || req.query.endDate) as string | undefined;
      const type = (req.query.type as string) || 'all';

      const data = await reportService.getReportPreview(req.userId!, { from, to, type });
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const from = (req.query.from || req.query.startDate) as string | undefined;
      const to = (req.query.to || req.query.endDate) as string | undefined;
      const type = ((req.query.type as string) || 'spending') as 'income' | 'spending' | 'all';
      const filters: ReportFilterParams = {
        ...req.query,
        from,
        to,
        type: type === 'all' ? 'summary' : type,
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `finance_tracker_${type}_report_${timestamp}.csv`;

      let data;
      if (type === 'all') {
        data = await reportService.getUnifiedReportData(req.userId!, filters);
      } else if (type === 'income') {
        data = await reportService.getIncomeReportData(req.userId!, filters);
      } else {
        data = await reportService.getSpendingReportData(req.userId!, filters);
      }

      await streamCsvResponse(res, filename, data.headers, data.rows);
    } catch (err) {
      next(err);
    }
  };

  exportXlsx = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const from = (req.query.from || req.query.startDate) as string | undefined;
      const to = (req.query.to || req.query.endDate) as string | undefined;
      const type = ((req.query.type as string) || 'spending') as 'income' | 'spending' | 'all';
      const filters: ReportFilterParams = {
        ...req.query,
        from,
        to,
        type: type === 'all' ? 'summary' : type,
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `finance_tracker_${type}_report_${timestamp}.xlsx`;

      let data;
      if (type === 'all') {
        data = await reportService.getUnifiedReportData(req.userId!, filters);
      } else if (type === 'income') {
        data = await reportService.getIncomeReportData(req.userId!, filters);
      } else {
        data = await reportService.getSpendingReportData(req.userId!, filters);
      }

      const columns = data.headers.map((h) => ({
        header: h.toUpperCase(),
        key: h,
        width: 18,
      }));

      await streamXlsxResponse(res, filename, type.toUpperCase(), columns, data.rows);
    } catch (err) {
      next(err);
    }
  };

  exportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const from = (req.query.from || req.query.startDate) as string | undefined;
      const to = (req.query.to || req.query.endDate) as string | undefined;
      const type = ((req.query.type as string) || 'spending') as 'income' | 'spending' | 'all';
      const filters: ReportFilterParams = {
        ...req.query,
        from,
        to,
        type: type === 'all' ? 'summary' : type,
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `finance_tracker_${type}_report_${timestamp}.pdf`;

      let data;
      if (type === 'all') {
        data = await reportService.getUnifiedReportData(req.userId!, filters);
      } else if (type === 'income') {
        data = await reportService.getIncomeReportData(req.userId!, filters);
      } else {
        data = await reportService.getSpendingReportData(req.userId!, filters);
      }

      let columns: PdfColumn[];
      let summaryTotals: Array<{ label: string; value: string }>;

      if (type === 'spending') {
        columns = [
          { header: 'DATE', key: 'date', width: 55, align: 'left' },
          { header: 'ITEM / ARTICLE', key: 'articleName', width: 125, align: 'left' },
          { header: 'CATEGORY', key: 'category', width: 75, align: 'left' },
          { header: 'WALLET', key: 'wallet', width: 70, align: 'left' },
          { header: 'STORE', key: 'store', width: 65, align: 'left' },
          { header: 'QTY', key: 'quantity', width: 30, align: 'right' },
          { header: 'PRICE', key: 'unitPrice', width: 55, align: 'right' },
          { header: 'TOTAL', key: 'lineTotal', width: 60, align: 'right' },
        ];
        summaryTotals = [{ label: 'Consolidated Total (MAD)', value: data.grandTotalBase }];
      } else if (type === 'income') {
        columns = [
          { header: 'DATE', key: 'date', width: 60, align: 'left' },
          { header: 'DESCRIPTION', key: 'description', width: 145, align: 'left' },
          { header: 'SOURCE', key: 'source', width: 85, align: 'left' },
          { header: 'CATEGORY', key: 'category', width: 85, align: 'left' },
          { header: 'AMOUNT', key: 'originalAmount', width: 80, align: 'right' },
          { header: 'TOTAL (MAD)', key: 'convertedBaseAmount', width: 80, align: 'right' },
        ];
        summaryTotals = [{ label: 'Consolidated Total (MAD)', value: data.grandTotalBase }];
      } else {
        columns = [
          { header: 'DATE', key: 'date', width: 60, align: 'left' },
          { header: 'TYPE', key: 'type', width: 55, align: 'center' },
          { header: 'CATEGORY', key: 'category', width: 85, align: 'left' },
          { header: 'SOURCE / WALLET', key: 'sourceOrWallet', width: 85, align: 'left' },
          { header: 'DESCRIPTION', key: 'description', width: 110, align: 'left' },
          { header: 'AMOUNT', key: 'originalAmount', width: 70, align: 'right' },
          { header: 'TOTAL (MAD)', key: 'convertedBaseAmount', width: 70, align: 'right' },
        ];
        const unifiedData = data as any;
        summaryTotals = unifiedData.summary
          ? [
              { label: 'Total Income (MAD)', value: `${unifiedData.summary.totalIncome} DH` },
              { label: 'Total Spending (MAD)', value: `${unifiedData.summary.totalSpending} DH` },
              { label: 'Net Savings (MAD)', value: `${unifiedData.summary.netSavings} DH` },
            ]
          : [{ label: 'Consolidated Total (MAD)', value: data.grandTotalBase }];
      }

      await streamPdfResponse(res, filename, {
        title: `${type.toUpperCase()} STATEMENT`,
        subtitle: `Generated on ${timestamp} - Currency: MAD Consolidated`,
        currency: 'MAD',
        columns,
        rows: data.rows,
        summaryTotals,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const reportController = new ReportController();

