import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',

  customWorkerSrc: 'worker',
  customWorkerDest: 'public',

  reloadOnOnline: true,
  dynamicStartUrl: false,
  cacheStartUrl: false,

  fallbacks: { document: '/offline' },

  workboxOptions: {
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkOnly',
      },

     
      {
        urlPattern: ({ url }) => url.origin.includes('api.mapbox.com'),
        handler: 'CacheFirst',
        options: {
          cacheName: 'mapbox-tiles-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 3 * 24 * 60 * 60,
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
            maxEntries: 60,
            maxAgeSeconds: 3 * 24 * 60 * 60,
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
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);