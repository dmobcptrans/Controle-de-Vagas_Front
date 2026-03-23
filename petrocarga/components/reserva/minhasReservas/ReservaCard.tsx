'use client';

import { useState, useEffect, useTransition } from 'react';
import { cn } from '@/lib/utils';
import {
  FileText,
  MapPin,
  Clock,
  Trash2,
  Pencil,
  Check,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ReservaGet } from '@/lib/types/reserva';
import ReservaEditarModal from '../../modal/reserva/ReservaEditarModal/ReservaEditarModal';
import ReservaCheckinModal from '../../modal/reserva/ReservaCheckinModal/ReservaCheckinModal';

interface ReservaCardProps {
  reserva: ReservaGet;
  onGerarDocumento?: (reservaId: string) => Promise<void> | void;
  onExcluir?: (reservaId: string) => void;
  onCheckout?: (reserva: ReservaGet) => void;
}

/**
 * @component ReservaCard
 * @version 1.0.0
 * 
 * @description Card de exibição de reserva com ações contextuais.
 * Exibe informações da reserva e botões de ação conforme status e horário.
 * 
 * ----------------------------------------------------------------------------
 * 📋 AÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. GERAR DOCUMENTO:
 *    - Disponível sempre
 *    - Gera comprovante PDF da reserva
 * 
 * 2. CANCELAR (EXCLUIR):
 *    - Disponível apenas para status "RESERVADA"
 *    - Modal de confirmação
 * 
 * 3. EDITAR:
 *    - Disponível quando: status "RESERVADA" E minutosParaInicio > 30
 *    - Modal de edição
 * 
 * 4. CHECK-IN:
 *    - Disponível quando: status "RESERVADA" E
 *      agora >= (início - 5 min) E agora <= fim
 *    - Modal de confirmação
 * 
 * 5. CHECKOUT:
 *    - Disponível quando: status "ATIVA" E agora < fim
 *    - Modal de confirmação
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useTransition: Gerencia loading de cada ação separadamente
 * - TEMPO REAL: Intervalo de 60s para atualizar verificação de disponibilidade
 * - CORES POR STATUS:
 *   - ATIVA: border-green-900
 *   - RESERVADA: border-green-500
 *   - CONCLUIDA: border-b-blue-300
 *   - REMOVIDA: border-red-500
 *   - CANCELADA: border-b-blue-200
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - ReservaEditarModal: Modal de edição
 * - ReservaCheckinModal: Modal de check-in
 * 
 * @example
 * ```tsx
 * <ReservaCard
 *   reserva={reserva}
 *   onGerarDocumento={gerarComprovante}
 *   onExcluir={excluirReserva}
 *   onCheckout={checkoutReserva}
 * />
 * ```
 */

