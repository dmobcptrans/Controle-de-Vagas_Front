importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: "AIzaSyCJiidfgkv5oyzQJr5cyI7W8BZv6OWtueE",
  authDomain: "fir-cpt-ig.firebaseapp.com",
  projectId: "fir-cpt-ig",
  storageBucket: "fir-cpt-ig.firebasestorage.app",
  messagingSenderId: "569723490331",
  appId: "1:569723490331:web:b3363e0b1b0ece99d628be",
  measurementId: "G-WCYM3XCSQ5"
});

const messaging = firebase.messaging();

const tipoImagem = {
  DENUNCIA: '/image-firebase/imag-denuncia.webp',
  MOTORISTA: '/image-firebase/imag-motorista.webp',
  VAGA: '/image-firebase/imag-vaga.webp',
  RESERVA: '/image-firebase/imag-reserva.webp',
  VEICULO: '/image-firebase/imag-veiculo.webp',
};

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};

  const image = tipoImagem[data.tipo] || '/web-app-manifest-512x512.png';

  self.registration.showNotification(data.title || 'PetroCarga', {
    body: data.body || 'Você tem uma nova atualização',
    icon: '/web-app-manifest-192x192.png',
    badge: '/badge.png',
    image,

    vibrate: [100, 50, 100],

    tag: data.notificacaoId || 'petrocarga',
    renotify: true,

    actions: [
      { action: 'abrir', title: 'Ver detalhes' },
      { action: 'fechar', title: 'Ignorar' },
    ],

    data: {
      id: data.notificacaoId,
      tipo: data.tipo,
    },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'fechar') return;

  const data = event.notification.data;
  let url = '/';

  switch (data?.tipo) {
    case 'DENUNCIA':
      url = '/motorista/reservas/minhas-denuncias';
      break;
    case 'MOTORISTA':
      url = '/motoristas/reservas';
      break;
    case 'VAGA':
    case 'RESERVA':
      url = '/motorista/reservas';
      break;
    case 'VEICULO':
      url = '/motorista/veiculos/meus-veiculos';
      break;
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      }),
  );
});
