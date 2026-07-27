import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { AnalyticsController } from '../controllers/analytics.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/inventory', AdminController.getInventory);
router.post('/products', AdminController.addProduct);
router.put('/inventory', AdminController.setInventory);
router.get('/providers', AdminController.getProviders);

router.get('/analytics/sales', AnalyticsController.getSalesData);
router.get('/analytics/alerts', AnalyticsController.getStockAlerts);

export default router;
