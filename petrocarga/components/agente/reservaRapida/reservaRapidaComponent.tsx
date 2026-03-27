'use client';

import { useState } from 'react';
import { useReserva } from '@/components/hooks/reserva/useReserva';
import { Vaga, DiaSemana } from '@/lib/types/vaga';
import TimeSelection from '@/components/reserva/TimeSelection';
import StepIndicator from '@/components/reserva/StepIndicator';
import Confirmation from '@/components/reserva/Confirmation';
import { Veiculo } from '@/lib/types/veiculo';
import toast from 'react-hot-toast';
import { fetchReservasBloqueios } from '@/components/hooks/reserva/reservaService';

interface ReservaAgenteProps {
  selectedVaga: Vaga;
  onBack?: () => void;
}

/**
 * @component ReservaAgente
 * @version 2.0.0
 *
 * @description Componente de reserva rápida para agentes em 5 etapas.
 * A hora de início é sempre o momento atual ao clicar em "Próximo" no Step 1.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO (5 ETAPAS):
 * ----------------------------------------------------------------------------
 *
 * STEP 1 - DADOS DO VEÍCULO:
 *    - Tipo de veículo (select com 5 opções)
 *    - Placa (obrigatória, 7 caracteres)
 *    - Ao clicar "Próximo": captura hora atual como startHour e verifica status da vaga
 *
 * STEP 2 - STATUS DA VAGA:
 *    - Livre: exibe mensagem verde e botão para continuar
 *    - Ocupada: exibe próximo horário disponível e bloqueia avanço
 *
 * STEP 3 - HORÁRIO FINAL:
 *    - Apenas horários posteriores ao momento atual (startHour)
 *
 * STEP 4 - CONFIRMAÇÃO:
 *    - Resumo da reserva com loading state
 *
 * STEP 5 - FEEDBACK:
 *    - Sucesso: ícone verde
 *    - Erro: ícone vermelho com "Tentar novamente"
 */
export default function ReservaAgente({
  selectedVaga,
  onBack,
}: ReservaAgenteProps) {
  // --------------------------------------------------------------------------
  // HOOK DE RESERVA
  // --------------------------------------------------------------------------
  const reserva = useReserva(selectedVaga);
  const {
    tipoVeiculoAgente,
    setTipoVeiculoAgente,
    placaAgente,
    setPlacaAgente,
    selectedDay,
    setSelectedDay,
    availableTimes,
    reservedTimesEnd,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    fetchHorariosDisponiveis,
    handleConfirm,
    availableDates,
  } = reserva;

  // --------------------------------------------------------------------------
  // ESTADOS LOCAIS
  // --------------------------------------------------------------------------
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Status da vaga no momento atual.
   * null  = ainda não verificado
   * true  = disponível agora
   * false = ocupada agora
   */
  const [vagaDisponivel, setVagaDisponivel] = useState<boolean | null>(null);
  const [proximoHorarioLivre, setProximoHorarioLivre] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  /** Hora atual formatada como "HH:MM" */
  const getNow = (): string => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  /** Converte "HH:MM" para minutos desde meia-noite */
  const toMinutes = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };

  const encontrarProximoHorarioLivre = (
    reservas: ReservaBloqueio[],
    agora: Date
  ): Date | null => {
    if (!reservas.length) return agora;

    const MARGEM_MINUTOS = 6;

    const ordenadas = reservas
      .map((r) => {
        const inicioReal = new Date(r.inicio);
        // Subtrai 6 minutos do início original
        const inicioComMargem = new Date(inicioReal.getTime() - MARGEM_MINUTOS * 60000);

        return {
          inicio: inicioComMargem,
          fim: new Date(r.fim),
        };
      })
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    let cursor = agora;

    for (const r of ordenadas) {
      // Se o cursor atual é antes do início (com margem), achamos um buraco livre
      if (cursor < r.inicio) {
        return cursor;
      }

      // Se o cursor cai dentro do período bloqueado (ou na margem), pula para o fim
      if (cursor >= r.inicio && cursor < r.fim) {
        cursor = r.fim;
      }
    }

    return cursor;
  };

  const isNowInReservedRange = (
    reservas: { inicio: string; fim: string }[]
  ) => {
    const now = new Date();

    return reservas.some((r) => {
      if (!r.inicio || !r.fim) return false;

      const inicio = new Date(r.inicio);
      const fim = new Date(r.fim);

      return now >= inicio && now < fim;
    });
  };
  type ReservaBloqueio = {
    inicio: string;
    fim: string;
  };

  // --------------------------------------------------------------------------
  // HANDLER: avançar do Step 1 → Step 2
  // Captura hora atual, busca horários e verifica disponibilidade da vaga
  // --------------------------------------------------------------------------
