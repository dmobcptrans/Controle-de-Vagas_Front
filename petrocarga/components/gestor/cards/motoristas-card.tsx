'use client';

import { Motorista } from '@/lib/types/motorista';
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
              {/* Ícone do motorista */}
              <UserCircle className="w-9 h-9 text-blue-500 flex-shrink-0" />

              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {nomeExibido}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 truncate">
                    {motorista.usuario.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Badge de perfil */}
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Motorista
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
                {motorista.usuario.telefone}
              </p>
            </div>

            {/* CNH */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  CNH
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Número</p>
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {motorista.numeroCnh}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== BOTÕES ==================== */}
        <div className="px-5 pb-5 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botão Notificar */}
            <button
              onClick={() => setIsNotificacaoModalOpen(true)}
              className={cn(
                'flex items-center justify-center gap-2',
                'bg-blue-600 hover:bg-blue-700 text-white',
                'rounded-lg transition-colors text-sm font-medium',
                'h-10 px-4 py-2.5 flex-1 sm:flex-none sm:w-auto',
              )}
              title="Enviar notificação"
            >
              <Bell className="w-4 h-4" />
              <span>Notificar</span>
            </button>

            {/* Botão Veículos */}
            <Link
              href={`/gestor/motoristas/veiculos/${motorista.usuario.id}`}
              className={cn(
                'flex items-center justify-center gap-2',
                'bg-gray-100 hover:bg-gray-200 text-gray-800',
                'rounded-lg transition-colors text-sm font-medium',
                'h-10 px-4 py-2.5 flex-1 sm:flex-none sm:w-auto',
                'border border-gray-300',
              )}
              title="Ver veículos"
            >
              <Truck className="w-4 h-4" />
              <span>Veículos</span>
            </Link>
          </div>
        </div>
      </article>

      {/* ==================== MODAL DE NOTIFICAÇÃO ==================== */}
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
