'use client';

interface StepFeedbackProps {
  success: boolean;
  message: string | null;
  onNovaReserva: () => void;
  onTentarNovamente: () => void;
}

export default function StepFeedback({
  success,
  message,
  onNovaReserva,
  onTentarNovamente,
}: StepFeedbackProps) {
  if (success) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reserva confirmada!</h2>
        <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
          {message ?? 'Sua solicitação foi processada com sucesso.'}
        </p>
        <button
          onClick={onNovaReserva}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg active:scale-95"
        >
          Fazer nova reserva
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
      <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
        {message ?? 'Não foi possível confirmar sua reserva. Tente novamente.'}
      </p>
      <button
        onClick={onTentarNovamente}
        className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all active:scale-95"
      >
        Tentar novamente
      </button>
    </div>
  );
}