'use client';

import { deleteAgente } from '@/lib/api/agenteApi';
import { Agente } from '@/lib/types/agente';
import { cn } from '@/lib/utils';
import { IdCard, Mail, Phone, UserCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';

interface AgenteCardProps {
  agente: Agente;
}

/**
 * @component AgenteCard
 * @version 1.0.0
 * 
 * @description Card de exibição de agente para gestores.
 * Exibe informações resumidas do agente e permite exclusão com confirmação.
 * 
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 * 
 * 1. HEADER:
 *    - Ícone UserCircle (verde)
 *    - Nome do agente
 *    - Email
 *    - Badge "Agente" (verde)
 * 
 * 2. INFORMAÇÕES:
 *    - Telefone (com ícone Phone)
 *    - Matrícula (com ícone IdCard)
 * 
 * 3. AÇÕES:
 *    - Botão "Excluir" (vermelho) com modal de confirmação
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - MODAL DE CONFIRMAÇÃO: Previne exclusões acidentais
 * - RECARREGAMENTO: window.location.reload() após exclusão bem-sucedida
 * - FEEDBACK: Toast de erro em caso de falha
 * - LAYOUT: Grid responsivo (1 coluna mobile, 2 colunas desktop)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - deleteAgente: API de exclusão
 * - ConfirmacaoExclusao: Modal de confirmação
 * - toast: Feedback visual (react-hot-toast)
 * 
 * @example
 * ```tsx
 * <AgenteCard agente={agente} />
 * ```
 */

export default function AgenteCard({ agente }: AgenteCardProps) {
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  /**
   * @function handleExcluir
   * @description Processa a exclusão do agente
   * 
   * Fluxo:
   * 1. Chama API deleteAgente com ID do usuário
   * 2. Se sucesso: fecha modal e recarrega página
   * 3. Se erro: exibe toast de erro
   */
  const handleExcluir = async () => {
    try {
      await deleteAgente(agente.usuario.id);
      setModalExcluirAberto(false);
      window.location.reload();
    } catch (err) {
      toast.error('Erro ao excluir agente. Tente novamente.');
    }
  };

  return (
    <>
      <article
        className={cn(
          'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
          'hover:shadow-md transition-shadow',
        )}
      >
        {/* ==================== HEADER ==================== */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Ícone do agente */}
              <UserCircle className="w-9 h-9 text-green-500 flex-shrink-0" />
              
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {agente.usuario.nome.split(' ')[0]} {agente.usuario.nome.split(' ')[agente.usuario.nome.split(' ').length - 1]}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 truncate">
                    {agente.usuario.email}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Badge de perfil */}
            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
              Agente
            </span>
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
              <p className="text-sm text-gray-800 font-medium pl-6">
                {agente.usuario.telefone}
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
              <p className="text-sm text-gray-800 font-medium pl-6">
                {agente.matricula}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== BOTÕES ==================== */}
        <div className="px-5 pb-5 pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={() => setModalExcluirAberto(true)}
              className={cn(
                'flex items-center justify-center gap-2',
                'bg-red-600 hover:bg-red-700 text-white',
                'rounded-lg transition-colors text-sm font-medium',
                'h-10 px-4 py-2.5 flex-1',
              )}
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </article>

      {/* Modal de confirmação de exclusão */}
      <ConfirmacaoExclusao
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        onConfirm={handleExcluir}
        mensagem= 'Quer mesmo excluir este(a) agente? Essa ação não poderá ser desfeita.'
      />
    </>
  );
}