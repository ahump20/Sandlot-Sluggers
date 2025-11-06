/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configure base path if deploying to /sandlot-sluggers
  // basePath: '/sandlot-sluggers',
  // assetPrefix: '/sandlot-sluggers',
}

module.exports = nextConfig
