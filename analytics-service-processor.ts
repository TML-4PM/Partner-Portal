import { Kafka } from 'kafkajs';
import { Redis } from 'ioredis';
import { AnalyticsEvent } from '../../../../shared/types/analytics';
import { ServiceError } from '../../../../shared/utils/communication';

export class EventProcessor {
  private kafka: Kafka;
  private redis: Redis;
  private producer: any;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'analytics-service',
      brokers: (process.env.KAFKA_BROKERS || '').split(',')
    });
    
    this.redis = new Redis(process.env.REDIS_URL);
    this.producer = this.kafka.producer();
  }

  async processEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Validate event structure
      this.validateEvent(event);

      // Enrich event with additional data
      const enrichedEvent = await this.enrichEvent(event);

      // Store event in Kafka for processing
      await this.storeEvent(enrichedEvent);

      // Update real-time metrics in Redis
      await this.updateRealtimeMetrics(enrichedEvent);
    } catch (error) {
      console.error('Error processing event:', error);
      throw new ServiceError(500, 'Failed to process event');
    }
  }

  private validateEvent(event: AnalyticsEvent): void {
    if (!event.partnerId || !event.eventType || !event.timestamp) {
      throw new ServiceError(400, 'Invalid event structure');
    }
  }

  private async enrichEvent(event: AnalyticsEvent): Promise<AnalyticsEvent> {
    // Add server timestamp
    const enrichedEvent = {
      ...event,
      processedAt: new Date().toISOString(),
      metadata: {
        ...event.metadata,
        processingServer: process.env.SERVER_ID
      }
    };

    // Add user session data if available
    if (event.metadata?.sessionId) {
      const sessionData = await this.redis.get(`session:${event.metadata.sessionId}`);
      if (sessionData) {
        enrichedEvent.metadata = {
          ...enrichedEvent.metadata,
          session: JSON.parse(sessionData)
        };
      }
    }

    return enrichedEvent;
  }

  private async storeEvent(event: AnalyticsEvent): Promise<void> {
    await this.producer.connect();
    
    try {
      await this.producer.send({
        topic: 'analytics-events',
        messages: [{
          key: event.partnerId,
          value: JSON.stringify(event)
        }]
      });
    } finally {
      await this.producer.disconnect();
    }
  }

  private async updateRealtimeMetrics(event: AnalyticsEvent): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = event.partnerId;

    // Update event counts
    await this.redis.hincrby(`realtime:${partnerId}:events`, event.eventType, 1);
    
    // Update unique users
    if (event.metadata?.userId) {
      await this.redis.sadd(`realtime:${partnerId}:users`, event.metadata.userId);
    }

    // Store recent events for real-time analysis
    await this.redis.zadd(
      `realtime:${partnerId}:recent`,
      timestamp,
      JSON.stringify(event)
    );

    // Expire old data after 24 hours
    await this.redis.expire(`realtime:${partnerId}:events`, 86400);
    await this.redis.expire(`realtime:${partnerId}:users`, 86400);
    await this.redis.expire(`realtime:${partnerId}:recent`, 86400);
  }
}