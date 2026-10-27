'use client';

import { useRouter } from 'next/navigation';
import type { ConfirmResult } from '@/lib/types/confirmResult';

interface Props {
  resultado: ConfirmResult;
  onRetry: () => void;
}

export default function ResultadoReserva({ resultado, onRetry }: Props) {
  const router = useRouter();
  const ok = resultado.success;

  return (
    <div className="flex-1 flex items-center justify-center w-full animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-scale ${
            ok ? 'bg-green-500 text-white shadow-2xl' : 'bg-red-100 text-red-600 shadow-sm'
          }`}
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={ok ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {ok ? 'Reserva confirmada!' : 'Ops! Algo deu errado'}
        </h2>

        <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
          {resultado.message ??
            (ok ? 'Sua solicitação foi processada com sucesso.' : 'Não foi possível confirmar sua reserva. Tente novamente.')}
        </p>

        {ok ? (
          <button
            onClick={() => router.push('/minhas-reservas')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg active:scale-95"
          >
            Ir para minhas reservas
          </button>
        ) : (
          <button
            onClick={onRetry}
            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl active:scale-95"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}