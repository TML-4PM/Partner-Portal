/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      return [
        {
          source: '/api/files/:path*',
          destination: `${process.env.FILE_SERVICE_URL}/files/:path*`
        },
        {
          source: '/api/analytics/:path*',
          destination: `${process.env.ANALYTICS_SERVICE_URL}/analytics/:path*`
        },
        {
          source: '/api/insights/:path*',
          destination: `${process.env.INSIGHTS_SERVICE_URL}/insights/:path*`
        }
      ];
    }
    
    // Development rewrites
    return [
      {
        source: '/api/files/:path*',
        destination: 'http://localhost:3001/files/:path*'
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://localhost:3002/analytics/:path*'
      },
      {
        source: '/api/insights/:path*',
        destination: 'http://localhost:3003/insights/:path*'
      }
    ];
  }
};

module.exports = nextConfig;