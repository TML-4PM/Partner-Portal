import { Request, Response, NextFunction } from 'express';
import { ServiceError } from '../../../../shared/utils/communication';
import { AnalyticsEvent, AnalyticsFilter } from '../../../../shared/types/analytics';
import { EventProcessor } from '../processors/eventProcessor';
import { MetricsAggregator } from '../aggregators/metricsAggregator';
import { RealtimeTracker } from '../trackers/realtimeTracker';

const eventProcessor = new EventProcessor();
const metricsAggregator = new MetricsAggregator();
const realtimeTracker = new RealtimeTracker();

export const trackEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event: AnalyticsEvent = req.body;
    
    // Process and store the event
    await eventProcessor.processEvent(event);
    
    // Update realtime metrics
    await realtimeTracker.updateMetrics(event);

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;
    const filter: AnalyticsFilter = req.query;

    const metrics = await metricsAggregator.getMetrics(partnerId, filter);

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

export const getPartnerReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ServiceError(400, 'Start date and end date are required');
    }

    const report = await metricsAggregator.generateReport(partnerId, {
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

export const getRealtimeMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;
    
    const realtimeMetrics = await realtimeTracker.getMetrics(partnerId);

    res.json({
      success: true,
      metrics: realtimeMetrics
    });
  } catch (error) {
    next(error);
  }
};