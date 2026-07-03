'use client';

import { Bell, X } from 'lucide-react';
import { usePushSetup } from './usePushSetup';

/**
 * @component PushNotificationBanner
 * @version 1.0.0
 * 
 * @description Banner de solicitação de permissão para notificações push.
 * Exibe um card flutuante solicitando ativação de notificações em tempo real.
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. EXIBIÇÃO CONDICIONAL:
 *    - Só aparece se showPrompt for true (via usePushSetup)
 *    - Gerencia quando mostrar o banner baseado no estado da permissão
 * 
 * 2. AÇÕES:
 *    - "Ativar notificações": Solicita permissão e registra push token
 *    - "Agora não": Fecha o banner temporariamente
 *    - Botão X: Mesmo comportamento que "Agora não"
 * 
 * 3. ESTADOS:
 *    - status 'loading': Botão desabilitado com texto "Ativando…"
 *    - status normal: Botão habilitado com texto "Ativar notificações"
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - POSIÇÃO: fixo no canto inferior central (bottom-4, left-1/2, -translate-x-1/2)
 * - ANIMAÇÃO: slide-in-from-bottom-4 + fade-in (Tailwind)
 * - ACESSIBILIDADE: role="dialog", aria-labelledby, aria-describedby
 * - LOADING: Botão desabilitado com texto durante processo
 * 
 * ----------------------------------------------------------------------------
 * 🔗 HOOK RELACIONADO:
 * ----------------------------------------------------------------------------
 * 
 * - usePushSetup: Gerencia estado de permissão e ações de push
 * 
 * @example
 * ```tsx
 * // Uso no layout principal
 * <PushNotificationBanner />
 * ```
 */

export function PushNotificationBanner() {
  const { showPrompt, status, onAccept, onDismiss } = usePushSetup();

  if (!showPrompt) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="push-banner-title"
      aria-describedby="push-banner-desc"
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50
        w-[calc(100%-2rem)] max-w-md
        bg-white border border-gray-200 rounded-2xl shadow-xl
        flex items-start gap-4 p-4
        animate-in slide-in-from-bottom-4 fade-in duration-300
      "
    >
      {/* ==================== ÍCONE ==================== */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
        <Bell className="w-5 h-5 text-blue-600" />
      </div>

      {/* ==================== TEXTO E AÇÕES ==================== */}
      <div className="flex-1 min-w-0">
        <p id="push-banner-title" className="text-sm font-semibold text-gray-900 leading-snug">
          Acompanhe suas reservas em tempo real!
        </p>
        <p id="push-banner-desc" className="mt-0.5 text-xs text-gray-500 leading-relaxed">
          Ative as notificações e receba atualizações de status da sua carga sem precisar abrir o app.
        </p>

        {/* Botões */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={onAccept}
            disabled={status === 'loading'}
            className="
              px-3 py-1.5 rounded-lg text-xs font-medium
              bg-blue-600 text-white
              hover:bg-blue-700 active:scale-95
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            {status === 'loading' ? 'Ativando…' : 'Ativar notificações'}
          </button>

          <button
            onClick={onDismiss}
            className="
              px-3 py-1.5 rounded-lg text-xs font-medium
              text-gray-500 hover:text-gray-700 hover:bg-gray-100
              active:scale-95 transition-all duration-150
            "
          >
            Agora não
          </button>
        </div>
      </div>

      {/* ==================== BOTÃO FECHAR ==================== */}
      <button
        onClick={onDismiss}
        aria-label="Fechar"
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}