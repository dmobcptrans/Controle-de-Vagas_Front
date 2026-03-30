// 'use client';

// import { deleteGestor } from '@/lib/api/gestorApi';
// import { Gestor } from '@/lib/types/gestor';
// import { cn } from '@/lib/utils';
// import { Mail, Phone, Trash2, UserCircle } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import toast from 'react-hot-toast';
// import ConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';

// interface GestorCardProps {
//   gestor: Gestor;
// }

// /**
//  * @component GestorCard
//  * @version 1.0.0
//  *
//  * @description Card de exibição de gestor para administradores.
//  * Exibe informações resumidas do gestor e permite exclusão com confirmação.
//  *
//  * ----------------------------------------------------------------------------
//  * 📋 INFORMAÇÕES EXIBIDAS:
//  * ----------------------------------------------------------------------------
//  *
//  * 1. HEADER:
//  *    - Ícone UserCircle (amarelo)
//  *    - Nome do gestor
//  *    - Email
//  *    - Badge "Gestor" (amarelo)
//  *
//  * 2. INFORMAÇÕES:
//  *    - Telefone (com ícone Phone)
//  *    - Função (Gestor) (com ícone UserCircle)
//  *
//  * 3. AÇÕES:
//  *    - Botão "Excluir" (vermelho) com modal de confirmação
//  *
//  * ----------------------------------------------------------------------------
//  * 🧠 DECISÕES TÉCNICAS:
//  * ----------------------------------------------------------------------------
//  *
//  * - MODAL DE CONFIRMAÇÃO: Previne exclusões acidentais
//  * - REDIRECIONAMENTO: router.back() após exclusão bem-sucedida
//  * - FEEDBACK: Toast de erro em caso de falha
//  * - LAYOUT: Grid responsivo (1 coluna mobile, 2 colunas desktop)
//  *
//  * ----------------------------------------------------------------------------
//  * 🔗 COMPONENTES RELACIONADOS:
//  * ----------------------------------------------------------------------------
//  *
//  * - deleteGestor: API de exclusão
//  * - ConfirmacaoExclusao: Modal de confirmação
//  * - toast: Feedback visual (react-hot-toast)
//  *
//  * @example
//  * ```tsx
//  * <GestorCard gestor={gestor} />
//  * ```
//  */

// export default function GestorCard({ gestor }: GestorCardProps) {
//   const router = useRouter();
//   const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

//   /**
//    * @function handleExcluir
//    * @description Processa a exclusão do gestor
//    *
//    * Fluxo:
//    * 1. Chama API deleteGestor com ID do gestor
//    * 2. Se sucesso: fecha modal e retorna à página anterior
//    * 3. Se erro: exibe toast de erro
//    */
//   const handleExcluir = async () => {
//     try {
//       await deleteGestor(gestor.id);
//       setModalExcluirAberto(false);
//       router.back();
//     } catch {
//       toast.error('Erro ao excluir gestor. Tente novamente.');
//     }
//   };

//   return (
//     <>
//       <article
//         className={cn(
//           'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
//           'hover:shadow-md transition-shadow',
//         )}
//       >
//         {/* ==================== HEADER ==================== */}
//         <div className="px-5 pt-5 pb-4 border-b border-gray-100">
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-3">
//               {/* Ícone do gestor (amarelo) */}
//               <UserCircle className="w-9 h-9 text-yellow-500 flex-shrink-0" />

//               <div className="min-w-0">
//                 <h3 className="text-base font-semibold text-gray-800 truncate">
//                   {gestor.nome.split(' ')[0]}{' '}
//                   {gestor.nome.split(' ')[gestor.nome.split(' ').length - 1]}
//                 </h3>
//                 <div className="flex items-center gap-2 mt-1">
//                   <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
//                   <p className="text-sm text-gray-600 truncate">
//                     {gestor.email}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Badge de perfil */}
//             <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
//               Gestor
//             </span>
//           </div>
//         </div>

