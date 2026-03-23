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

/**
 * @function registerAndSendToken
 * @description Registra o service worker, obtém token do Firebase e envia ao backend
 * 
 * Fluxo:
 * 1. Obtém instância do Firebase Messaging
 * 2. Registra service worker do Firebase
 * 3. Aguarda o service worker ficar pronto
 * 4. Gera token com VAPID key
 * 5. Envia token para API
 * 6. Armazena token no localStorage
 * 
 * @throws {Error} - messaging_unavailable, token_not_returned
 */
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

/**
 * @hook usePushSetup
 * @version 1.0.0
 * 
 * @description Hook para gerenciar a solicitação e registro de notificações push.
 * Gerencia estados de permissão, exibição de banner e registro do token.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {PushStatus} status - Estado atual das notificações
 * @property {boolean} showPrompt - Indica se deve exibir o banner de solicitação
 * @property {() => void} onAccept - Aceita e solicita permissão
 * @property {() => void} onDismiss - Dispensa o banner (sessionStorage)
 * 
 * ----------------------------------------------------------------------------
 * 📋 STATUS POSSÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * | Status     | Descrição                                      |
 * |------------|------------------------------------------------|
 * | idle       | Estado inicial, aguardando verificação          |
 * | prompted   | Aguardando resposta do usuário                  |
 * | loading    | Registrando token e enviando ao backend         |
 * | granted    | Permissão concedida, token registrado           |
 * | denied     | Permissão negada ou banner dispensado           |
 * | error      | Erro durante o registro                         |
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. VERIFICAÇÃO INICIAL:
 *    - Se permissão já negada ou banner dispensado → status 'denied'
 *    - Se permissão já concedida → registra token automaticamente
 *    - Se permissão não definida → exibe banner (status 'prompted')
 * 
 * 2. ACEITE (onAccept):
 *    - Fecha banner
 *    - Solicita permissão ao usuário
 *    - Se concedida → registra token e envia ao backend
 *    - Se negada → status 'denied'
 * 
 * 3. DISPENSA (onDismiss):
 *    - Fecha banner
 *    - Marca no sessionStorage que o banner foi dispensado
 *    - Status 'denied'
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - SESSIONSTORAGE: Banner dispensado não aparece novamente na sessão
 * - REGISTRO AUTOMÁTICO: Se permissão já concedida, registra token sem perguntar
 * - DEPENDÊNCIA: usuarioId no useEffect (recarrega quando usuário muda)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - PushNotificationBanner: Componente visual que utiliza este hook
 * - getMessagingInstance: Instância do Firebase Messaging
 * 
 * @example
 * ```tsx
 * const { status, showPrompt, onAccept, onDismiss } = usePushSetup();
 * 
 * if (showPrompt) {
 *   return (
 *     <Banner
 *       onAccept={onAccept}
 *       onDismiss={onDismiss}
 *       loading={status === 'loading'}
 *     />
 *   );
 * }
 * ```
 */

export function usePushSetup(): UsePushSetupReturn {
  const { user } = useAuth();
  const usuarioId = user?.id;
  const [status, setStatus] = useState<PushStatus>('idle');
  const [showPrompt, setShowPrompt] = useState(false);

  // ==================== VERIFICAÇÃO INICIAL ====================
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (!usuarioId) return;

    // Caso 1: Permissão negada ou banner já dispensado na sessão
    if (
      Notification.permission === 'denied' ||
      sessionStorage.getItem(DISMISSED_KEY) === 'true'
    ) {
      setStatus('denied');
      return;
    }

    // Caso 2: Permissão já concedida → registra token automaticamente
    if (Notification.permission === 'granted') {
      setStatus('loading');
      registerAndSendToken()
        .then(() => setStatus('granted'))
        .catch(() => setStatus('error'));
      return;
    }

    // Caso 3: Permissão não definida → exibe banner
    setStatus('prompted');
    setShowPrompt(true);
  }, [usuarioId]);

  // ==================== ACEITAR NOTIFICAÇÕES ====================
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

  // ==================== DISPENSAR NOTIFICAÇÕES ====================
  function onDismiss() {
    setShowPrompt(false);
    setStatus('denied');
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  }

  return { status, showPrompt, onAccept, onDismiss };
}