import { EventProcessor } from '../processors/eventProcessor';
import { Redis } from 'ioredis';
import { Kafka } from 'kafkajs';
import { AnalyticsEvent } from '../../../../shared/types/analytics';

jest.mock('ioredis');
jest.mock('kafkajs');

describe('EventProcessor Tests', () => {
  let eventProcessor: EventProcessor;
  let mockEvent: AnalyticsEvent;

  beforeEach(() => {
    eventProcessor = new EventProcessor();
    mockEvent = {
      partnerId: 'test-partner',
      timestamp: new Date().toISOString(),
      eventType: 'VIEW',
      metadata: {
        page: '/home',
        duration: 120
      }
    };
  });

  describe('processEvent', () => {
    it('should successfully process a valid event', async () => {
      await eventProcessor.processEvent(mockEvent);

      // Verify Kafka producer was called
      expect(Kafka.prototype.producer().send).toHaveBeenCalledWith({
        topic: 'analytics-events',
        messages: [{
          key: mockEvent.partnerId,
          value: expect.any(String)
        }]
      });

      // Verify Redis updates
      expect(Redis.prototype.hincrby).toHaveBeenCalledWith(
        `realtime:${mockEvent.partnerId}:events`,
        mockEvent.eventType,
        1
      );
    });

    it('should enrich event with additional data', async () => {
      const sessionData = { userId: 'test-user', started: new Date().toISOString() };
      mockEvent.metadata.sessionId = 'test-session';

      // Mock Redis session data
      Redis.prototype.get = jest.fn().mockResolvedValue(JSON.stringify(sessionData));

      await eventProcessor.processEvent(mockEvent);

      expect(Kafka.prototype.producer().send).toHaveBeenCalledWith({
        topic: 'analytics-events',
        messages: [{
          key: mockEvent.partnerId,
          value: expect.stringContaining(sessionData.userId)
        }]
      });
    });

    it('should handle invalid events', async () => {
      const invalidEvent = {
        ...mockEvent,
        eventType: 'INVALID_TYPE'
      };

      await expect(eventProcessor.processEvent(invalidEvent))
        .rejects
        .toThrow('Invalid event structure');
    });

    it('should handle Kafka producer errors', async () => {
      // Mock Kafka producer error
      Kafka.prototype.producer().send = jest.fn().mockRejectedValue(
        new Error('Kafka error')
      );

      await expect(eventProcessor.processEvent(mockEvent))
        .rejects
        .toThrow('Failed to process event');
    });
  });

  describe('updateRealtimeMetrics', () => {
    it('should update all required metrics', async () => {
      await eventProcessor['updateRealtimeMetrics'](mockEvent);

      // Verify event counts update
      expect(Redis.prototype.hincrby).toHaveBeenCalledWith(
        `realtime:${mockEvent.partnerId}:events`,
        mockEvent.eventType,
        1
      );

      // Verify recent events storage
      expect(Redis.prototype.zadd).toHaveBeenCalledWith(
        `realtime:${mockEvent.partnerId}:recent`,
        expect.any(Number),
        expect.any(String)
      );

      // Verify expiration setting
      expect(Redis.prototype.expire).toHaveBeenCalledTimes(3);
    });

    it('should handle unique users tracking', async () => {
      const eventWithUser = {
        ...mockEvent,
        metadata: {
          ...mockEvent.metadata,
          userId: 'test-user'
        }
      };

      await eventProcessor['updateRealtimeMetrics'](eventWithUser);

      expect(Redis.prototype.sadd).toHaveBeenCalledWith(
        `realtime:${mockEvent.partnerId}:users`,
        'test-user'
      );
    });
  });

  describe('validateEvent', () => {
    it('should validate correct events', () => {
      expect(() => eventProcessor['validateEvent'](mockEvent))
        .not.toThrow();
    });

    it('should reject events missing required fields', () => {
      const invalidEvent = { ...mockEvent };
      delete invalidEvent.partnerId;

      expect(() => eventProcessor['validateEvent'](invalidEvent))
        .toThrow('Invalid event structure');
    });

    it('should validate event timestamp', () => {
      const invalidEvent = {
        ...mockEvent,
        timestamp: 'invalid-date'
      };

      expect(() => eventProcessor['validateEvent'](invalidEvent))
        .toThrow('Invalid event structure');
    });
  });
});