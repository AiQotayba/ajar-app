const withNextIntl = require('next-intl/plugin')(
    './src/lib/i18n/config.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    //   images: {
    //     domains: ['localhost', '127.0.0.1'],
    //     remotePatterns: [
    //       {
    //         protocol: 'https',
    //         hostname: '**',
    //       },
    //     ],
    //   },
    // async rewrites() {
    //     return [
    //         {
    //             source: '/api/:path*',
    //             destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
    //         },
    //     ];
    // },
};

module.exports = withNextIntl(nextConfig);