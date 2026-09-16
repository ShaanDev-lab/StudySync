import { Router } from 'express';
import { logSession, getWeeklyStats } from '../controllers/pomodoroController.js';

const router = Router();

router.post('/log', logSession);
router.get('/weekly-stats', getWeeklyStats);

export default router;
