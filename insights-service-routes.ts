import { Router } from 'express';
import {
  getInsights,
  getInsightById,
  updateInsightStatus,
  generateInsights,
  getInsightMetrics
} from '../controllers/insightsController';
import { validateInsightUpdate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Insights endpoints
router.get('/:partnerId', getInsights);
router.get('/:partnerId/:insightId', getInsightById);
router.post('/:partnerId/generate', generateInsights);
router.patch('/:partnerId/:insightId', validateInsightUpdate, updateInsightStatus);
router.get('/:partnerId/metrics/summary', getInsightMetrics);

export const InsightsRouter = router;