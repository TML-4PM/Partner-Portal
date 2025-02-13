import React from 'react';
import Head from 'next/head';

// Static mock data
const mockAnalytics = {
  totalViews: 25463,
  conversionRate: 2.4,
  averageTime: 185,
  dailyTrends: [
    { date: '2025-02-01', views: 3500 },
    { date: '2025-02-02', views: 3200 },
    { date: '2025-02-03', views: 3800 },
  ]
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Partner Dashboard</title>
        <meta name="description" content="Eye Spy Partners Dashboard" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Partner Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analytics Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total Views</p>
                <p className="text-2xl font-bold">{mockAnalytics.totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{mockAnalytics.conversionRate}%</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600">New insight generated</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Performance alert</p>
                <p className="text-sm text-gray-500">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}