import { Request, Response, NextFunction } from 'express';
import { budgetService } from './budget.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';
import { BudgetFilterInput } from './budget.schemas.js';

export class BudgetController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as BudgetFilterInput;
      const budgets = await budgetService.listBudgetsWithProgress(req.userId!, filters);
      sendSuccess(res, budgets);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budget = await budgetService.createBudget(req.userId!, req.body);
      sendSuccess(res, budget, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budgetId = req.params.id as string;
      const budget = await budgetService.updateBudget(budgetId, req.userId!, req.body);
      sendSuccess(res, budget);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budgetId = req.params.id as string;
      await budgetService.deleteBudget(budgetId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const budgetController = new BudgetController();

