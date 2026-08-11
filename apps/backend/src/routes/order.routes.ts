import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/checkout', OrderController.checkout);
router.get('/history', OrderController.getHistory);
router.get('/:id', OrderController.getOrderById);

export default router;
