import { Request, Response, NextFunction } from 'express';
import { incomeCategoriesService } from './incomeCategories.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class IncomeCategoriesController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await incomeCategoriesService.listCategories(req.userId!);
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await incomeCategoriesService.createCategory(req.userId!, req.body);
      sendSuccess(res, category, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = req.params.id as string;
      const category = await incomeCategoriesService.updateCategory(categoryId, req.userId!, req.body);
      sendSuccess(res, category);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = req.params.id as string;
      await incomeCategoriesService.deleteCategory(categoryId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const incomeCategoriesController = new IncomeCategoriesController();
