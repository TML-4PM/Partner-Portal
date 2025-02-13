import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Analytics } from '../components/Analytics';
import { FileManager } from '../components/FileManager';
import { Insights } from '../components/Insights';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface DashboardProps {
  partnerId: string;
}

export default function Dashboard({ partnerId }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Partner Dashboard</title>
        <meta name="description" content="Eye Spy Partners Dashboard" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Partner Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <ErrorBoundary>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Analytics partnerId={partnerId} />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <FileManager partnerId={partnerId} />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
              <Insights partnerId={partnerId} />
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // In a real application, you would validate the session/token here
  // and fetch the partnerId from the authenticated user's session
  const partnerId = context.query.partnerId || 'default-partner';

  return {
    props: {
      partnerId
    }
  };
};