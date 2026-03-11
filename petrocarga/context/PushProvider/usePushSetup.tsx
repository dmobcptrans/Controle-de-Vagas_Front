'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { getMessagingInstance } from '@/lib/firebase';
import { clientApi } from '@/lib/clientApi';
import { useAuth } from '../AuthContext';

type PushStatus = 'idle' | 'prompted' | 'loading' | 'granted' | 'denied' | 'error';

interface UsePushSetupReturn {
  status: PushStatus;
  showPrompt: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

const DISMISSED_KEY = 'push_notification_dismissed';


async function registerAndSendToken(): Promise<void> {

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

  localStorage.setItem('pushToken', token);
}

export function usePushSetup(): UsePushSetupReturn {
  const { user } = useAuth();
  const usuarioId = user?.id;
  const [status, setStatus] = useState<PushStatus>('idle');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (!usuarioId) return;

    if (
      Notification.permission === 'denied' ||
      sessionStorage.getItem(DISMISSED_KEY) === 'true'
    ) {
      setStatus('denied');
      return;
    }

    if (Notification.permission === 'granted') {
      setStatus('loading');
      registerAndSendToken()
        .then(() => setStatus('granted'))
        .catch(() => setStatus('error'));
      return;
    }

    setStatus('prompted');
    setShowPrompt(true);
  }, [usuarioId]); 

  function onAccept() {
    setShowPrompt(false);
    setStatus('loading');

    Notification.requestPermission()
      .then((permission) => {
        if (permission !== 'granted') throw new Error('permission_denied');
        return registerAndSendToken();
      })
      .then(() => setStatus('granted'))
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