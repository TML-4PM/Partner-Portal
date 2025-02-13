import { Redis } from 'ioredis';
import { AnalyticsFilter, AnalyticsReport } from '../../../../shared/types/analytics';
import { ServiceError } from '../../../../shared/utils/communication';

export class MetricsAggregator {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async getMetrics(partnerId: string, filter: AnalyticsFilter) {
    try {
      const pipeline = this.redis.pipeline();

      // Get event counts
      pipeline.hgetall(`metrics:${partnerId}:events`);
      
      // Get unique users count
      pipeline.scard(`metrics:${partnerId}:users`);
      
      // Get conversion rate
      pipeline.get(`metrics:${partnerId}:conversion_rate`);

      const [events, uniqueUsers, conversionRate] = await pipeline.exec();

      return {
        events: events[1] || {},
        uniqueUsers: uniqueUsers[1] || 0,
        conversionRate: parseFloat(conversionRate[1] as string) || 0
      };
    } catch (error) {
      console.error('Error aggregating metrics:', error);
      throw new ServiceError(500, 'Failed to aggregate metrics');
    }
  }

  async generateReport(partnerId: string, timeRange: { startDate: string, endDate: string }): Promise<AnalyticsReport> {
    try {
      const startTimestamp = new Date(timeRange.startDate).getTime();
      const endTimestamp = new Date(timeRange.endDate).getTime();

      // Get all events within time range
      const events = await this.getEventsInRange(partnerId, startTimestamp, endTimestamp);

      // Calculate metrics
      const metrics = this.calculateMetrics(events);

      // Generate segments
      const segments = this.generateSegments(events);

      return {
        partnerId,
        timeRange: {
          start: timeRange.startDate,
          end: timeRange.endDate
        },
        metrics,
        segments
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw new ServiceError(500, 'Failed to generate report');
    }
  }

  private async getEventsInRange(partnerId: string, startTimestamp: number, endTimestamp: number) {
    const events = await this.redis.zrangebyscore(
      `events:${partnerId}`,
      startTimestamp,
      endTimestamp
    );

    return events.map(event => JSON.parse(event));
  }

  private calculateMetrics(events: any[]) {
    const totalViews = events.filter(e => e.eventType === 'VIEW').length;
    const totalInteractions = events.filter(e => e.eventType === 'INTERACTION').length;
    const totalConversions = events.filter(e => e.eventType === 'CONVERSION').length;

    const conversionRate = totalViews > 0 
      ? (totalConversions / totalViews) * 100 
      : 0;

    const durations = events
      .filter(e => e.metadata?.duration)
      .map(e => e.metadata.duration);

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      : 0;

    return {
      totalViews,
      totalInteractions,
      conversionRate,
      averageDuration
    };
  }

  private generateSegments(events: any[]) {
    // Segment by page
    const byPage = events.reduce((acc: any, event) => {
      if (event.metadata?.page) {
        acc[event.metadata.page] = (acc[event.metadata.page] || 0) + 1;
      }
      return acc;
    }, {});

    // Segment by action
    const byAction = events.reduce((acc: any, event) => {
      if (event.metadata?.action) {
        acc[event.metadata.action] = (acc[event.metadata.action] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      byPage,
      byAction
    };
  }
}