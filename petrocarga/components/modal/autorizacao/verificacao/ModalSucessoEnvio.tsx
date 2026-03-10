'use client';

import { CheckCircle2 } from 'lucide-react';

interface ModalSucessoEnvioProps {
  tipoInput: 'email' | 'cpf' | 'indeterminado';
  onVoltarLogin: () => void;
  onTentarOutro: () => void;
}

export default function ModalSucessoEnvio({
  tipoInput,
  onVoltarLogin,
  onTentarOutro,
}: ModalSucessoEnvioProps) {
  return (
    <div className="text-center space-y-4 sm:space-y-6">
      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full">
        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
          Solicitação recebida!
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          Se este {tipoInput === 'email' ? 'email' : 'CPF'} estiver cadastrado,
          você receberá um código em instantes.
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Verifique sua caixa de entrada e também a pasta de spam.
        </p>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <button
          onClick={onVoltarLogin}
          className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition"
        >
          Voltar para o login
        </button>
        <button
          onClick={onTentarOutro}
          className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-200 transition"
        >
          Tentar outro {tipoInput === 'email' ? 'email' : 'CPF'}
        </button>
      </div>
    </div>
  );
}
