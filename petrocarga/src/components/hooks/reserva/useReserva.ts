import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { DIAS_SEMANA } from './reservaHelpers';
import { Veiculo } from '@/lib/types/veiculo';
import { DiaSemana, Vaga } from '@/lib/types/vaga';
import { ReservaState } from '@/lib/types/reservas/reservaState';
import { ConfirmResult } from '@/lib/types/confirmResult';

import { getVeiculosUsuario } from '@/services/api/veiculoApi';

import {
  gerarHorariosDia,
  gerarHorariosOcupadosInicio,
  gerarHorariosOcupadosFim,
  getOperacaoDia,
  formatDateTime,
  removerHorariosPassadosDeHoje,
} from './reservaHelpers';

import {
  fetchReservasBloqueios,
  fetchDisponibilidadeByVagaId,
  confirmarReserva,
  confirmarReservaAgente,
} from './reservaService';
import { getVeiculosVinculadosMotoristaEmpresa } from '@/services/api/empresaApi';

/**
 * @hook useReserva
 * @version 1.0.0
 *
 * @description Hook principal para gerenciamento do fluxo de reserva de vagas.
 * Suporta tanto motoristas quanto agentes, gerenciando estados, busca de horários e confirmação.
 *
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 *
 * @property {ReservaState} ...reservaState - Todos os campos do estado da reserva
 * @property {boolean} isAgente - Indica se o usuário é agente
 * @property {Veiculo[]} vehicles - Lista de veículos do motorista
 * @property {boolean} loadingMotorista - Carregando dados do motorista
 * @property {boolean} loadingHorarios - Carregando horários disponíveis
 * @property {boolean} horariosCarregados - Horários já foram carregados
 * @property {Date[]} availableDates - Datas disponíveis para reserva
 * @property {function} fetchDiasDisponiveis - Busca dias disponíveis
 * @property {function} fetchHorariosDisponiveis - Busca horários disponíveis
 * @property {function} handleConfirm - Confirma a reserva
 * @property {function} reset - Reseta o estado da reserva
 * @property {function} setStep - Define etapa atual
 * @property {function} setSelectedDay - Define dia selecionado
 * @property {function} setStartHour - Define hora de início
 * @property {function} setEndHour - Define hora de fim
 * @property {function} setOrigin - Define origem
 * @property {function} setEntryCity - Define entrada na cidade
 * @property {function} setSelectedVehicleId - Define veículo selecionado (motorista)
 * @property {function} setTipoVeiculoAgente - Define tipo de veículo (agente)
 * @property {function} setPlacaAgente - Define placa (agente)
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. BUSCA DIAS DISPONÍVEIS:
 *    - fetchDiasDisponiveis consulta disponibilidades da vaga
 *    - Filtra dias que estão dentro do período de disponibilidade
 *    - Considera dias permitidos pela operação da vaga
 *
 * 2. BUSCA HORÁRIOS DISPONÍVEIS:
 *    - fetchHorariosDisponiveis consulta bloqueios para o dia selecionado
 *    - Gera todos os horários do dia baseado na operação
 *    - Remove horários bloqueados por reservas existentes
 *    - Remove horários passados (se o dia for hoje)
 *
 * 3. CÁLCULO DE HORÁRIOS FINAIS:
 *    - Quando horário inicial é selecionado, calcula horários finais possíveis
 *    - Considera limite de horas por área (vermelha:1h, amarela:2h, azul:4h, branca:6h)
 *
 * 4. CONFIRMAÇÃO:
 *    - Monta FormData com dados da reserva
 *    - Chama API apropriada (motorista ou agente)
 *    - Reseta estado após sucesso
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - MODO AGENTE vs MOTORISTA: Diferenciação por permissão do usuário
 * - ATUALIZAÇÃO OTIMISTA: UI responde rapidamente, feedback posterior
 * - LIMITE POR ÁREA: Restrição de duração máxima por cor da vaga
 * - CACHE DE HORÁRIOS: Evita recálculos desnecessários
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - reservaHelpers: Funções auxiliares de horários
 * - reservaService: Serviços de API
 * - ReservaState: Tipo do estado
 *
 * @example
 * ```tsx
 * const reserva = useReserva(selectedVaga);
 *
 * // Motorista
 * if (!reserva.isAgente) {
 *   return <OriginVehicleStep
 *     vehicles={reserva.vehicles}
 *     selectedVehicleId={reserva.selectedVehicleId}
 *     onVehicleChange={reserva.setSelectedVehicleId}
 *     // ...
 *   />;
 * }
 *
 * // Agente
 * return <ReservaAgenteForm
 *   tipoVeiculo={reserva.tipoVeiculoAgente}
 *   onTipoChange={reserva.setTipoVeiculoAgente}
 *   placa={reserva.placaAgente}
 *   onPlacaChange={reserva.setPlacaAgente}
 * />;
 * ```
 */

