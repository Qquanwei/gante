/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  assetPrefix: process.env.GANTE_PUBLIC_PATH || '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    GANTE_GITHUB_CLIENT_ID: process.env.GANTE_GITHUB_CLIENT_ID
  }
}

module.exports = nextConfig
