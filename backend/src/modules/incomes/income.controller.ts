import { Request, Response, NextFunction } from 'express';
import { incomeService } from './income.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';
import { IncomeFilterInput } from './income.schemas.js';

export class IncomeController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as IncomeFilterInput;
      const result = await incomeService.listIncomes(req.userId!, filters);
      const mappedRows = result.rows.map((r: any) => ({
        ...r,
        sourceName: r.source?.title || 'Unknown Source',
        sourceColor: r.source?.color || '#10b981',
        categoryName: r.category?.name || 'General',
        amountInBase: r.baseAmount,
      }));
      sendSuccess(res, mappedRows, result.meta);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const incomeId = req.params.id as string;
      const income = await incomeService.getIncome(incomeId, req.userId!);
      sendSuccess(res, income);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const income = await incomeService.createIncome(req.userId!, req.body);
      sendSuccess(res, income, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const incomeId = req.params.id as string;
      const income = await incomeService.updateIncome(incomeId, req.userId!, req.body);
      sendSuccess(res, income);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const incomeId = req.params.id as string;
      await incomeService.deleteIncome(incomeId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const incomeController = new IncomeController();

