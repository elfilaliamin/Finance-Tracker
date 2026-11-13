import { Router } from 'express';
import { reportController } from './report.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/preview', reportController.preview);
router.get('/export/csv', reportController.exportCsv);
router.get('/export/xlsx', reportController.exportXlsx);
router.get('/export/pdf', reportController.exportPdf);

export default router;

