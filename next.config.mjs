import createNextIntlPlugin from 'next-intl/plugin';

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
  // Optimize images for static export
  images: {
    unoptimized: true,
  },
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
};

export default withNextIntl(nextConfig);
