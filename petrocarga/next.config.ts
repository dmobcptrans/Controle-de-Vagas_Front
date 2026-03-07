import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const withPWA = withPWAInit({
  dest: 'public',

  disable: process.env.NODE_ENV === 'development',
  dynamicStartUrl: true, // Essencial para lidar com estados de login
  dynamicStartUrlRedirect: '/autorizacao/login',
  reloadOnOnline: true, // Recarrega automaticamente ao recuperar conexão
  cacheStartUrl: true,
  fallbacks: {
    document: '/offline', // Sua página de fallback
  },
  workboxOptions: {
    runtimeCaching: [
      // ---------------------------
      // Cache para as PÁGINAS (HTML)
      // ---------------------------
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst', // mantém conteúdo atualizado
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 24 * 60 * 60, // 24h
          },
          networkTimeoutSeconds: 5, // se rede lenta, usa cache após 5s
        },
      },

      // --------------------------------------
      // Cache para API de Reservas (JSON leve)
      // --------------------------------------
      {
        urlPattern: ({ url }) =>
          url.pathname.startsWith('/petrocarga/reservas'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'reservas-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24h
          },
          networkTimeoutSeconds: 5, // fallback rápido em rede lenta
        },
      },

      // ----------------------------
      // Cache para tiles Mapbox (mapas)
      // ----------------------------
      {
        urlPattern: ({ url }) => url.origin.includes('api.mapbox.com'),
        handler: 'CacheFirst', // economiza dados, só baixa tiles novos
        options: {
          cacheName: 'mapbox-tiles-cache',
          expiration: {
            maxEntries: 500, // depende da área que o usuário visita
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semana
          },
        },
      },

      // ----------------------------
      // Cache para arquivos estáticos (assets)
      // ----------------------------
      {
        urlPattern: ({ request }) =>
          request.destination === 'image' || request.destination === 'font',
        handler: 'StaleWhileRevalidate', // mostra o que tem no cache e atualiza por trás
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
  output: 'standalone',
};

export default withPWA(nextConfig);
