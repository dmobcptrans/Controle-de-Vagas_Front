import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Petrocarga',
    short_name: 'Petrocarga',
    description: 'Um Sistema de Reservas de Carga e Descarga em Petropolis',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3a2bc2',
    icons: [
      {
        src: "/icons/icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "any"
      },
      {
        src: "/icons/icon-192.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any"
      },
      {
        src: "/icons/icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "maskable"
      },
      {
        src: "/icons/icon-512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable"
      }
    ],
    screenshots: [
      {
        src: "/screenshots/desktop.webp",
        sizes: "1280x720",
        type: "image/webp",
        form_factor: "wide"
      },
      {
        src: "/screenshots/mobile.webp",
        sizes: "390x844",
        type: "image/webp"
      }
    ]
  };
}
