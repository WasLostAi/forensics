/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Simplified webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        assert: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
  // Only include public environment variables
  env: {
    NEXT_PUBLIC_QUICKNODE_RPC_URL: process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL,
  },
}

export default nextConfig
