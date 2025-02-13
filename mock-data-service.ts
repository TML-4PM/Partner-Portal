export const mockInsights = [
  {
    id: '1',
    type: 'TREND',
    category: 'CONVERSION',
    severity: 'HIGH',
    content: {
      title: 'Decreasing Conversion Rate',
      description: 'Your conversion rate has dropped by 15% in the last week',
      metrics: {
        currentRate: 2.4,
        previousRate: 2.8,
        industry: 3.1
      },
      recommendations: [
        'Review recent website changes',
        'Analyze user journey for friction points',
        'A/B test your call-to-action buttons'
      ]
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    type: 'ALERT',
    category: 'PERFORMANCE',
    severity: 'MEDIUM',
    content: {
      title: 'Page Load Time Issue',
      description: 'Average page load time increased to 3.5 seconds',
      metrics: {
        currentLoadTime: 3.5,
        threshold: 2.0,
        affectedPages: 3
      },
      recommendations: [
        'Optimize image sizes',
        'Enable browser caching',
        'Minimize JavaScript bundles'
      ]
    },
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    type: 'RECOMMENDATION',
    category: 'ENGAGEMENT',
    severity: 'LOW',
    content: {
      title: 'User Engagement Opportunity',
      description: 'Users spend 23% more time on pages with interactive elements',
      metrics: {
        interactiveTime: 145,
        standardTime: 98,
        potentialGain: 23
      },
      recommendations: [
        'Add interactive data visualizations',
        'Implement user feedback forms',
        'Create interactive product tours'
      ]
    },
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export const mockAnalytics = {
  overview: {
    totalViews: 25463,
    uniqueVisitors: 12890,
    averageTime: 185,
    bounceRate: 34.2,
    conversionRate: 2.4
  },
  trends: {
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      views: 3000 + Math.floor(Math.random() * 1000),
      visitors: 1500 + Math.floor(Math.random() * 500),
      conversions: 35 + Math.floor(Math.random() * 20)
    })).reverse()
  },
  topPages: [
    { path: '/home', views: 8234, conversions: 245 },
    { path: '/products', views: 6123, conversions: 189 },
    { path: '/pricing', views: 4532, conversions: 167 },
    { path: '/about', views: 3654, conversions: 42 }
  ]
};

export const mockFiles = [
  {
    id: '1',
    name: 'Q4 Report.pdf',
    type: 'application/pdf',
    size: 2458000,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    url: '#'
  },
  {
    id: '2',
    name: 'Marketing Assets.zip',
    type: 'application/zip',
    size: 15678000,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    url: '#'
  },
  {
    id: '3',
    name: 'Product Images.jpg',
    type: 'image/jpeg',
    size: 3789000,
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    url: '#'
  }
];