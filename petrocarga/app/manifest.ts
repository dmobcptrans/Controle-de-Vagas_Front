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
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    screenshots: [
      {
        src: "/screenshot-desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide"
      },
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png"
      }
    ]
  };
}
