/**
 * @type {import('next').NextConfig}
 */
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
  // Webpack configuration to handle Solana dependencies
  webpack: (config, { isServer, webpack }) => {
    // Polyfill for Node.js core modules
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
      
      // Add buffer polyfill
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
      
      // Add process polyfill
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );
    }
    
    return config;
  },
  // Only include public environment variables
  env: {
    NEXT_PUBLIC_QUICKNODE_RPC_URL: process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL,
  },
}

export default nextConfig
