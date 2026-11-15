import { Request, Response, NextFunction } from 'express';
import { reportService, ReportFilterParams } from './report.service.js';
import { streamCsvResponse } from './csvStream.js';
import { streamXlsxResponse } from './xlsxStream.js';
import { streamPdfResponse } from './pdfStream.js';
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
      const filters = req.query as unknown as ReportFilterParams;
      const type = filters.type || 'spending';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `finance_tracker_${type}_report_${timestamp}.csv`;

      let data;
      if (type === 'income') {
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
      const filters = req.query as unknown as ReportFilterParams;
      const type = filters.type || 'spending';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `finance_tracker_${type}_report_${timestamp}.xlsx`;

      let data;
      if (type === 'income') {
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
      const filters = req.query as unknown as ReportFilterParams;
      const type = filters.type || 'spending';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `finance_tracker_${type}_report_${timestamp}.pdf`;

      let data;
      if (type === 'income') {
        data = await reportService.getIncomeReportData(req.userId!, filters);
      } else {
        data = await reportService.getSpendingReportData(req.userId!, filters);
      }

      const headers = data.headers.slice(0, 5).map((h) => h.toUpperCase());
      const rows = data.rows.map((r) =>
        data.headers.slice(0, 5).map((h) => String(r[h as keyof typeof r]))
      );

      await streamPdfResponse(res, filename, {
        title: `${type.toUpperCase()} STATEMENT`,
        subtitle: `Generated on ${timestamp} - Currency: MAD Consolidated`,
        currency: 'MAD',
        headers,
        rows,
        summaryTotals: [{ label: 'Consolidated Total (MAD)', value: data.grandTotalBase }],
      });
    } catch (err) {
      next(err);
    }
  };
}

export const reportController = new ReportController();