export default function ReservaCard({
  reserva: reservaInicial,
  onGerarDocumento,
  onExcluir,
  onCheckout,
}: ReservaCardProps) {
  // ==================== LOADING POR AÇÃO (useTransition) ====================
  const [isGeneratingDoc, startDocGeneration] = useTransition();
  const [isCheckingIn, startCheckIn] = useTransition();
  const [isCheckingOut, startCheckOut] = useTransition();
  const [isOpeningEdit, startOpenEdit] = useTransition();
  const [isOpeningDelete, startOpenDelete] = useTransition();

  // ==================== ESTADOS ====================
  const [currentReserva, setCurrentReserva] =
    useState<ReservaGet>(reservaInicial);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalAbertoCheckout, setModalAbertoCheckout] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalCheckinAberto, setModalCheckinAberto] = useState(false);
  const [agora, setAgora] = useState(new Date());

  // ==================== ATUALIZAÇÃO DE TEMPO ====================
  useEffect(() => {
    const interval = setInterval(() => {
      setAgora(new Date());
    }, 60000); // atualiza a cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  // ==================== CÁLCULOS ====================
  const inicioReserva = new Date(currentReserva.inicio);
  const fimReserva = new Date(currentReserva.fim);
  const minutosParaInicio =
    (inicioReserva.getTime() - agora.getTime()) / 1000 / 60;

  // ==================== REGRAS DE VISIBILIDADE ====================
  const podeEditar =
    currentReserva.status === 'RESERVADA' && minutosParaInicio > 30;

  const podeFazerCheckin =
    currentReserva.status === 'RESERVADA' &&
    agora >= new Date(inicioReserva.getTime() - 5 * 60 * 1000) &&
    agora <= fimReserva;

  const podeFazerCheckout =
    currentReserva.status === 'ATIVA' && agora < fimReserva;

  // ==================== SINCRONIZAÇÃO ====================
  useEffect(() => {
    setCurrentReserva(reservaInicial);
  }, [reservaInicial]);

  // ==================== FUNÇÕES AUXILIARES ====================
  const formatarData = (data: string) =>
    new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  // ==================== HANDLERS (COM useTransition) ====================
  const handleGerarDocumento = () => {
    if (!onGerarDocumento || isGeneratingDoc) return;

    startDocGeneration(async () => {
      try {
        await onGerarDocumento(currentReserva.id);
      } catch (error) {
        console.error('Erro ao gerar documento:', error);
      }
    });
  };

  const handleOpenDeleteModal = () => {
    if (isOpeningDelete) return;
    startOpenDelete(() => {
      setModalAberto(true);
    });
  };

  const handleOpenEditModal = () => {
    if (!podeEditar || isOpeningEdit) return;
    startOpenEdit(() => {
      setModalEditarAberto(true);
    });
  };

  const handleOpenCheckinModal = () => {
    if (!podeFazerCheckin || isCheckingIn) return;
    startCheckIn(() => {
      setModalCheckinAberto(true);
    });
  };

  const handleOpenCheckoutModal = () => {
    if (!podeFazerCheckout || isCheckingOut) return;
    startCheckOut(() => {
      setModalAbertoCheckout(true);
    });
  };

  const handleExcluir = () => {
    onExcluir?.(currentReserva.id);
    setModalAberto(false);
  };

  const handleUpdateSuccess = (updated: ReservaGet) => {
    setCurrentReserva(updated);
    setModalEditarAberto(false);
  };

  // ==================== CORES POR STATUS ====================
  const statusColors = {
    ATIVA: 'border-green-900',
    CONCLUIDA: 'border-b-blue-300',
    RESERVADA: 'border-green-500',
    REMOVIDA: 'border-red-500',
    CANCELADA: 'border-b-blue-200',
  };

  return (
    <article
      className={cn(
        'flex flex-col bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 gap-4 w-full',
        'sm:flex-row sm:justify-between',
        'max-sm:gap-3 max-sm:p-3',
        statusColors[currentReserva.status as keyof typeof statusColors],
      )}
    >
      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Header: logradouro/bairro + status (desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate leading-tight">
            {`${currentReserva.logradouro} - ${currentReserva.bairro}` ||
              'Local não informado'}
          </h3>

          <span
            className={cn(
              'hidden sm:inline-block px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm',
              currentReserva.status === 'ATIVA' &&
                'bg-green-100 text-green-900',
              currentReserva.status === 'CONCLUIDA' &&
                'bg-gray-100 border-b-blue-300',
              currentReserva.status === 'RESERVADA' &&
                'bg-green-100 border-green-500',
              currentReserva.status === 'REMOVIDA' &&
                'bg-gray-100 border-red-500',
              currentReserva.status === 'CANCELADA' &&
                'bg-gray-100 border-b-blue-200',
            )}
          >
            {currentReserva.status}
          </span>
        </div>

        {/* Origem */}
        <p className="text-sm sm:text-base text-gray-500 flex items-center gap-1 truncate leading-tight">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          {`Local de Origem: ${currentReserva.cidadeOrigem}`}
        </p>

        {/* Datas */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600">
          <span className="flex items-center gap-1 truncate">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            Início: {formatarData(currentReserva.inicio)}
          </span>
          <span className="flex items-center gap-1 truncate">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            Fim: {formatarData(currentReserva.fim)}
          </span>
        </div>
      </div>

      {/* ==================== AÇÕES ==================== */}
      <div className="flex flex-col items-stretch sm:items-end gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
        
        {/* Status (mobile) */}
        <span
          className={cn(
            'sm:hidden px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-center',
            currentReserva.status === 'ATIVA' && 'bg-green-100 text-green-900',
            currentReserva.status === 'CONCLUIDA' && 'bg-gray-100 text-red-800',
          )}
        >
          {currentReserva.status}
        </span>

        {/* Botão Gerar Documento */}
        <button
          onClick={handleGerarDocumento}
          disabled={isGeneratingDoc}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 py-2',
            isGeneratingDoc && 'opacity-70 cursor-not-allowed',
          )}
          aria-busy={isGeneratingDoc}
        >
          {isGeneratingDoc ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Gerar Documento
            </>
          )}
        </button>

        {/* Botões de ação (grid) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 w-full sm:w-auto">
          
          {/* Excluir (apenas RESERVADA) */}
          {currentReserva.status === 'RESERVADA' && (
            <button
              onClick={handleOpenDeleteModal}
              disabled={isOpeningDelete}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 py-2 text-red-600',
                isOpeningDelete && 'opacity-70 cursor-not-allowed',
              )}
            >
              {isOpeningDelete ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Abrindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Cancelar
                </>
              )}
            </button>
          )}

          {/* Editar (apenas RESERVADA e > 30 min antes) */}
          {podeEditar && (
            <button
              onClick={handleOpenEditModal}
              disabled={isOpeningEdit}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 py-2',
                isOpeningEdit && 'opacity-70 cursor-not-allowed',
              )}
            >
              {isOpeningEdit ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Abrindo...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Editar
                </>
              )}
            </button>
          )}

          {/* Check-in (5 min antes até o fim) */}
          {podeFazerCheckin && (
            <button
              onClick={handleOpenCheckinModal}
              disabled={isCheckingIn}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 transition',
                isCheckingIn && 'opacity-70 cursor-not-allowed',
              )}
            >
              {isCheckingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Check-in
                </>
              )}
            </button>
          )}

          {/* Check-out (apenas ATIVA) */}
          {podeFazerCheckout && (
            <button
              onClick={handleOpenCheckoutModal}
              disabled={isCheckingOut}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 transition',
                isCheckingOut && 'opacity-70 cursor-not-allowed',
              )}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparando...
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4" />
                  Checkout
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ==================== MODAIS ==================== */}
      
      {/* Modal de Exclusão */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalAberto(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-96 max-w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Tem certeza que deseja excluir esta Reserva? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {modalAbertoCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalAbertoCheckout(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-96 max-w-full shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
              Confirmar Checkout
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Tem certeza que deseja fazer Checkout? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={() => setModalAbertoCheckout(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onCheckout?.(currentReserva);
                  setModalAbertoCheckout(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {modalEditarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-0">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalEditarAberto(false)}
          />
          <div className="relative bg-white rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-full sm:w-[600px] max-h-[90vh] flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
              <ReservaEditarModal
                reserva={currentReserva}
                onClose={() => setModalEditarAberto(false)}
                onSuccess={handleUpdateSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Check-in */}
      {modalCheckinAberto && (
        <ReservaCheckinModal
          reserva={currentReserva}
          onClose={() => setModalCheckinAberto(false)}
          onCheckinSuccess={(reservaAtualizada) =>
            setCurrentReserva(reservaAtualizada)
          }
          onDenunciar={(id) => console.log('Denúncia da reserva', id)}
        />
      )}
    </article>
  );
}