import { Router } from 'express';
import { spendingController } from './spending.controller.js';
import { createSpendingSchema, spendingFilterSchema } from './spending.schemas.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: spendingFilterSchema }), spendingController.list);
router.get('/:id', spendingController.getOne);
router.post('/', validateRequest({ body: createSpendingSchema }), spendingController.create);
router.delete('/:id', spendingController.delete);

export default router;

