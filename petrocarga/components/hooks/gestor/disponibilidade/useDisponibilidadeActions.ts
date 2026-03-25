import {
  removeDisponibilidade,
  postDisponibilidade,
  updateDisponibilidade,
} from '@/components/services/gestor/disponibilidade/disponibilidadeService';

import toast from 'react-hot-toast';
import { Disponibilidade } from '@/lib/types/disponibilidadeVagas';
import { Vaga } from '@/lib/types/vaga';

interface UseDisponibilidadeActionsProps {
  vagasPorLogradouro: Record<string, Vaga[]>;
  disponibilidadesAgrupadas: Record<string, Record<string, Disponibilidade[]>>;
  setDisponibilidades: React.Dispatch<React.SetStateAction<Disponibilidade[]>>;
}

export interface SalvarDisponibilidadeData {
  inicio: string;
  fim: string;
  modo: 'logradouro' | 'personalizado';
  selecionados: string[];
}

/**
 * @hook useDisponibilidadeActions
 * @version 1.0.0
 * 
 * @description Hook customizado para ações de CRUD de disponibilidades de vagas.
 * Fornece funções para criar, editar, remover e excluir disponibilidades.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {function} salvar - Cria nova disponibilidade
 * @property {function} excluirLogradouro - Remove todas disponibilidades de um logradouro
 * @property {function} editarIntervalo - Edita horário de uma disponibilidade
 * @property {function} removerVagaDisponibilidade - Remove disponibilidade de uma vaga específica
 * @property {function} excluirIntervalo - Remove todas disponibilidades de um intervalo
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO DAS AÇÕES:
 * ----------------------------------------------------------------------------
 * 
 * 1. SALVAR:
 *    - Valida datas (início e fim não vazios, fim >= início)
 *    - Determina IDs das vagas conforme modo (logradouro ou personalizado)
 *    - Chama postDisponibilidade na API
 *    - Atualiza estado local (otimista)
 * 
 * 2. EXCLUIR LOGRADOURO:
 *    - Confirma com confirm() nativo
 *    - Busca todos IDs das disponibilidades do logradouro
 *    - Remove do estado local (otimista)
 *    - Chama removeDisponibilidade para cada ID
 * 
 * 3. EDITAR INTERVALO:
 *    - Valida datas
 *    - Atualiza estado local (otimista)
 *    - Chama updateDisponibilidade na API
 * 
 * 4. REMOVER VAGA:
 *    - Remove do estado local (otimista)
 *    - Chama removeDisponibilidade na API
 * 
 * 5. EXCLUIR INTERVALO:
 *    - Busca todos IDs do intervalo no logradouro
 *    - Remove do estado local (otimista)
 *    - Chama removeDisponibilidade para cada ID
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - ATUALIZAÇÃO OTIMISTA: UI atualizada antes da resposta da API
 * - MODOS DE CRIAÇÃO: 'logradouro' (todas vagas do logradouro) ou 'personalizado' (vagas específicas)
 * - FEEDBACK: toasts para erros e validação
 * - PROMISES PARALELAS: Promise.all para exclusões múltiplas
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - postDisponibilidade, updateDisponibilidade, removeDisponibilidade: Services de API
 * - Disponibilidade: Tipo de disponibilidade
 * 
 * @example
 * ```tsx
 * const { salvar, excluirLogradouro, editarIntervalo } = useDisponibilidadeActions({
 *   vagasPorLogradouro,
 *   disponibilidadesAgrupadas,
 *   setDisponibilidades
 * });
 * 
 * // Salvar nova disponibilidade
 * await salvar({
 *   inicio: '2024-01-01T08:00:00',
 *   fim: '2024-01-01T18:00:00',
 *   modo: 'logradouro',
 *   selecionados: ['Rua do Imperador']
 * });
 * 
 * // Excluir logradouro
 * await excluirLogradouro('Rua do Imperador');
 * 
 * // Editar intervalo
 * await editarIntervalo('disp123', 'vaga456', '2024-01-01T09:00:00', '2024-01-01T17:00:00');
 * ```
 */

