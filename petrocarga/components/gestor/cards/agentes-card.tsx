'use client';

import { deleteAgente } from '@/lib/api/agenteApi';
import { reativarUsuario } from '@/lib/api/recuperacaoApi';
import { Agente } from '@/lib/types/agente';
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
      await deleteAgente(agente.usuario.id);
      setModalExcluirAberto(false);
      toast.success('Agente desativado com sucesso!');

      // Atualiza a lista se o callback foi fornecido
      if (onStatusChange) {
        onStatusChange();
      } else {
        // Fallback: recarrega a página se não houver callback
        window.location.reload();
      }
    } catch (err) {
      toast.error('Erro ao desativar agente. Tente novamente.');
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
      // CORREÇÃO: Usando a API correta reativarUsuario

      console.log('agente completo:', agente);
      console.log('agente.usuario:', agente.usuario);
      console.log('ID do usuário:', agente.usuario?.id);
      await reativarUsuario(agente.usuario.id);
      setModalAtivarAberto(false);
      toast.success('Agente ativado com sucesso!');

      // Atualiza a lista se o callback foi fornecido
      if (onStatusChange) {
        onStatusChange();
      } else {
        // Fallback: recarrega a página se não houver callback
        window.location.reload();
      }
    } catch (err) {
      toast.error('Erro ao ativar agente. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <article
        className={cn(
          'bg-white rounded-xl shadow-sm border overflow-hidden',
          isAtivo
            ? 'border-gray-200 hover:shadow-md'
            : 'border-gray-200 bg-gray-50/30 hover:shadow-md',
          'transition-shadow',
        )}
      >
        {/* ==================== HEADER ==================== */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Ícone do agente com cor dinâmica baseada no status */}
              <UserCircle
                className={cn(
                  'w-9 h-9 flex-shrink-0',
                  isAtivo ? 'text-green-500' : 'text-gray-400',
                )}
              />

              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {agente.usuario.nome.split(' ')[0]}{' '}
                  {
                    agente.usuario.nome.split(' ')[
                      agente.usuario.nome.split(' ').length - 1
                    ]
                  }
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 truncate">
                    {agente.usuario.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col items-end gap-1.5">
              {/* Badge de perfil */}
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Agente
              </span>

              {/* Badge de status */}
              <span
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full',
                  isAtivo
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600',
                )}
              >
                {isAtivo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        {/* ==================== INFORMAÇÕES ==================== */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telefone */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Telefone
                </span>
              </div>
              <p
                className={cn(
                  'text-sm font-medium pl-6',
                  isAtivo ? 'text-gray-800' : 'text-gray-500',
                )}
              >
                {agente.usuario.telefone || 'Não informado'}
              </p>
            </div>

            {/* Matrícula */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <IdCard className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Matrícula
                </span>
              </div>
              <p
                className={cn(
                  'text-sm font-medium pl-6',
                  isAtivo ? 'text-gray-800' : 'text-gray-500',
                )}
              >
                {agente.matricula}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== BOTÕES ==================== */}
        <div className="px-5 pb-5 pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            {isAtivo ? (
              // Botão EXCLUIR (para agentes ativos)
              <button
                onClick={() => setModalExcluirAberto(true)}
                disabled={isUpdating}
                className={cn(
                  'flex items-center justify-center gap-2',
                  'bg-red-600 hover:bg-red-700 text-white',
                  'rounded-lg transition-colors text-sm font-medium',
                  'h-10 px-4 py-2.5 flex-1',
                  isUpdating && 'opacity-50 cursor-not-allowed',
                )}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isUpdating ? 'Processando...' : 'Desativar'}</span>
              </button>
            ) : (
              // Botão ATIVAR (para agentes inativos)
              <button
                onClick={() => setModalAtivarAberto(true)}
                disabled={isUpdating}
                className={cn(
                  'flex items-center justify-center gap-2',
                  'bg-green-600 hover:bg-green-700 text-white',
                  'rounded-lg transition-colors text-sm font-medium',
                  'h-10 px-4 py-2.5 flex-1',
                  isUpdating && 'opacity-50 cursor-not-allowed',
                )}
              >
                <UserCheck className="w-4 h-4" />
                <span>{isUpdating ? 'Processando...' : 'Reativar'}</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Modal de exclusão/desativação */}
      <ModalConfirmacaoExclusao
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        onConfirm={handleExcluir}
        titulo="Confirmar desativação"
        mensagem="Quer mesmo desativar este(a) agente(a)?"
        tipo="exclusao"
      />

      {/* Modal de ativação */}
      <ModalConfirmacaoExclusao
        isOpen={modalAtivarAberto}
        onClose={() => setModalAtivarAberto(false)}
        onConfirm={handleAtivar}
        titulo="Confirmar ativação"
        mensagem="Quer mesmo ativar este(a) agente(a)?"
        textoConfirmar="Reativar"
        tipo="ativacao"
      />
    </>
  );
}
