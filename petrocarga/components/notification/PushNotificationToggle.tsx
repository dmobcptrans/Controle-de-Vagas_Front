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

const Push_TOKEN_KEY = 'pushToken';

type Props = {
  usuarioId: string;
};

/**
 * @function registerAndSendToken
 * @description Solicita permissão de notificação, registra service worker e envia token para o backend.
 * 
 * Fluxo:
 * 1. Solicita permissão do navegador
 * 2. Obtém instância do Firebase Messaging
 * 3. Registra service worker do Firebase
 * 4. Gera token com VAPID key
 * 5. Envia token para API
 * 6. Armazena token no localStorage
 * 
 * @throws {Error} - permission_denied, messaging_unavailable, token_not_returned
 */
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

  localStorage.setItem(Push_TOKEN_KEY, token);
}

/**
 * @component PushNotificationToggle
 * @version 1.0.0
 * 
 * @description Componente toggle para ativar/desativar notificações push.
 * Gerencia permissões do navegador e comunicação com backend.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO INICIAL:
 *    - Verifica permissão do navegador (Notification.permission)
 *    - Busca token no localStorage
 *    - Consulta status no backend via buscarStatusPushToken
 *    - Atualiza estado do toggle
 * 
 * 2. ATIVAÇÃO (quando desativado e permissão já concedida):
 *    - Chama atualizarStatusPushToken com ativo=true
 *    - Atualiza estado local
 * 
 * 3. ATIVAÇÃO COM PERMISSÃO REVOGADA (browserRevogado):
 *    - Chama registerAndSendToken (solicita permissão, registra SW, envia token)
 *    - Atualiza estado para ativo
 * 
 * 4. DESATIVAÇÃO:
 *    - Chama atualizarStatusPushToken com ativo=false
 *    - Atualiza estado local
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - localStorage: Armazena token para persistência entre sessões
 * - browserRevogado: Flag para quando o usuário negou/revogou permissão
 * - Service Worker: Registrado no caminho /firebase-messaging-sw.js
 * - VAPID Key: Necessária para autenticação do Firebase
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - getMessagingInstance: Instância do Firebase Messaging
 * - atualizarStatusPushToken: API para atualizar status
 * - buscarStatusPushToken: API para consultar status
 * 
 * @example
 * ```tsx
 * <PushNotificationToggle usuarioId={user.id} />
 * ```
 */

export function PushNotificationToggle({ usuarioId }: Props) {
  const [ativo, setAtivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [browserRevogado, setBrowserRevogado] = useState(false);

  // ==================== CARREGAR STATUS INICIAL ====================
  async function carregarStatus() {
    try {
      // Verifica permissão do navegador
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission !== 'granted'
      ) {
        setBrowserRevogado(true);
        setAtivo(false);
        return;
      }
      
      const token = localStorage.getItem(Push_TOKEN_KEY);

      if (!token) {
        setAtivo(false);
        return;
      }

      // Busca status no backend
      const res = await buscarStatusPushToken(token);
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

  // ==================== HANDLER DO TOGGLE ====================
  async function handleToggle() {
    // Caso 1: Permissão revogada → registrar novamente
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

    // Caso 2: Fluxo normal → atualizar status no backend
    try {
      setLoading(true);
      const novoStatus = !ativo;
      const tk = localStorage.getItem(Push_TOKEN_KEY);
      if (!tk) {
        console.warn('Push token não encontrado');
        setLoading(false);
        return;
      }
      const res = await atualizarStatusPushToken(usuarioId, tk, novoStatus);
      if (!res.error) setAtivo(novoStatus);
    } catch (error) {
      console.error('Erro ao atualizar notificações', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      
      {/* ==================== ÍCONE E DESCRIÇÃO ==================== */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center
          ${ativo ? 'bg-blue-50' : 'bg-gray-100'}`}
        >
          {ativo ? (
            <Bell className="w-4 h-4 text-blue-600" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">
            Notificações de reserva
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {browserRevogado
              ? 'Clique para reativar as notificações.'
              : 'Receba atualizações de status da sua carga.'}
          </p>
        </div>
      </div>

      {/* ==================== TOGGLE SWITCH ==================== */}
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
          <span
            className={`absolute top-[2px] w-[22px] h-[22px] bg-white rounded-full shadow transition-all
            ${ativo ? 'left-[22px]' : 'left-[2px]'}`}
          />
        </button>
      )}
    </div>
  );
}