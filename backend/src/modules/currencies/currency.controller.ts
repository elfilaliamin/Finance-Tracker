import { Request, Response, NextFunction } from 'express';
import { currencyService } from './currency.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class CurrencyController {
  getCurrencies = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currencies = await currencyService.getCurrencies();
      sendSuccess(res, currencies);
    } catch (err) {
      next(err);
    }
  };

  getLatestRates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rates = await currencyService.getLatestRates();
      sendSuccess(res, rates);
    } catch (err) {
      next(err);
    }
  };

  syncRates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await currencyService.syncRatesFromProvider();
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  setManualRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { base, target, rate, date } = req.body;
      const result = await currencyService.setManualRate(base, target, rate, date);
      sendSuccess(res, result, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { from, to } = req.query as { from?: string; to?: string };
      const history = await currencyService.getRateHistory(from, to);
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  };
}

export const currencyController = new CurrencyController();

