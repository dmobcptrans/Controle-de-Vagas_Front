import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  dynamicStartUrl: true,
  dynamicStartUrlRedirect: '/autorizacao/login',
  reloadOnOnline: true,
  cacheStartUrl: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 24 * 60 * 60,
          },
          networkTimeoutSeconds: 5,
        },
      },
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/petrocarga/reservas'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'reservas-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60,
          },
          networkTimeoutSeconds: 5,
        },
      },
      {
        urlPattern: ({ url }) => url.origin.includes('api.mapbox.com'),
        handler: 'CacheFirst',
        options: {
          cacheName: 'mapbox-tiles-cache',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: ({ request }) =>
          request.destination === 'image' || request.destination === 'font',
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'assets-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);