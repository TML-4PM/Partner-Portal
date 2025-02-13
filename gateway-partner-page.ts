import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Analytics } from '../components/Analytics';
import { FileManager } from '../components/FileManager';
import { Insights } from '../components/Insights';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface PartnerPageProps {
  partner: {
    id: string;
    name: string;
    settings: {
      analyticsEnabled: boolean;
      fileManagementEnabled: boolean;
      insightsEnabled: boolean;
    };
  };
}

export default function PartnerPage({ partner }: PartnerPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('analytics');

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return partner.settings.analyticsEnabled ? (
          <Analytics partnerId={partner.id} />
        ) : (
          <div className="text-gray-500">Analytics not enabled for this partner</div>
        );

      case 'files':
        return partner.settings.fileManagementEnabled ? (
          <FileManager partnerId={partner.id} />
        ) : (
          <div className="text-gray-500">File management not enabled for this partner</div>
        );

      case 'insights':
        return partner.settings.insightsEnabled ? (
          <Insights partnerId={partner.id} />
        ) : (
          <div className="text-gray-500">Insights not enabled for this partner</div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{partner.name} - Dashboard</title>
        <meta name="description" content={`${partner.name}'s Partner Dashboard`} />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{partner.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'analytics'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'files'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => setActiveTab('files')}
              >
                Files
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'insights'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => setActiveTab('insights')}
              >
                Insights
              </button>
            </div>
          </CardContent>
        </Card>

        <ErrorBoundary>
          <Card>
            <CardContent className="p-6">
              {renderContent()}
            </CardContent>
          </Card>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { partner: partnerId } = context.params || {};

  try {
    // In a real application, you would fetch this data from your API
    const partner = {
      id: partnerId,
      name: `Partner ${partnerId}`,
      settings: {
        analyticsEnabled: true,
        fileManagementEnabled: true,
        insightsEnabled: true
      }
    };

    return {
      props: {
        partner
      }
    };
  } catch (error) {
    return {
      notFound: true
    };
  }
};