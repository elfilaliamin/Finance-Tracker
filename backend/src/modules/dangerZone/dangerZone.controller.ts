import { Request, Response, NextFunction } from 'express';
import { dangerZoneService } from './dangerZone.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class DangerZoneController {
  export = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await dangerZoneService.exportWorkspace(req.userId!);
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="finance_tracker_backup_${timestamp}.json"`);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  dryRun = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await dangerZoneService.dryRunImport(req.userId!, req.body);
      sendSuccess(res, report);
    } catch (err) {
      next(err);
    }
  };

  purge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { module, typedConfirmation } = req.body;
      const result = await dangerZoneService.scopedPurge(req.userId!, module, typedConfirmation);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const dangerZoneController = new DangerZoneController();