const handleNextFromStep1 = async () => {
  const now = new Date();
  const nowFormatted = getNow();
  const today = new Date();
  const dataFormatada = today.toISOString().split('T')[0];

  setStartHour(nowFormatted);
  setSelectedDay(today);

  const reservas: ReservaBloqueio[] = await fetchReservasBloqueios(
    selectedVaga.id,
    dataFormatada,
    tipoVeiculoAgente!
  );

  // 1. Identificar o dia da semana atual para pegar a operação correta
  const diasSemanas: DiaSemana[] = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
  const hojeEnum = diasSemanas[today.getDay()];

  // 2. Tentar encontrar a operação de HOJE. Se não achar, tenta a primeira (fallback)
  const operacaoHoje = selectedVaga.operacoesVaga.find(op => op.diaSemanaAsEnum === hojeEnum) 
                       || selectedVaga.operacoesVaga[0];

  if (!operacaoHoje) {
    // Se não houver nenhuma operação cadastrada, decidimos como tratar (aqui trato como fechada)
    setVagaDisponivel(false);
    setStep(2);
    return;
  }

  // 3. Extrair hora e minuto do fechamento
  const [horaFim, minFim] = operacaoHoje.horaFim.split(':').map(Number);
  const limiteDisponibilidade = new Date(today);
  limiteDisponibilidade.setHours(horaFim, minFim, 0, 0);

  const estaOcupadoAgora = isNowInReservedRange(reservas);

  if (estaOcupadoAgora) {
    setVagaDisponivel(false);

    // Encontra o próximo horário livre considerando os -6 min
    const proximoLivre = encontrarProximoHorarioLivre(reservas, now);

    // ✅ VALIDAÇÃO: Se houver próximo livre e for antes do fechamento
    if (proximoLivre && proximoLivre < limiteDisponibilidade) {
      const hh = String(proximoLivre.getHours()).padStart(2, '0');
      const mm = String(proximoLivre.getMinutes()).padStart(2, '0');
      setProximoHorarioLivre(`${hh}:${mm}`);
    } else {
      setProximoHorarioLivre(null); 
    }

    setStep(2);
    return;
  }

  // 4. Se não estiver ocupado por reserva, checar se já passou do horário de fechamento
  if (now > limiteDisponibilidade) {
    setVagaDisponivel(false);
    setProximoHorarioLivre(null);
  } else {
    setVagaDisponivel(true);
    setProximoHorarioLivre(null);
  }

  setStep(2);
};
  // --------------------------------------------------------------------------
  // HANDLER DE CONFIRMAÇÃO
  // --------------------------------------------------------------------------
  const onConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await handleConfirm();

      if (!result.success) {
        toast.error('Erro ao confirmar reserva');
      } else {
        toast.success('Reserva confirmada com sucesso!');
      }

      setSuccess(result.success);
      setFeedbackMessage(result.message ?? null);
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="p-4 sm:p-6 border rounded-xl shadow-lg max-w-2xl mx-auto bg-white min-h-[80vh] flex flex-col gap-4">

      {/* Indicador de Progresso */}
      {step < 5 && <StepIndicator step={step} isReservaRapida={true} />}

      <div className="flex-1 flex flex-col overflow-y-auto pb-4">

        {/* ===================== STEP 1 - DADOS DO VEÍCULO ===================== */}
        {step === 1 && (
          <div className="flex flex-col gap-5 p-2">
            <h3 className="font-semibold mb-3 text-center">
              Informações do Veículo
            </h3>

            {/* Tipo de veículo */}
            <div>
              <p className="font-medium mb-1">Tipo de veículo</p>
              <select
                value={tipoVeiculoAgente || ''}
                onChange={(e) =>
                  setTipoVeiculoAgente(e.target.value as Veiculo['tipo'])
                }
                className="w-full border rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Selecione...</option>
                <option value="AUTOMOVEL">Automóvel</option>
                <option value="VUC">VUC</option>
                <option value="CAMINHONETA">Caminhoneta</option>
                <option value="CAMINHAO_MEDIO">Caminhão médio</option>
                <option value="CAMINHAO_LONGO">Caminhão longo</option>
              </select>
            </div>

            {/* Placa */}
            <div>
              <p className="font-medium mb-1">Placa</p>
              <input
                value={placaAgente}
                onChange={(e) => setPlacaAgente(e.target.value.toUpperCase())}
                className="w-full border rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Digite a placa"
                maxLength={7}
              />
            </div>

            {/* Botão próximo — captura hora atual e verifica disponibilidade */}
            <button
              onClick={handleNextFromStep1}
              disabled={!tipoVeiculoAgente || placaAgente.length < 7}
              className={`py-3 rounded-lg mt-4 font-semibold transition-opacity ${!tipoVeiculoAgente || placaAgente.length < 7
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              Próximo
            </button>
          </div>
        )}

        {/* ===================== STEP 2 - STATUS DA VAGA ===================== */}
        {step === 2 && (
          <div className="flex flex-col items-center gap-6 p-2 text-center">
            <h3 className="text-md font-semibold text-gray-700">
              Status da Vaga
            </h3>

            {vagaDisponivel ? (
              /* Vaga LIVRE */
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
                  onClick={() => setStep(3)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Continuar
                </button>
              </>
            ) : (
              /* Vaga OCUPADA */
              <>
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">Vaga Ocupada</p>
                  <p className="text-gray-500 mt-1 text-sm">
                    Esta vaga não está disponível no momento.
                  </p>
                  {proximoHorarioLivre && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3">
                      <p className="text-sm text-yellow-700 font-medium">Próximo horário livre:</p>
                      <p className="text-2xl font-bold text-yellow-800 mt-1">{proximoHorarioLivre}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => setStep(1)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Voltar
            </button>
          </div>
        )}

        {/* ===================== STEP 3 - HORÁRIO FINAL ===================== */}
        {step === 3 && startHour && (
          <div className="p-2">
            <h3 className="text-md font-semibold text-gray-700 mb-1">
              Até quando deseja reservar?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Início: <span className="font-medium text-gray-600">{startHour}</span> (agora)
            </p>
            <TimeSelection
              times={availableTimes.filter(
                (t) => toMinutes(t) > toMinutes(startHour)
              )}
              reserved={reservedTimesEnd}
              selected={endHour}
              onSelect={(t) => {
                setEndHour(t);
                setStep(4);
              }}
              onBack={() => setStep(2)}
              color="blue"
            />
          </div>
        )}

        {/* ===================== STEP 4 - CONFIRMAÇÃO ===================== */}
        {step === 4 && startHour && endHour && (
          <Confirmation
            day={selectedDay!}
            startHour={startHour!}
            endHour={endHour!}
            origin="Agente Local"
            destination={`${selectedVaga.endereco.logradouro}, ${selectedVaga.endereco.bairro}`}
            vehicleName={`${tipoVeiculoAgente} - ${placaAgente}`}
            onConfirm={onConfirm}
            onReset={() => setStep(3)}
          />
        )}

        {/* ===================== STEP 5 - FEEDBACK ===================== */}
        {step === 5 && (
          <div className="flex-1 flex items-center justify-center w-full animate-in fade-in zoom-in duration-300">
            {success ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reserva confirmada!</h2>
                <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
                  {feedbackMessage ?? 'Sua solicitação foi processada com sucesso.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
                <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
                  {feedbackMessage ?? 'Não foi possível confirmar sua reserva. Tente novamente.'}
                </p>
                <button
                  onClick={() => {
                    setStep(4);
                    setSuccess(null);
                    setFeedbackMessage(null);
                  }}
                  className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all active:scale-95"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}