import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // パフォーマンス最適化
  experimental: {
    optimizePackageImports: ['@/components/ui', '@/lib'],
  },
  
  // コンパイル最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // バンドル分析と最適化
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 本番環境でのバンドル最適化
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
