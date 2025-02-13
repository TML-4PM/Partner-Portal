import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Insight } from '../../shared/types/insights';

interface InsightsProps {
  partnerId: string;
}

export const Insights: React.FC<InsightsProps> = ({ partnerId }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/insights/${partnerId}`);
        if (!response.ok) throw new Error('Failed to fetch insights');
        
        const data = await response.json();
        setInsights(data.insights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [partnerId]);

  const renderInsightCard = (insight: Insight) => {
    const severityColors = {
      HIGH: 'bg-red-50 border-red-200',
      MEDIUM: 'bg-yellow-50 border-yellow-200',
      LOW: 'bg-green-50 border-green-200'
    };

    const typeIcons = {
      TREND: '📈',
      ALERT: '⚠️',
      RECOMMENDATION: '💡'
    };

    return (
      <Card 
        key={insight.id}
        className={`mb-4 border ${severityColors[insight.severity]}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">{typeIcons[insight.type]}</span>
            {insight.content.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            {insight.content.description}
          </p>
          
          {insight.content.metrics && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {Object.entries(insight.content.metrics).map(([key, value]) => (
                <div key={key} className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-gray-500">{key}</div>
                  <div className="text-lg font-semibold">
                    {typeof value === 'number' ? value.toFixed(1) : value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {insight.content.recommendations && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Recommendations:</h4>
              <ul className="list-disc pl-5">
                {insight.content.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            Generated: {new Date(insight.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="animate-pulse">Loading insights...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Insights</h2>
        <p className="text-gray-600">
          Actionable insights and recommendations based on your analytics data
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {insights.length > 0 ? (
          insights.map(insight => renderInsightCard(insight))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No insights available at this time
          </div>
        )}
      </div>
    </div>
  );
};