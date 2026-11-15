import { Router } from 'express';
import { walletController } from './wallet.controller.js';
import {
  createWalletSchema,
  updateWalletSchema,
  createAdjustmentSchema,
  createTransferSchema,
} from './wallet.schemas.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';

const router = Router();

router.use(authenticate);

// Wallet Transfers (Money transfer between wallets)
router.post('/transfer', validateRequest({ body: createTransferSchema }), walletController.transfer);
router.delete('/transfers/:transferId', walletController.deleteTransfer);

// Wallet CRUD
router.get('/', walletController.list);
router.get('/:id', walletController.getOne);
router.post('/', validateRequest({ body: createWalletSchema }), walletController.create);
router.put('/:id', validateRequest({ body: updateWalletSchema }), walletController.update);

// Wallet Adjustments (Delta & Reconcile)
router.get('/:id/adjustments', walletController.listAdjustments);
router.post(
  '/:id/adjustments',
  validateRequest({ body: createAdjustmentSchema }),
  walletController.recordAdjustment
);
router.delete('/:id/adjustments/:adjustmentId', walletController.deleteAdjustment);

// Wallet Transactions History (Combined Money Added & Spendings)
router.get('/:id/transactions', walletController.getTransactions);

export default router;

