'use client';

import { Vaga } from '@/lib/types/vaga';

interface SlotLivre {
  inicio: Date;
  fim: Date | null;
  duracaoMinutos: number | null;
}

interface StepStatusVagaProps {
  vagaDisponivel: boolean | null;
  selectedVaga: Vaga;
  slotLivre: SlotLivre | null;
  onContinuar: () => void;
  onVoltar: () => void;
}

function formatTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function StepStatusVaga({
  vagaDisponivel,
  selectedVaga,
  slotLivre,
  onContinuar,
  onVoltar,
}: StepStatusVagaProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-2 text-center">
      <h3 className="text-md font-semibold text-gray-700">Status da Vaga</h3>

      {vagaDisponivel ? (
        <>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">Vaga Disponível!</p>
            <p className="text-gray-500 mt-1 text-sm">
              A vaga está livre agora. Escolha até quando deseja reservar.
            </p>
          </div>
          <button
            onClick={onContinuar}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continuar
          </button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="w-full">
            <p className="text-xl font-bold text-gray-800">Vaga Ocupada</p>
            {selectedVaga.tipoVaga === 'PERPENDICULAR' && (
              <p className="text-gray-500 mt-1 text-sm">
                Vaga Perpendicular ({selectedVaga.quantidade} vagas já ocupadas)
              </p>
            )}
            <p className="text-gray-500 mt-1 text-sm">
              Esta vaga não está disponível no momento.
            </p>

            {slotLivre && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3 text-center">
                <p className="text-sm text-yellow-700 font-medium">
                  Próximo horário livre:
                </p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">
                  {formatTime(slotLivre.inicio)}
                </p>
                {slotLivre.duracaoMinutos && slotLivre.fim && (
                  <p className="text-sm text-yellow-700 mt-2 border-t border-yellow-200 pt-2">
                    ⏳ Duração máxima deste bloco:{' '}
                    <strong>{slotLivre.duracaoMinutos} minutos</strong>{' '}
                    (até as {formatTime(slotLivre.fim)}).
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <button
        onClick={onVoltar}
        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Voltar
      </button>
    </div>
  );
}