import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const withPWA = withPWAInit({
  dest: 'public',

  disable: process.env.NODE_ENV === 'development',

  customWorkerSrc: 'worker',
  customWorkerDest: 'public',

  reloadOnOnline: true,

  publicExcludes: [
    '!**/*.png',
    '!**/*.jpg',
    '!**/*.jpeg',
    '!**/*.webp',
    '!**/*.svg',
  ],

  workboxOptions: {
    cleanupOutdatedCaches: true,

    exclude: [/\.png$/, /\.jpg$/, /\.jpeg$/, /\.webp$/, /\.svg$/],

    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkOnly',
      },

      // Mapbox
      {
        urlPattern: ({ url }) => url.origin.includes('api.mapbox.com'),
        handler: 'CacheFirst',
        options: {
          cacheName: 'mapbox-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },

      // Fontes
      {
        urlPattern: ({ request }) => request.destination === 'font',
        handler: 'CacheFirst',
        options: {
          cacheName: 'fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },

      // Imagens de /cache-images -> cacheadas sob demanda (runtime)
      {
        urlPattern: ({ url, request }) =>
          request.destination === 'image' &&
          url.pathname.startsWith('/cache-images/'),

        handler: 'CacheFirst',

        options: {
          cacheName: 'cache-images',

          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },

          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },

      {
        urlPattern: ({ request }) => request.destination === 'image',
        handler: 'NetworkOnly',
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
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);