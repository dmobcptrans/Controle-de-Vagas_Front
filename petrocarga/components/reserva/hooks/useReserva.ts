import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/hooksGerais/useAuth';
import { DIAS_SEMANA } from './reservaHelpers';
import { Veiculo } from '@/lib/types/veiculo';
import { Reserva } from '@/lib/types/reserva';
import { DiaSemana, Vaga } from '@/lib/types/vaga';
import { ReservaState } from '@/lib/types/reservaState';
import { ConfirmResult } from '@/lib/types/confirmResult';

import { getMotoristaByUserId } from '@/lib/api/motoristaApi';
import { getVeiculosUsuario } from '@/lib/api/veiculoApi';

import {
  gerarHorariosDia,
  gerarHorariosOcupados,
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

// ================= HOOK PRINCIPAL =================

export function useReserva(selectedVaga: Vaga | null) {
  const { user } = useAuth();
  const isAgente = user?.permissao === 'AGENTE';

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

  const [motoristaId, setMotoristaId] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);
  const [loadingMotorista, setLoadingMotorista] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [horariosCarregados, setHorariosCarregados] = useState(false);

  // ================= RESET =================
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

  // ====================================================
  //  BUSCA DIAS DISPONÍVEIS
  // ====================================================

  const fetchDiasDisponiveis = useCallback(async () => {
    if (!selectedVaga) return;

    const diasPermitidos: DiaSemana[] =
      selectedVaga.operacoesVaga?.map((op) => op.diaSemanaAsEnum) ?? [];

    if (diasPermitidos.length === 0) {
      setAvailableDates([]);
      return;
    }

    const disponibilidades = await fetchDisponibilidadeByVagaId(
      selectedVaga.id,
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

            const agora = new Date();

            const [hFim, mFim, sFim] = operacaoHoje.horaFim
              .split(':')
              .map(Number);

            const dataHoraFim = new Date();
            dataHoraFim.setHours(hFim, mFim, sFim ?? 0, 0);

            if (agora >= dataHoraFim) {
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
  }, [selectedVaga]);

  useEffect(() => {
    if (!selectedVaga) return;
    fetchDiasDisponiveis();
  }, [selectedVaga?.id, fetchDiasDisponiveis]);

  // ====================================================
  //  BUSCA HORÁRIOS DISPONÍVEIS
  // ====================================================

  const fetchHorariosDisponiveis = useCallback(
    async (day: Date, vaga: Vaga, vehicleId?: string): Promise<string[]> => {
      setLoadingHorarios(true);
      setHorariosCarregados(false);

      try {
        const operacao = getOperacaoDia(day, vaga);
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

        const horariosOcupadosReais = bloqueios.flatMap((reserva: Reserva) =>
          gerarHorariosOcupados(reserva),
        );

        const todosHorarios = gerarHorariosDia(operacao);

        const horariosFiltradosHoje = removerHorariosPassadosDeHoje(
          day,
          todosHorarios,
        );

        setReservaState((prev) => ({
          ...prev,
          availableTimes: horariosFiltradosHoje,
          reservedTimesStart: horariosOcupadosReais,
          reservedTimesEnd: [],
        }));

        return horariosFiltradosHoje;
      } finally {
        setLoadingHorarios(false);
        setHorariosCarregados(true);
      }
    },
    [vehicles, reservaState.tipoVeiculoAgente, isAgente],
  );

  // ====================================================
  //  CALCULA HORÁRIOS BLOQUEADOS PARA O HORÁRIO FINAL (STEP 4)
  // ====================================================

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

      const ocupados = [...reservaState.reservedTimesStart];

      const horariosBloqueados = horariosPossiveis.filter((h) => {
        const d = new Date(
          `${reservaState.selectedDay!.toISOString().split('T')[0]}T${h}:00`,
        );

        if (d > fimMax) return true;

        if (ocupados.includes(h)) return true;

        return false;
      });

      return horariosBloqueados;
    },
    [reservaState],
  );

  // Quando selecionar horário inicial → recalcula bloqueios do horário final
  useEffect(() => {
    if (!reservaState.startHour || !selectedVaga) return;

    const bloqueados = calcularReservedTimesEnd(
      reservaState.startHour,
      selectedVaga,
    );

    setReservaState((prev) => {
      if (
        JSON.stringify(prev.reservedTimesEnd) === JSON.stringify(bloqueados)
      ) {
        return prev;
      }

      return {
        ...prev,
        reservedTimesEnd: bloqueados,
      };
    });
  }, [reservaState.startHour, selectedVaga?.id]);

  // ====================================================
  //  3) CARREGA MOTORISTA E VEÍCULOS
  // ====================================================

  useEffect(() => {
    if (!user?.id || isAgente) return;

    const fetchMotorista = async () => {
      try {
        const result = await getMotoristaByUserId(user.id);
        if (!result.error) {
          setMotoristaId(result.motoristaId);
        }
      } finally {
        setLoadingMotorista(false);
      }
    };

    fetchMotorista();
  }, [user, isAgente]);

  useEffect(() => {
    if (!user?.id || isAgente) return;

    const loadVehicles = async () => {
      try {
        const r = await getVeiculosUsuario(user.id);
        if (!r.error) setVehicles(r.veiculos);
      } catch {}
    };

    loadVehicles();
  }, [user, isAgente]);

  // ====================================================
  //  4) TRIGGER AUTOMÁTICO QUANDO MUDAR DIA/VAGA/TIPO/VEÍCULO
  // ====================================================

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

  // ====================================================
  //  SETTERS
  // ====================================================

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

  // ====================================================
  //  CONFIRMAR RESERVA
  // ====================================================

  const handleConfirm = useCallback(async (): Promise<ConfirmResult> => {
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
      if (!motoristaId || !selectedVehicleId || !origin) {
        return { success: false, message: 'Dados do motorista incompletos.' };
      }
      formData.append('motoristaId', motoristaId);
      formData.append('veiculoId', selectedVehicleId);
      formData.append('cidadeOrigem', origin);

      if (entryCity) {
        formData.append('entradaCidade', entryCity);
      }
    }

    formData.append('inicio', formatDateTime(selectedDay, startHour));
    formData.append('fim', formatDateTime(selectedDay, endHour));

    const result = isAgente
      ? await confirmarReservaAgente(formData)
      : await confirmarReserva(formData);

    if (!result.success) {
      return {
        success: false,
        message: result.message ?? 'Não foi possível confirmar a reserva.',
      };
    }

    reset();

    return {
      success: true,
      message: 'Reserva confirmada com sucesso!',
    };
  }, [user, selectedVaga, motoristaId, reservaState, isAgente, reset]);

  // ====================================================
  //  RETORNO DO HOOK
  // ====================================================

  return {
    ...reservaState,

    isAgente,
    vehicles,
    loadingMotorista,
    loadingHorarios,
    horariosCarregados,
    fetchDiasDisponiveis,
    availableDates,
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
