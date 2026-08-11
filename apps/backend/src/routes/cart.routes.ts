import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', CartController.getCart);
router.post('/', CartController.updateCart);
router.delete('/', CartController.clearCart);

export default router;
