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
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-192.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    screenshots: [
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide"
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "390x844",
        type: "image/png"
      }
    ]
  };
}