//         {/* ==================== INFORMAÇÕES ==================== */}
//         <div className="px-5 py-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Telefone */}
//             <div className="space-y-1.5">
//               <div className="flex items-center gap-2">
//                 <Phone className="w-4 h-4 text-gray-400" />
//                 <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                   Telefone
//                 </span>
//               </div>
//               <p className="text-sm text-gray-800 font-medium pl-6">
//                 {gestor.telefone}
//               </p>
//             </div>

//             {/* Função */}
//             <div className="space-y-1.5">
//               <div className="flex items-center gap-2">
//                 <UserCircle className="w-4 h-4 text-gray-400" />
//                 <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                   Função
//                 </span>
//               </div>
//               <p className="text-sm text-gray-800 font-medium pl-6">Gestor</p>
//             </div>
//           </div>
//         </div>

//         {/* ==================== BOTÕES ==================== */}
//         <div className="px-5 pb-5 pt-4 border-t border-gray-100">
//           <div className="flex gap-3">
//             <button
//               onClick={() => setModalExcluirAberto(true)}
//               className={cn(
//                 'flex items-center justify-center gap-2',
//                 'bg-red-600 hover:bg-red-700 text-white',
//                 'rounded-lg transition-colors text-sm font-medium',
//                 'h-10 px-4 py-2.5 flex-1',
//               )}
//             >
//               <Trash2 className="w-4 h-4" />
//               <span>Excluir</span>
//             </button>
//           </div>
//         </div>
//       </article>

//       {/* Modal de confirmação de exclusão */}
//       <ConfirmacaoExclusao
//         isOpen={modalExcluirAberto}
//         onClose={() => setModalExcluirAberto(false)}
//         onConfirm={handleExcluir}
//         mensagem="Quer mesmo excluir este(a) gestor(a)? Essa ação não poderá ser desfeita."
//       />
//     </>
//   );
// }

'use client';

