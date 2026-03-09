'use client';

import { Bell, X } from 'lucide-react';
import { usePushSetup } from './usePushSetup';

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
      {/* Ícone */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
        <Bell className="w-5 h-5 text-blue-600" />
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p id="push-banner-title" className="text-sm font-semibold text-gray-900 leading-snug">
          Acompanhe suas reservas em tempo real!
        </p>
        <p id="push-banner-desc" className="mt-0.5 text-xs text-gray-500 leading-relaxed">
          Ative as notificações e receba atualizações de status da sua carga sem precisar abrir o app.
        </p>

        {/* Ações */}
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

      {/* Fechar */}
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
