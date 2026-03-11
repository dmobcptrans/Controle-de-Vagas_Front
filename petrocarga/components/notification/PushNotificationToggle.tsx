'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { getToken } from 'firebase/messaging';
import { getMessagingInstance } from '@/lib/firebase';
import { clientApi } from '@/lib/clientApi';
import {
  atualizarStatusPushToken,
  buscarStatusPushToken,
} from '@/lib/api/notificacaoApi';

const REGISTERED_KEY = 'push_token_registered';

type Props = {
  usuarioId: string;
};

async function registerAndSendToken(): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('permission_denied');

  const messaging = await getMessagingInstance();
  if (!messaging) throw new Error('messaging_unavailable');

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) throw new Error('token_not_returned');

  await clientApi('/petrocarga/notificacoes/pushToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, plataforma: 'WEB' }),
  });

  localStorage.setItem(REGISTERED_KEY, 'true');
}

export function PushNotificationToggle({ usuarioId }: Props) {
  const [ativo, setAtivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [browserRevogado, setBrowserRevogado] = useState(false);

  async function carregarStatus() {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window &&
        Notification.permission !== 'granted') {
        setBrowserRevogado(true);
        setAtivo(false);
        return;
      }

      const res = await buscarStatusPushToken();
      if (!res.error) {
        setAtivo(res.data?.ativo ?? false);
      }
    } catch (error) {
      console.error('Erro ao buscar status de notificação', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarStatus();
  }, []);

  async function handleToggle() {
    // Permissão revogada no browser → precisa refazer o setup antes de ativar
    if (browserRevogado) {
      try {
        setLoading(true);
        await registerAndSendToken();
        setBrowserRevogado(false);
        setAtivo(true);
      } catch (err) {
        console.error('[Push] Erro ao reativar:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fluxo normal → só atualiza ativo/inativo no backend
    try {
      setLoading(true);
      const novoStatus = !ativo;
      const res = await atualizarStatusPushToken(usuarioId, novoStatus);
      if (!res.error) setAtivo(novoStatus);
    } catch (error) {
      console.error('Erro ao atualizar notificações', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center
          ${ativo ? 'bg-blue-50' : 'bg-gray-100'}`}
        >
          {ativo
            ? <Bell className="w-4 h-4 text-blue-600" />
            : <BellOff className="w-4 h-4 text-gray-400" />
          }
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">
            Notificações de reserva
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {browserRevogado
              ? 'Clique para reativar as notificações.'
              : 'Receba atualizações de status da sua carga.'
            }
          </p>
        </div>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 text-gray-300 animate-spin shrink-0" />
      ) : (
        <button
          role="switch"
          aria-checked={ativo}
          onClick={handleToggle}
          className={`relative inline-flex w-[46px] h-[26px] rounded-full transition-colors
          ${ativo ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-[2px] w-[22px] h-[22px] bg-white rounded-full shadow transition-all
            ${ativo ? 'left-[22px]' : 'left-[2px]'}`}
          />
        </button>
      )}
    </div>
  );
}