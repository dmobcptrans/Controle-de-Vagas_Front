'use client';

import { deleteAgente } from '@/services/api/agenteApi';
import { reativarUsuario } from '@/services/api/recuperacaoApi';
import { Agente } from '@/lib/types/personas/agente';
import { cn } from '@/lib/utils';
import {
  IdCard,
  Mail,
  Phone,
  UserCircle,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ModalConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';

interface AgenteCardProps {
  agente: Agente;
  onStatusChange?: () => void;
}

/**
 * @component AgenteCard
 * @version 2.0.0
 *
 * @description Card de exibição de agente para gestores.
 * Exibe informações resumidas do agente e permite exclusão/ativação.
 *
 * ----------------------------------------------------------------------------
 * 📋 ALTERAÇÕES V2.0.0:
 * ----------------------------------------------------------------------------
 *
 * 1. NOVA FUNCIONALIDADE: Ativar/Desativar agente
 *    - Quando agente está ATIVO: botão "Excluir" (vermelho)
 *    - Quando agente está INATIVO: botão "Ativar" (verde)
 *    - Modal de confirmação para ambas as ações
 *
 * 2. MELHORIAS:
 *    - Badge de status (Ativo/Inativo) com cores diferentes
 *    - Callback opcional para atualizar lista sem recarregar página
 *    - Feedback visual do status atual
 *
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 *
 * 1. HEADER:
 *    - Ícone UserCircle (verde)
 *    - Nome do agente
 *    - Email
 *    - Badge "Agente" + Badge de status (Ativo/Inativo)
 *
 * 2. INFORMAÇÕES:
 *    - Telefone (com ícone Phone)
 *    - Matrícula (com ícone IdCard)
 *
 * 3. AÇÕES:
 *    - Botão dinâmico: "Excluir" (ativo) ou "Ativar" (inativo)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - CALLBACK onStatusChange: Permite atualizar a lista pai sem recarregar a página
 * - MODAIS SEPARADOS: Confirmação específica para cada ação
 * - STATUS VISUAL: Badge colorida para identificar rapidamente o estado do agente
 * - FEEDBACK: Toast de erro/sucesso para cada operação
 *
 * @example
 * ```tsx
 * <AgenteCard
 *   agente={agente}
 *   onStatusChange={() => fetchAgentes()}
 * />
 * ```
 */

export default function AgenteCard({
  agente,
  onStatusChange,
}: AgenteCardProps) {
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalAtivarAberto, setModalAtivarAberto] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Determina se o agente está ativo
  const isAtivo = agente.usuario.ativo === true;

  /**
   * @function handleExcluir
   * @description Processa a exclusão (desativação) do agente
   *
   * Fluxo:
   * 1. Chama API deleteAgente com ID do usuário
   * 2. Se sucesso: fecha modal e atualiza lista via callback
   * 3. Se erro: exibe toast de erro
   */
  const handleExcluir = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const result = await deleteAgente(agente.usuario.id);

      if (result.error) {
        throw new Error(result.message);
      }

      setModalExcluirAberto(false);
      toast.success('Agente desativado com sucesso!');

      if (onStatusChange) {
        await onStatusChange();
      }
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : 'Erro ao desativar agente. Tente novamente.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * @function handleAtivar
   * @description Processa a ativação do agente usando a API reativarUsuario
   *
   * Fluxo:
   * 1. Chama API reativarUsuario com ID do usuário
   * 2. Se sucesso: fecha modal e atualiza lista via callback
   * 3. Se erro: exibe toast de erro
   */
  const handleAtivar = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      await reativarUsuario(agente.usuario.id);

      setModalAtivarAberto(false);
      toast.success('Agente ativado com sucesso!');

      if (onStatusChange) {
        await onStatusChange();
      }
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : 'Erro ao ativar agente. Tente novamente.',
      );
    } finally {
      setIsUpdating(false);
    }
  };
 return (
  <>
    <article
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all',
        !isAtivo && 'bg-gray-50/50',
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <UserCircle
            className={cn(
              'h-10 w-10 shrink-0',
              isAtivo ? 'text-green-500' : 'text-gray-400',
            )}
          />

          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate leading-none">
              {agente.usuario.nome.split(' ')[0]}{' '}
              {agente.usuario.nome.split(' ').at(-1)}
            </h3>

            <div className="flex items-center gap-1 mt-1">
              <Mail className="h-3 w-3 text-gray-400 shrink-0" />

              <span className="text-xs text-gray-500 truncate">
                {agente.usuario.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">

          <span
            className={cn(
              'text-[11px] font-medium px-2 py-1 rounded-full',
              isAtivo
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600',
            )}
          >
            {isAtivo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      {/* Informações */}
      <div className="px-4 py-3 border-y border-gray-100">
        <div className="grid grid-cols-2 gap-3">

          {/* Telefone */}
          <div className="flex items-start gap-2 min-w-0">
            <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-gray-500">
                Telefone
              </p>

              <p
                className={cn(
                  'text-sm font-medium truncate',
                  isAtivo ? 'text-gray-800' : 'text-gray-500',
                )}
              >
                {agente.usuario.telefone || 'Não informado'}
              </p>
            </div>
          </div>


          {/* Matrícula */}
          <div className="flex items-start gap-2 min-w-0">
            <IdCard className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-gray-500">
                Matrícula
              </p>

              <p
                className={cn(
                  'text-sm font-medium truncate',
                  isAtivo ? 'text-gray-800' : 'text-gray-500',
                )}
              >
                {agente.matricula}
              </p>
            </div>
          </div>

        </div>
      </div>


      {/* Ações */}
      <div className="p-3">
        {isAtivo ? (
          <button
            onClick={() => setModalExcluirAberto(true)}
            disabled={isUpdating}
            className={cn(
              'w-full h-9 rounded-lg bg-red-600 hover:bg-red-700',
              'text-white text-sm font-medium',
              'flex items-center justify-center gap-2',
              isUpdating && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Trash2 className="h-4 w-4" />

            {isUpdating ? 'Processando...' : 'Desativar'}
          </button>
        ) : (
          <button
            onClick={() => setModalAtivarAberto(true)}
            disabled={isUpdating}
            className={cn(
              'w-full h-9 rounded-lg bg-green-600 hover:bg-green-700',
              'text-white text-sm font-medium',
              'flex items-center justify-center gap-2',
              isUpdating && 'opacity-50 cursor-not-allowed',
            )}
          >
            <UserCheck className="h-4 w-4" />

            {isUpdating ? 'Processando...' : 'Reativar'}
          </button>
        )}
      </div>
    </article>


    {/* Modal desativação */}
    <ModalConfirmacaoExclusao
      isOpen={modalExcluirAberto}
      onClose={() => setModalExcluirAberto(false)}
      onConfirm={handleExcluir}
      titulo="Confirmar desativação"
      mensagem="Quer mesmo desativar este agente?"
      tipo="exclusao"
    />


    {/* Modal ativação */}
    <ModalConfirmacaoExclusao
      isOpen={modalAtivarAberto}
      onClose={() => setModalAtivarAberto(false)}
      onConfirm={handleAtivar}
      titulo="Confirmar ativação"
      mensagem="Quer mesmo ativar este agente?"
      textoConfirmar="Reativar"
      tipo="ativacao"
    />
  </>
);
}
