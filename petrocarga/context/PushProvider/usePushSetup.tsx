'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { getMessagingInstance } from '@/lib/firebase';
import { clientApi } from '@/lib/clientApi';

type PushStatus = 'idle' | 'prompted' | 'loading' | 'granted' | 'denied' | 'error';

interface UsePushSetupReturn {
  status: PushStatus;
  showPrompt: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

const DISMISSED_KEY = 'push_notification_dismissed';
const REGISTERED_KEY = 'push_token_registered';

async function registerAndSendToken(): Promise<void> {
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('permission_denied');
  }

  const messaging = await getMessagingInstance();
  if (!messaging) {
    throw new Error('messaging_unavailable');
  }

  const registration = await navigator.serviceWorker.register(
    '/firebase-messaging-sw.js'
  );
  await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error('token_not_returned');
  }

  await clientApi('/petrocarga/notificacoes/pushToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, plataforma: 'WEB' }),
  });
}

export function usePushSetup(): UsePushSetupReturn {
  const [status, setStatus] = useState<PushStatus>('idle');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (localStorage.getItem(REGISTERED_KEY) === 'true') {
      setStatus('granted');
      return;
    }

    if (
      Notification.permission === 'denied' ||
      sessionStorage.getItem(DISMISSED_KEY) === 'true'
    ) {
      setStatus('denied');
      return;
    }

    setStatus('prompted');
    setShowPrompt(true);
  }, []);

  function onAccept() {
    setShowPrompt(false);
    setStatus('loading');

    registerAndSendToken()
      .then(() => {
        localStorage.setItem(REGISTERED_KEY, 'true');
        setStatus('granted');
      })
      .catch((err: Error) => {
        console.error('[Push] Erro:', err.message);
        setStatus(err.message === 'permission_denied' ? 'denied' : 'error');
      });
  }

  function onDismiss() {
    setShowPrompt(false);
    setStatus('denied');
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  }

  return { status, showPrompt, onAccept, onDismiss };
}