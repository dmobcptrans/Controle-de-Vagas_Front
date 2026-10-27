import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import type { VeiculoResponse } from '@/features/veiculos/types/veiculo';
import type { ReservaParams } from '@/features/reserva/reservas/types/reservas';
import { getReservasBloqueios } from '@/features/reserva/reservas/services/reservaApi';
import { useReserva } from '@/features/reserva/reservar-vaga/hooks/useReserva';
import { toDateKey, toHHmm } from '@/features/reserva/reservar-vaga/hooks/reservaHelpers';
import type { ReservaForm } from '@/features/reserva/reservar-vaga/hooks/reservaPayload';
import { useReservaAgenteState } from './useReservaAgenteState';
import { analisarAgora, type Bloqueio, type StatusAgora } from './useReservaRapidaHelpers';

type CampoPersistido = 'tipoVeiculo' | 'placa' | 'cidadeOrigem' | 'entradaCidade';

/** Busca pontual (dentro de handlers); o fluxo reativo de horários vive no useReserva. */
const buscarBloqueios = async (
  vagaId: string,
  data: string,
  tipoVeiculo: VeiculoResponse['tipo'],
): Promise<Bloqueio[]> => {
  const response = await getReservasBloqueios(vagaId, { data, tipoVeiculo } as ReservaParams);
  return (response ?? []) as unknown as Bloqueio[];
};

const mensagemDe = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

/**
 * Reserva rápida (AGENTE) = useReserva + persistência dos defaults + checagem "agora".
 * A fonte da verdade do formulário é o `form` do useReserva; o storage só espelha.
 */
export function useReservaRapida(vaga: VagaResponse) {
  const base = useReserva(vaga);
  const { form, setField, reset } = base;
  const { defaults, hydrated, updateField, clearDefaults } = useReservaAgenteState();

  // hidrata o form UMA vez com o que estava salvo
  const hidratou = useRef(false);
  useEffect(() => {
    if (!hydrated || hidratou.current) return;
    hidratou.current = true;
    setField('tipoVeiculo', defaults.tipoVeiculo ?? undefined);
    setField('placa', defaults.placa ?? '');
    setField('cidadeOrigem', defaults.cidadeOrigem ?? '');
    setField('entradaCidade', defaults.entradaCidade ?? '');
  }, [hydrated, defaults, setField]);

  // grava no form E no storage
  const setPersistido = useCallback(
    <K extends CampoPersistido>(campo: K, valor: ReservaForm[K]) => {
      setField(campo, valor);
      updateField(campo, valor as never);
    },
    [setField, updateField],
  );

  const [vagaIncompativel, setVagaIncompativel] = useState(false);
  const [validandoVeiculo, setValidandoVeiculo] = useState(false);
  const [status, setStatus] = useState<StatusAgora | null>(null);

  /** Escolher o tipo já valida se ele opera na vaga (a API erra se for incompatível). */
  const selecionarTipoVeiculo = useCallback(
    async (tipo: VeiculoResponse['tipo']) => {
      setPersistido('tipoVeiculo', tipo);
      setVagaIncompativel(false);
      if (!tipo) return;

      setValidandoVeiculo(true);
      try {
        await buscarBloqueios(vaga.id, toDateKey(new Date()), tipo);
      } catch (err) {
        toast.error(mensagemDe(err, 'Veículo incompatível com esta vaga.'));
        setVagaIncompativel(true);
      } finally {
        setValidandoVeiculo(false);
      }
    },
    [vaga.id, setPersistido],
  );

  /** Fixa "hoje/agora" no form e calcula o status da vaga. Retorna true se pode avançar. */
  const verificarAgora = useCallback(async (): Promise<boolean> => {
    if (!form.tipoVeiculo) return false;
    const agora = new Date();
    try {
      const bloqueios = await buscarBloqueios(vaga.id, toDateKey(agora), form.tipoVeiculo);
      setField('day', agora);
      setField('startHour', toHHmm(agora));
      setStatus(analisarAgora(bloqueios, vaga, agora));
      return true;
    } catch (err) {
      toast.error(mensagemDe(err, 'Não foi possível verificar a vaga.'));
      return false;
    }
  }, [form.tipoVeiculo, vaga, setField]);

  const novaReserva = useCallback(() => {
    clearDefaults();
    reset();
    setStatus(null);
  }, [clearDefaults, reset]);

  return {
    ...base, // form, setField, availableTimes, reservedTimesEnd, confirmar, confirmando...
    hydrated,
    status,

    // campos persistidos
    mostrarDadosRota: defaults.mostrarDadosRota,
    toggleDadosRota: () => updateField('mostrarDadosRota', !defaults.mostrarDadosRota),
    setPlaca: (v: string) => setPersistido('placa', v),
    setCidadeOrigem: (v: string) => setPersistido('cidadeOrigem', v),
    setEntradaCidade: (v: string) => setPersistido('entradaCidade', v),

    // ações
    selecionarTipoVeiculo,
    vagaIncompativel,
    validandoVeiculo,
    verificarAgora,
    novaReserva,
  };
}