export function useReserva(selectedVaga: Vaga | null) {
  const { user } = useAuth();
  const isAgente = user?.permissao === 'AGENTE';
  const isEmpresa = user?.permissao === 'EMPRESA';

  // ==================== ESTADO PRINCIPAL ====================
  const [reservaState, setReservaState] = useState<ReservaState>({
    step: 1,
    selectedDay: undefined,
    availableTimes: [],
    reservedTimesStart: [],
    reservedTimesEnd: [],
    startHour: null,
    endHour: null,
    origin: '',
    entryCity: null,
    selectedVehicleId: undefined,
    tipoVeiculoAgente: undefined,
    placaAgente: '',
  });

  const motoristaId = user?.id;
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [loadingDias, setLoadingDias] = useState(false);
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);
  const [vehiclePage, setVehiclePage] = useState(0);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclePageSize] = useState(5);
  const [vehicleTotalPages, setVehicleTotalPages] = useState(0);
  const [motoristaSelecionadoId, setMotoristaSelecionadoId] = useState<
    string | null
  >(null);
  const [loadingMotorista, setLoadingMotorista] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [horariosCarregados, setHorariosCarregados] = useState(false);
  const reservedTimesEndBaseRef = useRef<string[]>([]);

  const INTERVALO_AGENTE = 15;
  const INTERVALO_MOTORISTA = 30;

  // ==================== RESET ====================
  const reset = useCallback(() => {
    setReservaState({
      step: 1,
      selectedDay: undefined,
      availableTimes: [],
      reservedTimesStart: [],
      reservedTimesEnd: [],
      startHour: null,
      endHour: null,
      origin: '',
      entryCity: null,
      selectedVehicleId: undefined,
      tipoVeiculoAgente: undefined,
      placaAgente: '',
    });
  }, []);

  // ==================== BUSCA DIAS DISPONÍVEIS ====================
  const fetchDiasDisponiveis = useCallback(
    async (mesReferencia: Date) => {
      if (!selectedVaga) return;

      const diasPermitidos: DiaSemana[] =
        selectedVaga.operacoesVaga?.map((op) => op.diaSemanaAsEnum) ?? [];

      if (diasPermitidos.length === 0) {
        setAvailableDates([]);
        return;
      }

      setLoadingDias(true);

      try {
        const mes = mesReferencia.getMonth() + 1;
        const ano = mesReferencia.getFullYear();

        const disponibilidades = await fetchDisponibilidadeByVagaId(
          selectedVaga.id,
          mes,
          ano,
        );

        if (!disponibilidades || disponibilidades.length === 0) {
          setAvailableDates([]);
          return;
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const datasValidasSet = new Set<string>();

        for (const disp of disponibilidades) {
          const atual = new Date(disp.inicio);
          const fim = new Date(disp.fim);

          atual.setHours(0, 0, 0, 0);
          fim.setHours(0, 0, 0, 0);

          while (atual <= fim) {
            const diaSemana: DiaSemana = DIAS_SEMANA[atual.getDay()];

            if (diasPermitidos.includes(diaSemana) && atual >= hoje) {
              if (atual.getTime() === hoje.getTime()) {
                const operacaoHoje = selectedVaga.operacoesVaga.find(
                  (op) => op.diaSemanaAsEnum === diaSemana,
                );

                if (!operacaoHoje) {
                  atual.setDate(atual.getDate() + 1);
                  continue;
                }

                const [hFim, mFim] = operacaoHoje.horaFim
                  .split(':')
                  .map(Number);

                const dataHoraFim = new Date();
                dataHoraFim.setHours(hFim, mFim, 0, 0);

                if (new Date() >= dataHoraFim) {
                  atual.setDate(atual.getDate() + 1);
                  continue;
                }
              }

              datasValidasSet.add(atual.toISOString());
            }

            atual.setDate(atual.getDate() + 1);
          }
        }

        setAvailableDates(Array.from(datasValidasSet).map((d) => new Date(d)));
      } finally {
        setLoadingDias(false);
      }
    },
    [selectedVaga],
  );

  // ==================== BUSCA HORÁRIOS DISPONÍVEIS ====================
  const fetchHorariosDisponiveis = useCallback(
    async (day: Date, vaga: Vaga, vehicleId?: string): Promise<string[]> => {
      setLoadingHorarios(true);
      setHorariosCarregados(false);

      try {
        const operacao = getOperacaoDia(day, vaga);

        console.log(operacao);

        const intervalo = isAgente ? INTERVALO_AGENTE : INTERVALO_MOTORISTA;

        if (!operacao) return [];

        let tipoVeiculo: Veiculo['tipo'] | undefined;

        if (!isAgente) {
          const v = vehicles.find((x) => x.id === vehicleId);

          if (!v) return [];

          tipoVeiculo = v.tipo;
        } else {
          tipoVeiculo = reservaState.tipoVeiculoAgente;
        }

        if (!tipoVeiculo) return [];

        const dataFormatada = day.toISOString().split('T')[0];

        const bloqueios = await fetchReservasBloqueios(
          vaga.id,
          dataFormatada,
          tipoVeiculo,
        );

        const horariosOcupadosInicio = gerarHorariosOcupadosInicio(
          bloqueios,
          intervalo,
        );

        const horariosOcupadosFim = gerarHorariosOcupadosFim(
          bloqueios,
          intervalo,
        );

        const todosHorarios = gerarHorariosDia(operacao, intervalo);

        const horariosFiltradosHoje = removerHorariosPassadosDeHoje(
          day,
          todosHorarios,
        );

        const horariosDisponiveis = horariosFiltradosHoje.filter(
          (horario) => !horariosOcupadosInicio.includes(horario),
        );

        reservedTimesEndBaseRef.current = horariosOcupadosFim;

        setReservaState((prev) => ({
          ...prev,
          availableTimes: horariosDisponiveis,
          reservedTimesStart: horariosOcupadosInicio,
          reservedTimesEnd: horariosOcupadosFim,
        }));

        return horariosDisponiveis;
      } finally {
        setLoadingHorarios(false);
        setHorariosCarregados(true);
      }
    },
    [vehicles, reservaState.tipoVeiculoAgente, isAgente],
  );

  // ==================== CÁLCULO DE HORÁRIOS FINAIS ====================
  const calcularReservedTimesEnd = useCallback(
    (start: string, vaga: Vaga) => {
      if (!start || !reservaState.selectedDay) return [];

      const limites: Record<string, number> = {
        VERMELHA: 1,
        AMARELA: 2,
        AZUL: 4,
        BRANCA: 6,
      };

      const limiteHoras = limites[vaga.area] ?? 1;
      const inicio = new Date(
        `${reservaState.selectedDay.toISOString().split('T')[0]}T${start}:00`,
      );
      const fimMax = new Date(inicio);
      fimMax.setHours(fimMax.getHours() + limiteHoras);

      const horariosPossiveis = reservaState.availableTimes.filter(
        (t) =>
          reservaState.availableTimes.indexOf(t) >
          reservaState.availableTimes.indexOf(start),
      );

      const ocupados = reservedTimesEndBaseRef.current;

      return horariosPossiveis.filter((h) => {
        const d = new Date(
          `${reservaState.selectedDay!.toISOString().split('T')[0]}T${h}:00`,
        );
        if (d > fimMax) return true;
        if (ocupados.includes(h)) return true;
        return false;
      });
    },
    [reservaState.selectedDay, reservaState.availableTimes],
  );

  useEffect(() => {
    if (!reservaState.startHour || !selectedVaga) return;
    const bloqueados = calcularReservedTimesEnd(
      reservaState.startHour,
      selectedVaga,
    );
    setReservaState((prev) => ({
      ...prev,
      reservedTimesEnd: bloqueados,
    }));
  }, [reservaState.startHour, selectedVaga?.id, calcularReservedTimesEnd]);

  useEffect(() => {
    if (!reservaState.startHour || !selectedVaga) return;
    const bloqueados = calcularReservedTimesEnd(
      reservaState.startHour,
      selectedVaga,
    );
    setReservaState((prev) => ({
      ...prev,
      reservedTimesEnd: bloqueados,
    }));
  }, [reservaState.startHour, selectedVaga?.id, calcularReservedTimesEnd]);

  // ==================== CARREGA VEÍCULOS (USUÁRIO COMUM) ====================

  useEffect(() => {
    if (!user?.id || isAgente || isEmpresa) return;

    const loadVehicles = async () => {
      setVehiclesLoading(true);

      try {
        const r = await getVeiculosUsuario(user.id, {
          ativo: true,
          pagina: vehiclePage,
          tamanhoPagina: vehiclePageSize,
        });

        setVehicles(r.content);
        setVehicleTotalPages(r.totalPaginas);
      } catch (err) {
        console.error('Erro ao carregar veículos:', err);
        setVehicles([]);
        setVehicleTotalPages(0);
      } finally {
        setVehiclesLoading(false);
      }
    };

    loadVehicles();
  }, [user, isAgente, isEmpresa, vehiclePage, vehiclePageSize]);

  const fetchVeiculosMotorista = useCallback(
    async (motoristaId: string, pagina?: number) => {
      if (!user?.id || !motoristaId) return;

      setVehiclesLoading(true);

      try {
        const paginaAtual = pagina ?? vehiclePage;

        const r = await getVeiculosVinculadosMotoristaEmpresa(
          user.id,
          motoristaId,
          {
            ativo: true,
            pagina: paginaAtual,
            tamanhoPagina: vehiclePageSize,
          },
        );

        const veiculosFormatados: Veiculo[] = r.content.map((v) => ({
          id: v.id,
          marca: v.marca,
          modelo: v.modelo,
          placa: v.placa,
          tipo: v.tipo,
          comprimento: v.comprimento,
        }));

        setVehicles(veiculosFormatados);
        setVehicleTotalPages(r.totalPaginas);
        setMotoristaSelecionadoId(motoristaId);
      } catch (err) {
        console.error('Erro ao carregar veículos do motorista:', err);
        setVehicles([]);
        setVehicleTotalPages(0);
      } finally {
        setVehiclesLoading(false);
      }
    },
    [user?.id, vehiclePage, vehiclePageSize],
  );

  useEffect(() => {
    if (!isEmpresa || !motoristaSelecionadoId) return;

    fetchVeiculosMotorista(motoristaSelecionadoId, vehiclePage);
  }, [isEmpresa, motoristaSelecionadoId, vehiclePage, fetchVeiculosMotorista]);
  // ==================== TRIGGER AUTOMÁTICO DE HORÁRIOS ====================
  useEffect(() => {
    if (!selectedVaga || !reservaState.selectedDay) return;

    if (isAgente && reservaState.tipoVeiculoAgente) {
      fetchHorariosDisponiveis(reservaState.selectedDay, selectedVaga);
    }

    if (!isAgente && reservaState.selectedVehicleId) {
      fetchHorariosDisponiveis(
        reservaState.selectedDay,
        selectedVaga,
        reservaState.selectedVehicleId,
      );
    }
  }, [
    selectedVaga,
    reservaState.selectedDay,
    reservaState.selectedVehicleId,
    reservaState.tipoVeiculoAgente,
    fetchHorariosDisponiveis,
    isAgente,
  ]);

  // ==================== SETTERS ====================
  const setStep = (step: number) =>
    setReservaState((prev) => ({ ...prev, step }));
  const setSelectedDay = (selectedDay?: Date) =>
    setReservaState((prev) => ({ ...prev, selectedDay }));
  const setStartHour = (startHour: string | null) =>
    setReservaState((prev) => ({ ...prev, startHour }));
  const setEndHour = (endHour: string | null) =>
    setReservaState((prev) => ({ ...prev, endHour }));
  const setOrigin = (origin: string) =>
    setReservaState((prev) => ({ ...prev, origin }));
  const setEntryCity = (entryCity: string | null) =>
    setReservaState((prev) => ({ ...prev, entryCity }));
  const setSelectedVehicleId = (selectedVehicleId?: string) =>
    setReservaState((prev) => ({ ...prev, selectedVehicleId }));
  const setTipoVeiculoAgente = (tipo: Veiculo['tipo']) =>
    setReservaState((prev) => ({ ...prev, tipoVeiculoAgente: tipo }));
  const setPlacaAgente = (placa: string) =>
    setReservaState((prev) => ({ ...prev, placaAgente: placa }));

  // ==================== CONFIRMAR RESERVA ====================
  const handleConfirm = useCallback(
    async (extra?: {
      cidadeOrigem?: string;
      entradaCidade?: string;
      motoristaId?: string;
      isEmpresa?: boolean;
    }): Promise<ConfirmResult> => {
      if (!user?.id || !selectedVaga) {
        return {
          success: false,
          message: 'Sessão inválida ou vaga não selecionada.',
        };
      }

      const {
        selectedDay,
        selectedVehicleId,
        tipoVeiculoAgente,
        placaAgente,
        startHour,
        endHour,
        origin,
        entryCity,
      } = reservaState;

      if (!selectedDay || !startHour || !endHour) {
        return { success: false, message: 'Data ou horário inválido.' };
      }

      const formData = new FormData();
      formData.append('vagaId', selectedVaga.id);

      formData.append('inicio', formatDateTime(selectedDay, startHour));
      formData.append('fim', formatDateTime(selectedDay, endHour));

      let cidadeFinal = origin;
      let entradaFinal = entryCity;

      if (isAgente) {
        cidadeFinal = extra?.cidadeOrigem || '';
        entradaFinal = extra?.entradaCidade || '';
      }

      if (cidadeFinal) {
        formData.append('cidadeOrigem', cidadeFinal);
      }

      if (entradaFinal) {
        formData.append('entradaCidade', entradaFinal);
      }

      if (isAgente) {
        if (!tipoVeiculoAgente || !placaAgente) {
          return {
            success: false,
            message: 'Informe o tipo do veículo e a placa.',
          };
        }

        formData.append('tipoVeiculo', tipoVeiculoAgente);
        formData.append('placa', placaAgente);
      } else {
        if (!selectedVehicleId) {
          return {
            success: false,
            message: 'Veículo não selecionado.',
          };
        }

        const motoristaReserva = extra?.isEmpresa
          ? extra.motoristaId
          : motoristaId;

        if (!motoristaReserva) {
          return {
            success: false,
            message: extra?.isEmpresa
              ? 'Selecione um motorista da empresa.'
              : 'Dados do motorista incompletos.',
          };
        }

        formData.append('motoristaId', motoristaReserva);
        formData.append('veiculoId', selectedVehicleId);
      }

      const result = isAgente
        ? await confirmarReservaAgente(formData)
        : await confirmarReserva(formData);

      if (!result.success) {
        return {
          success: false,
          message: result.message ?? 'Não foi possível confirmar a reserva.',
        };
      }

      return { success: true, message: 'Reserva confirmada com sucesso!' };
    },
    [user, selectedVaga, motoristaId, reservaState, isAgente],
  );

  // ==================== RETORNO ====================
  return {
    ...reservaState,
    isEmpresa,
    selectedVaga,
    isAgente,

    vehicles,
    vehiclesLoading,
    vehiclePage,
    vehicleTotalPages,
    vehiclePageSize,
    setVehiclePage,

    loadingMotorista,
    loadingHorarios,
    horariosCarregados,

    fetchVeiculosMotorista,
    fetchDiasDisponiveis,
    availableDates,
    loadingDias,

    setStep,
    setSelectedDay,
    setStartHour,
    setEndHour,
    setOrigin,
    setEntryCity,
    setSelectedVehicleId,
    setTipoVeiculoAgente,
    setPlacaAgente,

    fetchHorariosDisponiveis,
    handleConfirm,
    reset,
  };
}