import { deleteGestor } from '@/lib/api/gestorApi';
import { reativarUsuario } from '@/lib/api/recuperacaoApi';
import { Gestor } from '@/lib/types/gestor';
import { cn } from '@/lib/utils';
import { Mail, Phone, Trash2, UserCircle, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ModalConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';

interface GestorCardProps {
  gestor: Gestor;
  onStatusChange?: () => void; // Callback opcional para atualizar a lista após mudança de status
}

/**
 * @component GestorCard
 * @version 2.0.0
 *
 * @description Card de exibição de gestor para administradores.
 * Exibe informações resumidas do gestor e permite exclusão/ativação.
 *
 * ----------------------------------------------------------------------------
 * 📋 ALTERAÇÕES V2.0.0:
 * ----------------------------------------------------------------------------
 *
 * 1. NOVA FUNCIONALIDADE: Ativar/Desativar gestor
 *    - Quando gestor está ATIVO: botão "Excluir" (vermelho)
 *    - Quando gestor está INATIVO: botão "Ativar" (verde)
 *    - Modal de confirmação para ambas as ações
 *
 * 2. MELHORIAS:
 *    - Badge de status (Ativo/Inativo) com cores diferentes
 *    - Callback opcional para atualizar lista sem recarregar página
 *    - Feedback visual do status atual
 *    - Estado de loading durante operações
 *
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 *
 * 1. HEADER:
 *    - Ícone UserCircle (amarelo para ativo, cinza para inativo)
 *    - Nome do gestor
 *    - Email
 *    - Badge "Gestor" (amarelo) + Badge de status (Ativo/Inativo)
 *
 * 2. INFORMAÇÕES:
 *    - Telefone (com ícone Phone)
 *    - Função (Gestor) (com ícone UserCircle)
 *
 * 3. AÇÕES:
 *    - Botão dinâmico: "Excluir" (ativo) ou "Ativar" (inativo)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - MODAIS DE CONFIRMAÇÃO: Previne ações acidentais
 * - CALLBACK onStatusChange: Permite atualizar a lista pai sem recarregar a página
 * - STATUS VISUAL: Badge colorida para identificar rapidamente o estado do gestor
 * - FEEDBACK: Toast de erro/sucesso para cada operação
 * - LAYOUT: Grid responsivo (1 coluna mobile, 2 colunas desktop)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - deleteGestor: API de exclusão (desativação)
 * - reativarUsuario: API de ativação (reativação de usuário)
 * - ModalConfirmacaoExclusao: Modal de confirmação reutilizável
 * - toast: Feedback visual (react-hot-toast)
 *
 * @example
 * ```tsx
 * <GestorCard
 *   gestor={gestor}
 *   onStatusChange={() => fetchGestores()}
 * />
 * ```
 */

export default function GestorCard({
  gestor,
  onStatusChange,
}: GestorCardProps) {
  const router = useRouter();
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalAtivarAberto, setModalAtivarAberto] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Determina se o gestor está ativo
  const isAtivo = gestor.ativo === true;

  /**
   * @function handleExcluir
   * @description Processa a exclusão (desativação) do gestor
   *
   * Fluxo:
   * 1. Chama API deleteGestor com ID do gestor
   * 2. Se sucesso: fecha modal, exibe toast e atualiza lista via callback
   * 3. Se erro: exibe toast de erro
   */
  const handleExcluir = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await deleteGestor(gestor.id);
      setModalExcluirAberto(false);
      toast.success('Gestor desativado com sucesso!');

      // Atualiza a lista se o callback foi fornecido
      if (onStatusChange) {
        onStatusChange();
      } else {
        // Fallback: retorna à página anterior se não houver callback
        router.back();
      }
    } catch (error) {
      console.error('Erro ao desativar gestor:', error);
      toast.error('Erro ao desativar gestor. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * @function handleAtivar
   * @description Processa a ativação (reativação) do gestor
   *
   * Fluxo:
   * 1. Chama API reativarUsuario com ID do gestor (usuarioId)
   * 2. Se sucesso: fecha modal, exibe toast e atualiza lista via callback
   * 3. Se erro: exibe toast de erro
   */
  const handleAtivar = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      // CORREÇÃO: Usando a API correta reativarUsuario com o ID do gestor
      await reativarUsuario(gestor.id);
      setModalAtivarAberto(false);
      toast.success('Gestor ativado com sucesso!');

      // Atualiza a lista se o callback foi fornecido
      if (onStatusChange) {
        onStatusChange();
      } else {
        // Fallback: recarrega a página se não houver callback
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao ativar gestor:', error);
      toast.error('Erro ao ativar gestor. Tente novamente.');
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
              {/* Ícone do gestor com cor dinâmica baseada no status */}
              <UserCircle
                className={cn(
                  'w-9 h-9 flex-shrink-0',
                  isAtivo ? 'text-yellow-500' : 'text-gray-400',
                )}
              />

              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {gestor.nome.split(' ')[0]}{' '}
                  {gestor.nome.split(' ')[gestor.nome.split(' ').length - 1]}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 truncate">
                    {gestor.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col items-end gap-1.5">
              {/* Badge de perfil */}
              <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
                Gestor
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
                {gestor.telefone || 'Não informado'}
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
              <p
                className={cn(
                  'text-sm font-medium pl-6',
                  isAtivo ? 'text-gray-800' : 'text-gray-500',
                )}
              >
                Gestor
              </p>
            </div>
          </div>
        </div>

        {/* ==================== BOTÕES ==================== */}
        <div className="px-5 pb-5 pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            {isAtivo ? (
              // Botão EXCLUIR (para gestores ativos)
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
              // Botão ATIVAR (para gestores inativos)
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
        mensagem="Quer mesmo desativar este(a) gestor(a)? Ele não aparecerá mais na lista de ativos."
        textoConfirmar="Desativar"
        tipo="exclusao"
      />

      {/* Modal de ativação */}
      <ModalConfirmacaoExclusao
        isOpen={modalAtivarAberto}
        onClose={() => setModalAtivarAberto(false)}
        onConfirm={handleAtivar}
        titulo="Confirmar ativação"
        mensagem="Quer mesmo ativar este(a) gestor(a)? Ele voltará a aparecer na lista de ativos."
        textoConfirmar="Reativar"
        tipo="ativacao"
      />
    </>
  );
}
