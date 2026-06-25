import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Netlify deploys Next.js as-is
  output: undefined,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

export default nextConfig