export function useDisponibilidadeActions({
  vagasPorLogradouro,
  disponibilidadesAgrupadas,
  setDisponibilidades,
}: UseDisponibilidadeActionsProps) {

  // ==================== SALVAR NOVA DISPONIBILIDADE ====================
  async function salvar({
    inicio,
    fim,
    modo,
    selecionados,
  }: SalvarDisponibilidadeData) {
    if (!inicio || !fim) {
      toast('Preencha início e fim.', { icon: '⚠️' });
      return;
    }

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (dataFim < dataInicio) {
      toast.error('A data de fim não pode ser menor que a data de início.');
      return;
    }

    try {
      let vagaIds: string[] = [];

      const idsConvertidos = selecionados.flatMap((item) => {
        if (vagasPorLogradouro[item]) {
          return vagasPorLogradouro[item].map((v) => v.id);
        }

        return item;
      });

      vagaIds = Array.from(new Set(idsConvertidos)).filter(
        (id) =>
          typeof id === 'string' &&
          id.includes('-') &&
          id.length > 30
      );

      if (vagaIds.length === 0) {
        toast.error('Selecione ao menos uma vaga válida.');
        return;
      }

      const novas = await postDisponibilidade(vagaIds, inicio, fim);

      setDisponibilidades((prev) => [
        ...prev,
        ...(Array.isArray(novas) ? novas : [novas]),
      ]);
    } catch (err) {
      let mensagem = 'Erro desconhecido';

      if (err instanceof Error) {
        try {
          const json = JSON.parse(err.message);
          mensagem = json.erro || mensagem;
        } catch {
          mensagem = err.message;
        }
      }

      toast.error(`Erro ao salvar disponibilidade: ${mensagem}`);
    }
  }

  // ==================== EXCLUIR LOGRADOURO INTEIRO ====================
  async function excluirLogradouro(log: string) {
    if (!confirm(`Excluir todas as disponibilidades de "${log}"?`)) return;

    const grupos = disponibilidadesAgrupadas[log];
    if (!grupos) return;

    const ids = Object.values(grupos)
      .flat()
      .map((d) => d.id);

    // Atualização otimista
    setDisponibilidades((prev) => prev.filter((d) => !ids.includes(d.id)));

    await Promise.all(ids.map((id) => removeDisponibilidade(id)));
  }

  // ==================== EDITAR INTERVALO DE VAGA ESPECÍFICA ====================
  async function editarIntervalo(
    id: string,
    vagaId: string,
    inicio: string,
    fim: string,
  ) {
    if (!inicio || !fim) {
      toast('Preencha início e fim.', { icon: '⚠️' });
      return;
    }

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (dataFim < dataInicio) {
      toast.error('A data de fim não pode ser menor que a data de início.');
      return;
    }

    // Atualização otimista
    setDisponibilidades((prev) =>
      prev.map((d) => (d.id === id ? { ...d, inicio, fim } : d)),
    );

    await updateDisponibilidade(id, vagaId, inicio, fim);
  }

  // ==================== REMOVER VAGA ESPECÍFICA ====================
  async function removerVagaDisponibilidade(id: string) {
    // Atualização otimista
    setDisponibilidades((prev) => prev.filter((d) => d.id !== id));
    await removeDisponibilidade(id);
  }

  // ==================== EXCLUIR INTERVALO INTEIRO ====================
  async function excluirIntervalo(log: string, intervalo: string) {
    const lista = disponibilidadesAgrupadas[log]?.[intervalo] ?? [];
    const ids = lista.map((d) => d.id);

    // Atualização otimista
    setDisponibilidades((prev) => prev.filter((d) => !ids.includes(d.id)));
    await Promise.all(ids.map((id) => removeDisponibilidade(id)));
  }

  return {
    salvar,
    excluirLogradouro,
    editarIntervalo,
    removerVagaDisponibilidade,
    excluirIntervalo,
  };
}