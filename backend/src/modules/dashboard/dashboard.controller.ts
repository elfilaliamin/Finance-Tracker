import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class DashboardController {
  getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const walletId = req.query.walletId as string | undefined;
      const metrics = await dashboardService.getMetrics(req.userId!, walletId);
      sendSuccess(res, metrics);
    } catch (err) {
      next(err);
    }
  };

  getIncomeTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const trend = await dashboardService.getIncomeTrend(req.userId!, year);
      sendSuccess(res, trend);
    } catch (err) {
      next(err);
    }
  };

  getSpendingMatrix = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const walletId = req.query.walletId as string | undefined;
      const matrix = await dashboardService.getSpendingMatrix(req.userId!, year, walletId);
      sendSuccess(res, matrix);
    } catch (err) {
      next(err);
    }
  };

  getNetWorthHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const history = await dashboardService.getNetWorthHistory(req.userId!);
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  };
}

export const dashboardController = new DashboardController();

