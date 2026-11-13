import { Request, Response, NextFunction } from 'express';
import { spendingService } from './spending.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';
import { SpendingFilterInput } from './spending.schemas.js';

export class SpendingController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as SpendingFilterInput;
      const result = await spendingService.listSpendings(req.userId!, filters);
      sendSuccess(res, result.rows, result.meta);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const spendingId = req.params.id as string;
      const spending = await spendingService.getSpending(spendingId, req.userId!);
      sendSuccess(res, spending);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const spending = await spendingService.createSpending(req.userId!, req.body);
      sendSuccess(res, spending, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const spendingId = req.params.id as string;
      await spendingService.deleteSpending(spendingId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const spendingController = new SpendingController();

