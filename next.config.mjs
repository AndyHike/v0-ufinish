import createNextIntlPlugin from 'next-intl/plugin';
import { withBundleAnalyzer } from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make the build more permissive
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.gstatic.com',
      },
      // Додайте інші домени, з яких ви завантажуєте зображення
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  // Optimize webpack chunks
  webpack: (config, { isServer }) => {
    // Оптимізація розміру чанків
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        maxSize: 100000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      };
    }
    return config;
  },
};

// Додаємо аналізатор бандлів, якщо встановлена змінна середовища ANALYZE
const config = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer(nextConfig)
  : nextConfig;

export default withNextIntl(config);
