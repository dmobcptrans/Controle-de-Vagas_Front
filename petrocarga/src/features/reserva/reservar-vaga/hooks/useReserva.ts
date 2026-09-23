import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { DIAS_SEMANA } from './reservaHelpers';
import { VeiculoResponse } from '@/features/veiculos/types/veiculo';
import { DiaSemana, VagaResponse } from '@/features/vaga/vagas/types/vaga';
import { ReservaState } from '../types/reservaState';
import { ConfirmResult } from '@/lib/types/confirmResult';
import {
  gerarHorariosDia,
  gerarHorariosOcupadosInicio,
  gerarHorariosOcupadosFim,
  getOperacaoDia,
  formatDateTime,
  removerHorariosPassadosDeHoje,
} from './reservaHelpers';

import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';
import { useReservaMutation } from '../../reservas/hooks/useReservaMutation';
import { useReservas } from '../../reservas/hooks/useReservas';
import { useDisponibilidade } from '@/features/vaga/disponibilidadeVaga/hooks/useDisponibilidade';

import {
  CriarReservaPayload,
  ReservaParams,
  ReservaResponse,
} from '../../reservas/types/reservas';

import { getVeiculosVinculadosMotoristaEmpresa } from '@/features/usuarios/(personas)/empresas/services/empresaApi';
import { DisponibilidadesParam } from '@/features/vaga/disponibilidadeVaga/types/disponibilidadeVaga';
import { CriarReservaRapidaPayload } from '../../reservas/types/reservaRapida';

/**
 * @hook useReserva
 * @version 2.0.0
 *
 * @description Hook principal para gerenciamento do fluxo de reserva de vagas.
 * Suporta tanto motoristas quanto agentes, gerenciando estados, busca de horários e confirmação.
 *
 * ----------------------------------------------------------------------------
 * 🔄 MUDANÇAS EM RELAÇÃO À VERSÃO ANTERIOR (v1.0.0):
 * ----------------------------------------------------------------------------
 * - Veículos do motorista comum agora vêm de `useVeiculos` (paginado, reativo).
 * - Dias disponíveis agora vêm de `useDisponibilidade`; o cálculo de datas
 *   válidas passou a rodar num `useEffect` que observa `disponibilidades`.
 * - Bloqueios/horários agora vêm de `useReservas` (bloqueios); como
 *   `buscarBloqueios()` não aceita parâmetros por chamada, os parâmetros
 *   (data/tipoVeiculo) são memoizados e um `useEffect` dispara a busca
 *   quando eles mudam. `fetchHorariosDisponiveis` deixou de retornar a
 *   lista de horários (agora é `Promise<void>`), pois o cálculo passou a
 *   ser reativo (efeito sobre `bloqueios`).
 * - Confirmação agora usa `criar` de `useReservaMutation` (payload tipado)
 *   em vez de `FormData` + endpoints `confirmarReserva`/`confirmarReservaAgente`.
 * - Veículos vinculados a um motorista de empresa continuam manuais, pois
 *   não há um hook novo equivalente para esse endpoint.
 *
 * ⚠️ Os nomes de campos usados em `DisponibilidadesParam`, `ReservaParams`
 * (bloqueios) e nos payloads de criação foram inferidos do código anterior.
 * Confira-os contra as interfaces reais do seu projeto.
 */

type Persona = 'Motorista' | 'Agente';

const INTERVALO_AGENTE = 15;
const INTERVALO_MOTORISTA = 30;
const VEHICLE_PAGE_SIZE = 5;

