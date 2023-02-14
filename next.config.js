/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    GANTE_GITHUB_CLIENT_ID: process.env.GANTE_GITHUB_CLIENT_ID
  }
}

module.exports = nextConfig
