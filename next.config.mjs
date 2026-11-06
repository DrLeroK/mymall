/** @type {import('next').NextConfig} */

const rawApiUrl =
  process.env.BACK_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5001/api/v1';

const backendOrigin =
  process.env.INTERNAL_BACKEND_URL ||
  rawApiUrl.replace(/\/api\/v1\/?$/, '');

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
];

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false, // Prevents server fingerprinting
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? true : false,
  },
  env: {
    BACK_API_URL: process.env.BACK_API_URL || process.env.NEXT_PUBLIC_API_URL,
    BACK_SOCKET_URL: process.env.BACK_SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL,
    BACK_UPLOADS_URL: process.env.BACK_UPLOADS_URL || process.env.NEXT_PUBLIC_UPLOADS_URL,
    DEFAULT_STORE_SLUG: process.env.DEFAULT_STORE_SLUG || process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG,
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    MAPBOX_GEOCODING_URL: process.env.MAPBOX_GEOCODING_URL || process.env.NEXT_PUBLIC_MAPBOX_GEOCODING_URL || 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    CHAPA_KEY: process.env.CHAPA_KEY || process.env.NEXT_PUBLIC_CHAPA_KEY,
    NEXT_APP_URL: process.env.NEXT_APP_URL || process.env.NEXT_PUBLIC_APP_URL,
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      // { protocol: 'http', hostname: '10.124.107.203' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      {
        source: '/backend-uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