export function useReserva(selectedVaga: VagaResponse | null) {
  const { user } = useAuth();
  const isAgente = user?.permissao === 'AGENTE';
  const isEmpresa = user?.permissao === 'EMPRESA';
  const motoristaId = user?.id;

  const {
    criar,
    loading: confirmando,
    error: erroConfirmar,
  } = useReservaMutation();

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

  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [vehiclePage, setVehiclePage] = useState(0);
  const [horariosCarregados, setHorariosCarregados] = useState(false);
  const reservedTimesEndBaseRef = useRef<string[]>([]);

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

  // ==================== VEÍCULOS DO MOTORISTA COMUM ====================
  const veiculoParams = useMemo(
    () => ({
      ativo: true,
      pagina: vehiclePage,
      tamanhoPagina: VEHICLE_PAGE_SIZE,
    }),
    [vehiclePage],
  );

  const {
    veiculos: veiculosMotorista,
    loading: loadingVeiculosMotorista,
    totalPaginas: totalPaginasVeiculosMotorista,
  } = useVeiculos({
    usuarioId: !isAgente && !isEmpresa ? user?.id : undefined,
    params: veiculoParams,
    buscarAutomaticamente: !isAgente && !isEmpresa,
  });

  // ==================== VEÍCULOS VINCULADOS A MOTORISTA (EMPRESA) ====================
  // Sem hook novo equivalente para este endpoint; mantido manual.
  const [veiculosEmpresa, setVeiculosEmpresa] = useState<VeiculoResponse[]>([]);
  const [vehicleTotalPagesEmpresa, setVehicleTotalPagesEmpresa] = useState(0);
  const [vehiclesLoadingEmpresa, setVehiclesLoadingEmpresa] = useState(false);
  const [motoristaSelecionadoId, setMotoristaSelecionadoId] = useState<
    string | null
  >(null);

  const fetchVeiculosMotorista = useCallback(
    async (motoristaAlvoId: string, pagina?: number) => {
      if (!user?.id || !motoristaAlvoId) return;

      setVehiclesLoadingEmpresa(true);

      try {
        const paginaAtual = pagina ?? vehiclePage;

        const r = await getVeiculosVinculadosMotoristaEmpresa(
          user.id,
          motoristaAlvoId,
          {
            ativo: true,
            pagina: paginaAtual,
            tamanhoPagina: VEHICLE_PAGE_SIZE,
          },
        );

        setVeiculosEmpresa(r.content);
        setVehicleTotalPagesEmpresa(r.totalPaginas);
        setMotoristaSelecionadoId(motoristaAlvoId);
      } catch (err) {
        console.error('Erro ao carregar veículos do motorista:', err);
        setVeiculosEmpresa([]);
        setVehicleTotalPagesEmpresa(0);
      } finally {
        setVehiclesLoadingEmpresa(false);
      }
    },
    [user?.id, vehiclePage],
  );

  useEffect(() => {
    if (!isEmpresa || !motoristaSelecionadoId) return;
    fetchVeiculosMotorista(motoristaSelecionadoId, vehiclePage);
  }, [isEmpresa, motoristaSelecionadoId, vehiclePage, fetchVeiculosMotorista]);

  // ==================== VEÍCULOS UNIFICADOS ====================
  const vehicles = isEmpresa ? veiculosEmpresa : veiculosMotorista;
  const vehiclesLoading = isEmpresa
    ? vehiclesLoadingEmpresa
    : loadingVeiculosMotorista;
  const vehicleTotalPages = isEmpresa
    ? vehicleTotalPagesEmpresa
    : totalPaginasVeiculosMotorista;
  const loadingMotorista = vehiclesLoading;

  // ==================== DIAS DISPONÍVEIS ====================
  const {
    disponibilidades,
    loading: loadingDias,
    buscar: buscarDisponibilidades,
  } = useDisponibilidade({ buscarAutomaticamente: false });

  const fetchDiasDisponiveis = useCallback(
    async (mesReferencia: Date) => {
      if (!selectedVaga) return;

      const diasPermitidos: DiaSemana[] =
        selectedVaga.operacoesVaga?.map((op) => op.diaSemanaAsEnum) ?? [];

      if (diasPermitidos.length === 0) {
        setAvailableDates([]);
        return;
      }

      const mes = mesReferencia.getMonth() + 1;
      const ano = mesReferencia.getFullYear();

      await buscarDisponibilidades({
        vagaId: selectedVaga.id,
        mes,
        ano,
      } as DisponibilidadesParam);
    },
    [selectedVaga, buscarDisponibilidades],
  );

  // Recalcula availableDates sempre que a disponibilidade retornada mudar
  useEffect(() => {
    if (!selectedVaga) return;

    if (!disponibilidades || disponibilidades.length === 0) {
      setAvailableDates([]);
      return;
    }

    const diasPermitidos: DiaSemana[] =
      selectedVaga.operacoesVaga?.map((op) => op.diaSemanaAsEnum) ?? [];

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

            const [hFim, mFim] = operacaoHoje.horaFim.split(':').map(Number);

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
  }, [disponibilidades, selectedVaga]);

  // ==================== HORÁRIOS / BLOQUEIOS ====================
  const tipoVeiculoSelecionado = isAgente
    ? reservaState.tipoVeiculoAgente
    : vehicles.find((v) => v.id === reservaState.selectedVehicleId)?.tipo;

  const dataSelecionadaFormatada = reservaState.selectedDay
    ? reservaState.selectedDay.toISOString().split('T')[0]
    : undefined;

  const bloqueiosParams = useMemo(() => {
    if (!dataSelecionadaFormatada || !tipoVeiculoSelecionado) return undefined;
    return {
      data: dataSelecionadaFormatada,
      tipoVeiculo: tipoVeiculoSelecionado,
    } as ReservaParams;
  }, [dataSelecionadaFormatada, tipoVeiculoSelecionado]);

  const {
    bloqueios,
    loading: loadingHorarios,
    buscarBloqueios,
  } = useReservas<ReservaResponse>({
    vagaId: selectedVaga?.id,
    params: bloqueiosParams,
    buscarAutomaticamente: false,
  });

  // Dispara a busca de bloqueios quando dia/veículo (tipo) mudam
  useEffect(() => {
    if (!selectedVaga || !bloqueiosParams) return;
    buscarBloqueios();
  }, [selectedVaga, bloqueiosParams, buscarBloqueios]);

  // Recalcula os horários disponíveis a partir dos bloqueios retornados
  useEffect(() => {
    if (!selectedVaga || !reservaState.selectedDay || !tipoVeiculoSelecionado) {
      return;
    }

    const operacao = getOperacaoDia(reservaState.selectedDay, selectedVaga);

    if (!operacao) {
      setReservaState((prev) => ({
        ...prev,
        availableTimes: [],
        reservedTimesStart: [],
      }));
      setHorariosCarregados(true);
      return;
    }

    const intervalo = isAgente ? INTERVALO_AGENTE : INTERVALO_MOTORISTA;

    const horariosOcupadosInicio = gerarHorariosOcupadosInicio(
      bloqueios,
      intervalo,
    );
    const horariosOcupadosFim = gerarHorariosOcupadosFim(bloqueios, intervalo);
    const todosHorarios = gerarHorariosDia(operacao, intervalo);
    const horariosFiltradosHoje = removerHorariosPassadosDeHoje(
      reservaState.selectedDay,
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

    setHorariosCarregados(true);
  }, [
    bloqueios,
    selectedVaga,
    reservaState.selectedDay,
    tipoVeiculoSelecionado,
    isAgente,
  ]);

  /**
   * Mantido por compatibilidade com chamadores antigos. Agora apenas
   * garante que dia/veículo estejam selecionados; o cálculo dos horários
   * acontece de forma reativa (efeitos acima), por isso o retorno é void.
   */
  const fetchHorariosDisponiveis = useCallback(
    async (
      day: Date,
      _vaga: VagaResponse,
      vehicleId?: string,
    ): Promise<void> => {
      setReservaState((prev) => ({
        ...prev,
        selectedDay: day,
        ...(vehicleId ? { selectedVehicleId: vehicleId } : {}),
      }));
    },
    [],
  );

  // ==================== CÁLCULO DE HORÁRIOS FINAIS (limite por área) ====================
  const calcularReservedTimesEnd = useCallback(
    (start: string, vaga: VagaResponse) => {
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
  const setTipoVeiculoAgente = (tipo: VeiculoResponse['tipo']) =>
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

      const inicio = formatDateTime(selectedDay, startHour);
      const fim = formatDateTime(selectedDay, endHour);

      const persona: Persona = isAgente ? 'Agente' : 'Motorista';

      if (isAgente) {
        if (!tipoVeiculoAgente || !placaAgente) {
          return {
            success: false,
            message: 'Informe o tipo do veículo e a placa.',
          };
        }

        const payload = {
          vagaId: selectedVaga.id,
          inicio,
          fim,
          cidadeOrigem: extra?.cidadeOrigem,
          entradaCidade: extra?.entradaCidade,
          tipoVeiculo: tipoVeiculoAgente,
          placa: placaAgente,
        } as CriarReservaRapidaPayload;

        const resultado = await criar(persona, user.id, payload);

        if (!resultado) {
          return {
            success: false,
            message: erroConfirmar ?? 'Não foi possível confirmar a reserva.',
          };
        }

        return { success: true, message: 'Reserva confirmada com sucesso!' };
      }

      if (!selectedVehicleId) {
        return { success: false, message: 'Veículo não selecionado.' };
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

      const payload = {
        vagaId: selectedVaga.id,
        inicio,
        fim,
        cidadeOrigem: origin || undefined,
        entradaCidade: entryCity || undefined,
        motoristaId: motoristaReserva,
        veiculoId: selectedVehicleId,
      } as CriarReservaPayload;

      const resultado = await criar(persona, motoristaReserva, payload);

      if (!resultado) {
        return {
          success: false,
          message: erroConfirmar ?? 'Não foi possível confirmar a reserva.',
        };
      }

      return { success: true, message: 'Reserva confirmada com sucesso!' };
    },
    [
      user,
      selectedVaga,
      motoristaId,
      reservaState,
      isAgente,
      criar,
      erroConfirmar,
    ],
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
    vehiclePageSize: VEHICLE_PAGE_SIZE,
    setVehiclePage,

    loadingMotorista,
    loadingHorarios,
    horariosCarregados,
    confirmando,

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
