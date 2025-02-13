import { Router } from 'express';
import {
  trackEvent,
  getAnalytics,
  getPartnerReport,
  getRealtimeMetrics
} from '../controllers/analyticsController';
import { validateEvent, validateDateRange } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Analytics endpoints
router.post('/events', validateEvent, trackEvent);
router.get('/metrics/:partnerId', validateDateRange, getAnalytics);
router.get('/reports/:partnerId', validateDateRange, getPartnerReport);
router.get('/realtime/:partnerId', getRealtimeMetrics);

export const AnalyticsRouter = router;