import { Request, Response, NextFunction } from 'express';
import { walletService } from './wallet.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

export class WalletController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as 'active' | 'archived' | undefined;
      const wallets = await walletService.listWallets(req.userId!, status);
      sendSuccess(res, wallets);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const walletId = req.params.id as string;
      const wallet = await walletService.getWallet(walletId, req.userId!);
      sendSuccess(res, wallet);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = await walletService.createWallet(req.userId!, req.body);
      sendSuccess(res, wallet, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const walletId = req.params.id as string;
      const wallet = await walletService.updateWallet(walletId, req.userId!, req.body);
      sendSuccess(res, wallet);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const walletId = req.params.id as string;
      const result = await walletService.deleteWallet(walletId, req.userId!);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  recordAdjustment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const walletId = req.params.id as string;
      const result = await walletService.recordAdjustment(walletId, req.userId!, req.body);
      sendSuccess(res, result, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  listAdjustments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const walletId = req.params.id as string;
      const { from, to } = req.query as { from?: string; to?: string };
      const adjustments = await walletService.listAdjustments(walletId, req.userId!, from, to);
      sendSuccess(res, adjustments);
    } catch (err) {
      next(err);
    }
  };

  deleteAdjustment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const walletId = req.params.id as string;
      const adjustmentId = req.params.adjustmentId as string;
      await walletService.deleteAdjustment(adjustmentId, walletId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const walletId = req.params.id as string;
      const { from, to, type } = req.query as { from?: string; to?: string; type?: string };
      const result = await walletService.getTransactions(walletId, req.userId!, { from, to, type });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  transfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await walletService.transferFunds(req.userId!, req.body);
      sendSuccess(res, result, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  deleteTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transferId = req.params.transferId as string;
      await walletService.deleteTransfer(transferId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const walletController = new WalletController();

