import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class SettingsController {
  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await settingsService.getSettings(req.userId!);
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await settingsService.updateSettings(req.userId!, req.body);
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  };
}

export const settingsController = new SettingsController();

