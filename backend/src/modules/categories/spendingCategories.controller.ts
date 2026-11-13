import { Request, Response, NextFunction } from 'express';
import { spendingCategoriesService } from './spendingCategories.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class SpendingCategoriesController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await spendingCategoriesService.listCategories(req.userId!);
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await spendingCategoriesService.createCategory(req.userId!, req.body);
      sendSuccess(res, category, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = req.params.id as string;
      const category = await spendingCategoriesService.updateCategory(categoryId, req.userId!, req.body);
      sendSuccess(res, category);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = req.params.id as string;
      await spendingCategoriesService.deleteCategory(categoryId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const spendingCategoriesController = new SpendingCategoriesController();
