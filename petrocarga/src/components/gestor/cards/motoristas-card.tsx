'use client';

import { Motorista } from '@/lib/types/personas/motorista';
import { cn } from '@/lib/utils';
import { Mail, Phone, UserCircle, Bell, Car, Truck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { NotificacaoModal } from '@/components/modal/gestor/notificacaoModal';

interface MotoristaCardProps {
  motorista: Motorista;
}

/**
 * @component MotoristaCard
 * @version 1.0.0
 *
 * @description Card de exibição de motorista para gestores.
 * Exibe informações resumidas do motorista e permite enviar notificações ou visualizar veículos.
 *
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 *
 * 1. HEADER:
 *    - Ícone UserCircle (azul)
 *    - Nome do motorista (primeiro e último nome)
 *    - Email
 *    - Badge "Motorista" (azul)
 *
 * 2. INFORMAÇÕES:
 *    - Telefone (com ícone Phone)
 *    - CNH (com ícone Car) - número da CNH
 *
 * 3. AÇÕES:
 *    - Botão "Notificar": abre modal para envio de notificação
 *    - Botão "Veículos": redireciona para página de veículos do motorista
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - NOME FORMATADO: Exibe apenas primeiro e último nome (ex: "João Silva")
 * - LAYOUT: Grid responsivo (1 coluna mobile, 2 colunas desktop)
 * - BOTÕES: Responsivos (full width mobile, auto desktop)
 * - MODAL: NotificacaoModal para envio de mensagens ao motorista
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - NotificacaoModal: Modal para envio de notificações
 * - /gestor/motoristas/veiculos/:id: Página de veículos do motorista
 *
 * @example
 * ```tsx
 * <MotoristaCard motorista={motorista} />
 * ```
 */

export default function MotoristaCard({ motorista }: MotoristaCardProps) {
  const [isNotificacaoModalOpen, setIsNotificacaoModalOpen] = useState(false);

  // Extrai primeiro e último nome do motorista
  const nomeParts = motorista.usuario.nome.split(' ');
  const primeiroNome = nomeParts[0];
  const ultimoNome = nomeParts[nomeParts.length - 1];
  const nomeExibido = `${primeiroNome} ${ultimoNome}`;
  const isAtivo = motorista.usuario.ativo === true;

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
              isAtivo ? 'text-blue-500' : 'text-gray-400',
            )}
          />

          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate leading-none">
              {nomeExibido}
            </h3>

            <div className="flex items-center gap-1 mt-1">
              <Mail className="h-3 w-3 text-gray-400 shrink-0" />

              <span className="text-xs text-gray-500 truncate">
                {motorista.usuario.email}
              </span>
            </div>
          </div>
        </div>


        {/* Badges */}
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
                {motorista.usuario.telefone || 'Não informado'}
              </p>
            </div>

          </div>


          {/* CNH */}
          <div className="flex items-start gap-2 min-w-0">

            <Car className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-gray-500">
                CNH
              </p>

              <p
                className={cn(
                  'text-sm font-medium truncate',
                  isAtivo ? 'text-gray-800' : 'text-gray-500',
                )}
              >
                {motorista.numeroCnh}
              </p>
            </div>

          </div>


        </div>
      </div>


      {/* Ações */}
      <div className="p-3 flex gap-2">

        <button
          onClick={() => setIsNotificacaoModalOpen(true)}
          className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Notificar
        </button>


        <Link
          href={`/gestor/motoristas/veiculos/${motorista.usuario.id}`}
          className="flex-1 h-9 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-medium flex items-center justify-center gap-2"
        >
          <Truck className="h-4 w-4" />
          Veículos
        </Link>

      </div>

    </article>


    {/* Modal */}
    <NotificacaoModal
      isOpen={isNotificacaoModalOpen}
      onClose={() => setIsNotificacaoModalOpen(false)}
      usuarioId={motorista.usuario.id}
      usuarioNome={motorista.usuario.nome}
      tipoUsuario="MOTORISTA"
    />
  </>
);
}
