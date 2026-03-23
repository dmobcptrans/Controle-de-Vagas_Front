'use client';

import { deleteGestor } from '@/lib/api/gestorApi';
import { Gestor } from '@/lib/types/gestor';
import { cn } from '@/lib/utils';
import { Mail, Phone, Trash2, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';

interface GestorCardProps {
  gestor: Gestor;
}

/**
 * @component GestorCard
 * @version 1.0.0
 * 
 * @description Card de exibição de gestor para administradores.
 * Exibe informações resumidas do gestor e permite exclusão com confirmação.
 * 
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 * 
 * 1. HEADER:
 *    - Ícone UserCircle (amarelo)
 *    - Nome do gestor
 *    - Email
 *    - Badge "Gestor" (amarelo)
 * 
 * 2. INFORMAÇÕES:
 *    - Telefone (com ícone Phone)
 *    - Função (Gestor) (com ícone UserCircle)
 * 
 * 3. AÇÕES:
 *    - Botão "Excluir" (vermelho) com modal de confirmação
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - MODAL DE CONFIRMAÇÃO: Previne exclusões acidentais
 * - REDIRECIONAMENTO: router.back() após exclusão bem-sucedida
 * - FEEDBACK: Toast de erro em caso de falha
 * - LAYOUT: Grid responsivo (1 coluna mobile, 2 colunas desktop)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - deleteGestor: API de exclusão
 * - ConfirmacaoExclusao: Modal de confirmação
 * - toast: Feedback visual (react-hot-toast)
 * 
 * @example
 * ```tsx
 * <GestorCard gestor={gestor} />
 * ```
 */

export default function GestorCard({ gestor }: GestorCardProps) {
  const router = useRouter();
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  /**
   * @function handleExcluir
   * @description Processa a exclusão do gestor
   * 
   * Fluxo:
   * 1. Chama API deleteGestor com ID do gestor
   * 2. Se sucesso: fecha modal e retorna à página anterior
   * 3. Se erro: exibe toast de erro
   */
  const handleExcluir = async () => {
    try {
      await deleteGestor(gestor.id);
      setModalExcluirAberto(false);
      router.back();
    } catch {
      toast.error('Erro ao excluir gestor. Tente novamente.');
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
              {/* Ícone do gestor (amarelo) */}
              <UserCircle className="w-9 h-9 text-yellow-500 flex-shrink-0" />
              
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {gestor.nome}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 truncate">
                    {gestor.email}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Badge de perfil */}
            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
              Gestor
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
                {gestor.telefone}
              </p>
            </div>

            {/* Função */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Função
                </span>
              </div>
              <p className="text-sm text-gray-800 font-medium pl-6">Gestor</p>
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
      />
    </>
  );
}