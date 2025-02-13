import { InsightAnalyzer } from '../analyzers/insightAnalyzer';
import { AnalyticsClient } from '../clients/analyticsClient';
import { InsightRepository } from '../repositories/insightRepository';
import { AnalyticsReport } from '../../../../shared/types/analytics';

jest.mock('../clients/analyticsClient');
jest.mock('../repositories/insightRepository');

describe('InsightAnalyzer Tests', () => {
  let analyzer: InsightAnalyzer;
  let mockAnalyticsReport: AnalyticsReport;
  const partnerId = 'test-partner';
  const timeRange = {
    start: '2025-01-01T00:00:00Z',
    end: '2025-01-31T23:59:59Z'
  };

  beforeEach(() => {
    analyzer = new InsightAnalyzer();
    mockAnalyticsReport = {
      partnerId,
      timeRange,
      metrics: {
        totalViews: 1000,
        totalInteractions: 500,
        conversionRate: 1.5,
        averageDuration: 45
      }
    };

    (AnalyticsClient.prototype.getReport as jest.Mock).mockResolvedValue(
      mockAnalyticsReport
    );
  });

  describe('generateInsights', () => {
    it('should generate insights for low conversion rate', async () => {
      const insights = await analyzer.generateInsights(partnerId, timeRange);

      expect(insights).toContainEqual(
        expect.objectContaining({
          partnerId,
          type: 'TREND',
          category: 'CONVERSION',
          severity: 'HIGH'
        })
      );

      expect(InsightRepository.prototype.createInsight).toHaveBeenCalled();
    });

    it('should generate insights for low engagement', async () => {
      const insights = await analyzer.generateInsights(partnerId, timeRange);

      expect(insights).toContainEqual(
        expect.objectContaining({
          partnerId,
          type: 'TREND',
          category: 'ENGAGEMENT',
          severity: 'MEDIUM'
        })
      );
    });
  });

  describe('generateRecommendations', () => {
    it('should provide actionable recommendations', () => {
      const recommendations = analyzer['generateRecommendations'](partnerId, mockAnalyticsReport);

      expect(recommendations).toBeInstanceOf(Array);
      recommendations.forEach(recommendation => {
        expect(recommendation).toMatchObject({
          type: 'RECOMMENDATION',
          content: {
            title: expect.any(String),
            description: expect.any(String),
            recommendations: expect.arrayContaining([expect.any(String)])
          }
        });
      });
    });

    it('should prioritize recommendations based on metrics', () => {
      const lowConversionReport = {
        ...mockAnalyticsReport,
        metrics: {
          ...mockAnalyticsReport.metrics,
          conversionRate: 0.5
        }
      };

      const recommendations = analyzer['generateRecommendations'](partnerId, lowConversionReport);
      const conversionRecs = recommendations.filter(rec => 
        rec.content.title.toLowerCase().includes('conversion')
      );

      expect(conversionRecs.length).toBeGreaterThan(0);
      expect(conversionRecs[0].severity).toBe('HIGH');
    });
  });

  describe('getRecommendationTitle', () => {
    it('should return appropriate titles for different types', () => {
      expect(analyzer['getRecommendationTitle']('conversion'))
        .toContain('Conversion Rate');
      expect(analyzer['getRecommendationTitle']('engagement'))
        .toContain('Engagement');
      expect(analyzer['getRecommendationTitle']('interaction'))
        .toContain('Interaction');
    });

    it('should handle unknown types', () => {
      expect(analyzer['getRecommendationTitle']('unknown'))
        .toBe('General Recommendations');
    });
  });

  describe('getRecommendationDescription', () => {
    it('should include relevant metrics in descriptions', () => {
      const description = analyzer['getRecommendationDescription']('conversion', mockAnalyticsReport);
      expect(description).toContain(mockAnalyticsReport.metrics.conversionRate.toFixed(1));
    });

    it('should provide meaningful descriptions for each type', () => {
      const types = ['conversion', 'engagement', 'interaction'];
      
      types.forEach(type => {
        const description = analyzer['getRecommendationDescription'](type, mockAnalyticsReport);
        expect(description).toBeTruthy();
        expect(typeof description).toBe('string');
      });
    });
  });

  describe('getSpecificRecommendations', () => {
    it('should return relevant recommendations for each type', () => {
      const conversionRecs = analyzer['getSpecificRecommendations']('conversion');
      expect(conversionRecs).toContainEqual(expect.stringContaining('call-to-action'));

      const engagementRecs = analyzer['getSpecificRecommendations']('engagement');
      expect(engagementRecs).toContainEqual(expect.stringContaining('content'));

      const interactionRecs = analyzer['getSpecificRecommendations']('interaction');
      expect(interactionRecs).toContainEqual(expect.stringContaining('elements'));
    });

    it('should return empty array for unknown types', () => {
      expect(analyzer['getSpecificRecommendations']('unknown')).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle analytics client errors gracefully', async () => {
      (AnalyticsClient.prototype.getReport as jest.Mock).mockRejectedValue(
        new Error('Analytics service unavailable')
      );

      await expect(analyzer.generateInsights(partnerId, timeRange))
        .rejects
        .toThrow('Analytics service unavailable');
    });

    it('should handle repository errors', async () => {
      (InsightRepository.prototype.createInsight as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(analyzer.generateInsights(partnerId, timeRange))
        .rejects
        .toThrow('Database error');
    });
  });
});