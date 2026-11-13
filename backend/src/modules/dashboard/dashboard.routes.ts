import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/metrics', dashboardController.getMetrics);
router.get('/charts/income-trend', dashboardController.getIncomeTrend);
router.get('/charts/spending-matrix', dashboardController.getSpendingMatrix);
router.get('/charts/net-worth-history', dashboardController.getNetWorthHistory);

export default router;

