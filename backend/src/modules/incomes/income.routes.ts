import { Router } from 'express';
import { incomeController } from './income.controller.js';
import { createIncomeSchema, updateIncomeSchema, incomeFilterSchema } from './income.schemas.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validateRequest.js';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: incomeFilterSchema }), incomeController.list);
router.get('/:id', incomeController.getOne);
router.post('/', validateRequest({ body: createIncomeSchema }), incomeController.create);
router.put('/:id', validateRequest({ body: updateIncomeSchema }), incomeController.update);
router.delete('/:id', incomeController.delete);

export default router;

