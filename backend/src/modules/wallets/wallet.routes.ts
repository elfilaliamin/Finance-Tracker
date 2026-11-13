import { Router } from 'express';
import { walletController } from './wallet.controller.js';
import { createWalletSchema, updateWalletSchema, createAdjustmentSchema } from './wallet.schemas.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';

const router = Router();

router.use(authenticate);

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

export default router;

