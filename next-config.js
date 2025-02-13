/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
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
    ]
  }
}

module.exports = nextConfig