import { Router } from 'express';
import { budgetController } from './budget.controller.js';
import { createBudgetSchema, updateBudgetSchema, budgetFilterSchema } from './budget.schemas.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: budgetFilterSchema }), budgetController.list);
router.post('/', validateRequest({ body: createBudgetSchema }), budgetController.create);
router.put('/:id', validateRequest({ body: updateBudgetSchema }), budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;

