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

interface SlotLivre {
  inicio: Date;
  fim: Date | null;
  duracaoMinutos: number | null;
}

type ReservaBloqueio = {
  inicio: string;
  fim: string;
};

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

  const [vagaDisponivel, setVagaDisponivel] = useState<boolean | null>(null);
  
  // ✅ ESTADO ATUALIZADO PARA GUARDAR O OBJETO COMPLETO
  const [slotLivre, setSlotLivre] = useState<SlotLivre | null>(null);

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  const getNow = (): string => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const toMinutes = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };

  // ✅ HELPER PARA FORMATAR DATE PARA HH:MM (Usado na UI)
  const formatTime = (d: Date) => {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // ✅ NOVA FUNÇÃO QUE RETORNA O PERÍODO E A DURAÇÃO
  const encontrarProximoSlotLivre = (
    reservas: ReservaBloqueio[],
    agora: Date
  ): SlotLivre => {
    const MINIMO_MINUTOS = 15;
    const MINIMO_MS = MINIMO_MINUTOS * 60 * 1000;

    if (!reservas.length) {
      return { inicio: agora, fim: null, duracaoMinutos: null };
    }

    const ordenadas = reservas
      .map((r) => ({
        inicio: new Date(r.inicio),
        fim: new Date(r.fim),
      }))
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    let cursor = new Date(agora);

    for (let i = 0; i < ordenadas.length; i++) {
      const atual = ordenadas[i];

      if (cursor.getTime() + MINIMO_MS <= atual.inicio.getTime()) {
        return {
          inicio: new Date(cursor),
          fim: atual.inicio,
          duracaoMinutos: Math.round((atual.inicio.getTime() - cursor.getTime()) / 60000)
        };
      }

      if (cursor < atual.fim) {
        cursor = new Date(atual.fim);
      }
    }

    return { inicio: cursor, fim: null, duracaoMinutos: null };
  };

  const isNowInReservedRange = (
    reservas: { inicio: string; fim: string }[]
  ) => {
    const now = new Date();
    return reservas.some((r) => {
      if (!r.inicio || !r.fim) return false;
      const inicio = new Date(r.inicio);
      const fim = new Date(r.fim);
      const inicioComMargem = new Date(inicio.getTime() - 15 * 60 * 1000);
      return now >= inicioComMargem && now < fim;
    });
  };

  // --------------------------------------------------------------------------
  // HANDLER: avançar do Step 1 → Step 2
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

    const diasSemanas: DiaSemana[] = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
    const hojeEnum = diasSemanas[today.getDay()];

    const operacaoHoje = selectedVaga.operacoesVaga.find(op => op.diaSemanaAsEnum === hojeEnum)
      || selectedVaga.operacoesVaga[0];

    if (!operacaoHoje) {
      setVagaDisponivel(false);
      setStep(2);
      return;
    }

    const [horaFim, minFim] = operacaoHoje.horaFim.split(':').map(Number);
    const limiteDisponibilidade = new Date(today);
    limiteDisponibilidade.setHours(horaFim, minFim, 0, 0);

    const estaOcupadoAgora = isNowInReservedRange(reservas);
    const proximoSlot = encontrarProximoSlotLivre(reservas, now);

    if (estaOcupadoAgora) {
      setVagaDisponivel(false);

      if (proximoSlot && proximoSlot.inicio < limiteDisponibilidade) {
        setSlotLivre(proximoSlot);
      } else {
        setSlotLivre(null);
      }
    } else {
      if (now > limiteDisponibilidade) {
        setVagaDisponivel(false);
        setSlotLivre(null);
      } else {
        setVagaDisponivel(true);
        setSlotLivre(proximoSlot); // Salva para exibir aviso se o tempo atual for curto
      }
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
      {step < 5 && <StepIndicator step={step} isReservaRapida={true} />}

      <div className="flex-1 flex flex-col overflow-y-auto pb-4">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-5 p-2">
            <h3 className="font-semibold mb-3 text-center">Informações do Veículo</h3>
            <div>
              <p className="font-medium mb-1">Tipo de veículo</p>
              <select
                value={tipoVeiculoAgente || ''}
                onChange={(e) => setTipoVeiculoAgente(e.target.value as Veiculo['tipo'])}
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
                  
                  {/* ✅ ALERTA SE A VAGA ESTIVER LIVRE AGORA, MAS POR TEMPO LIMITADO */}
                  {slotLivre?.duracaoMinutos && slotLivre.fim && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-left">
                      <p className="text-sm text-yellow-800 font-semibold">⚠️ Atenção: Tempo Limitado</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Há uma reserva agendada em breve. Você tem apenas <strong>{slotLivre.duracaoMinutos} minutos</strong> disponíveis (até às {formatTime(slotLivre.fim)}).
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setStep(3)}
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
                  <p className="text-gray-500 mt-1 text-sm">Esta vaga não está disponível no momento.</p>
                  
                  {slotLivre && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3 text-center">
                      <p className="text-sm text-yellow-700 font-medium">Próximo horário livre:</p>
                      <p className="text-2xl font-bold text-yellow-800 mt-1">{formatTime(slotLivre.inicio)}</p>
                      
                      {/* ✅ ALERTA SE O PRÓXIMO HORÁRIO FOR CURTO */}
                      {slotLivre.duracaoMinutos && slotLivre.fim && (
                        <p className="text-sm text-yellow-700 mt-2 border-t border-yellow-200 pt-2">
                          ⏳ Duração máxima deste bloco: <strong>{slotLivre.duracaoMinutos} minutos</strong> (até as {formatTime(slotLivre.fim)}).
                        </p>
                      )}
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

        {/* STEP 3, 4, 5 MANTIDOS IGUAIS... */}
        {step === 3 && startHour && (
          <div className="p-2">
            <h3 className="text-md font-semibold text-gray-700 mb-1">Até quando deseja reservar?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Início: <span className="font-medium text-gray-600">{startHour}</span> (agora)
            </p>
            <TimeSelection
              times={availableTimes.filter((t) => toMinutes(t) > toMinutes(startHour))}
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