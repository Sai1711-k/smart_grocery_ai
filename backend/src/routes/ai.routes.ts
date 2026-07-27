import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();

router.post('/recommend', AIController.getRecommendations);

export default router;
