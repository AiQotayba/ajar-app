import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBvOkBw3cL1Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ajar-backend.mystore.social/api/v1',
  },
  images: {
    unoptimized: true,
    domains: [
      'images.unsplash.com',
      'localhost',
      'ajar.com',
      'www.ajar.com',
    ],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/maps/api/staticmap**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/map-image**',
      },
    ],
  },
  basePath: '',
  // SEO and Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/ar',
        permanent: true,
      },
      {
        source: '/ar/home',
        destination: '/ar',
        permanent: true,
      },
      {
        source: '/en/home',
        destination: '/en',
        permanent: true,
      },
    ];
  },
};

// في ES Modules استخدم export default
export default withNextIntl(nextConfig);
