export interface AnalyticsEvent {
  partnerId: string;
  timestamp: string;
  eventType: 'VIEW' | 'INTERACTION' | 'CONVERSION';
  metadata: {
    page?: string;
    action?: string;
    duration?: number;
    value?: number;
  };
}

export interface AnalyticsReport {
  partnerId: string;
  timeRange: {
    start: string;
    end: string;
  };
  metrics: {
    totalViews: number;
    totalInteractions: number;
    conversionRate: number;
    averageDuration: number;
  };
  segments?: {
    byPage: Record<string, number>;
    byAction: Record<string, number>;
  };
}

export type AnalyticsFilter = {
  partnerId?: string;
  startDate?: string;
  endDate?: string;
  eventTypes?: Array<AnalyticsEvent['eventType']>;
  page?: string;
  action?: string;
};

export interface AnalyticsConfig {
  trackingEnabled: boolean;
  eventTypes: Array<AnalyticsEvent['eventType']>;
  customMetrics?: Record<string, string>;
}