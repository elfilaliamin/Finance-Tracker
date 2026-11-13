import { Request, Response, NextFunction } from 'express';
import { incomeSourcesService } from './incomeSources.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class IncomeSourcesController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as 'active' | 'inactive' | undefined;
      const sources = await incomeSourcesService.listSources(req.userId!, status);
      sendSuccess(res, sources);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const source = await incomeSourcesService.createSource(req.userId!, req.body);
      sendSuccess(res, source, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sourceId = req.params.id as string;
      const source = await incomeSourcesService.updateSource(sourceId, req.userId!, req.body);
      sendSuccess(res, source);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sourceId = req.params.id as string;
      await incomeSourcesService.deleteSource(sourceId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const incomeSourcesController = new IncomeSourcesController();
