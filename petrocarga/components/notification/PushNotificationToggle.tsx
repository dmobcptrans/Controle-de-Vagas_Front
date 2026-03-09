'use client';

import { useState } from 'react';
import { Bell, BellOff, Loader2, X } from 'lucide-react';
import { usePushSetup } from '@/context/PushProvider/usePushSetup';
import Image from 'next/image';

export function PushNotificationToggle() {
  const { status, onAccept } = usePushSetup();
  const [showModal, setShowModal] = useState(false);

  const isGranted = status === 'granted';
  const isLoading = status === 'loading' || status === 'idle';
  const isDenied = status === 'denied';

  function handleToggle() {
    if (isGranted) {
      setShowModal(true);
      return;
    }

    onAccept();
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-4">

        {/* Ícone + texto */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
              ${isGranted ? 'bg-blue-50' : 'bg-gray-100'}
            `}
          >
            {isGranted
              ? <Bell className="w-4 h-4 text-blue-600" />
              : <BellOff className="w-4 h-4 text-gray-400" />
            }
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">
              Notificações de reserva
            </p>

            <p className="text-xs text-gray-500 mt-0.5">
              {isGranted
                ? 'Para desativar, use as configurações do navegador.'
                : isDenied
                  ? 'Permissão negada. Altere nas configurações do navegador.'
                  : 'Receba atualizações de status da sua carga.'
              }
            </p>
          </div>
        </div>

        {/* Toggle */}
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-gray-300 animate-spin shrink-0" />
        ) : (
          <button
            role="switch"
            aria-checked={isGranted}
            onClick={handleToggle}
            disabled={isLoading}
            className={`
              relative inline-flex w-[46px] h-[26px] rounded-full transition-colors
              ${isGranted ? 'bg-blue-600' : 'bg-gray-300'}
              ${isDenied ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                absolute top-[2px] w-[22px] h-[22px] bg-white rounded-full shadow
                transition-all
                ${isGranted ? 'left-[22px]' : 'left-[2px]'}
              `}
            />
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-[92%] max-w-lg md:max-w-2xl p-6">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Desativar notificações
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Para desativar as notificações, siga os passos abaixo nas configurações
              do seu navegador.
            </p>

            {/* tutorial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  1. Clique no cadeado ao lado do endereço do site
                </p>
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src="/image-guia-notif/guia_1.png"
                    alt="Passo 1 configurações do navegador"
                    fill
                    className="object-contain rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  2. Desative a permissão de notificações
                </p>
                <div className="relative w-full aspect-square">
                  <Image
                    src="/image-guia-notif/guia_2.png"
                    alt="Passo 2 desativar notificações"
                    fill
                    className="object-contain rounded-lg border border-gray-200"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Entendi
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}