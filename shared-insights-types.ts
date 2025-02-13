export interface Insight {
  id: string;
  partnerId: string;
  type: 'TREND' | 'ALERT' | 'RECOMMENDATION';
  category: 'PERFORMANCE' | 'ENGAGEMENT' | 'CONVERSION' | 'SECURITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  content: {
    title: string;
    description: string;
    metrics?: Record<string, number>;
    recommendations?: string[];
    relatedInsights?: string[];
  };
  metadata: {
    source: string;
    confidence: number;
    timeRange?: {
      start: string;
      end: string;
    };
    affectedComponents?: string[];
  };
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
}

export interface InsightFilter {
  partnerId?: string;
  type?: Insight['type'];
  category?: Insight['category'];
  severity?: Insight['severity'];
  status?: Insight['status'];
  startDate?: string;
  endDate?: string;
  confidence?: number;
}

export interface InsightUpdate {
  id: string;
  partnerId: string;
  status?: Insight['status'];
  content?: Partial<Insight['content']>;
  metadata?: Partial<Insight['metadata']>;
}

export interface InsightResponse {
  success: boolean;
  message: string;
  insight?: Insight;
  error?: {
    code: string;
    details: string;
  };
}