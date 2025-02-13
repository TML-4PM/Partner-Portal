import React from 'react';
import { Analytics } from '../components/Analytics';
import { FileManager } from '../components/FileManager';
import { Insights } from '../components/Insights';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { mockAnalytics, mockFiles, mockInsights } from '../lib/mockData';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ErrorBoundary>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
              <Analytics 
                data={mockAnalytics}
                partnerId="demo-partner" 
              />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Files</h2>
              <FileManager 
                files={mockFiles}
                partnerId="demo-partner" 
              />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Latest Insights</h2>
              <Insights 
                insights={mockInsights}
                partnerId="demo-partner" 
              />
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}