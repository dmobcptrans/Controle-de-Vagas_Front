import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  LogradouroItem,
  VagaItem,
  ReservaItem,
} from '@/components/gestor/calendario/ListItems';
import { Reserva } from '@/lib/types/reserva';
import { Vaga } from '@/lib/types/vaga';

export type ModalState =
  | {
      type: 'group';
      data: { dateStr: string; logradouros: Record<string, Reserva[]> };
    }
  | {
      type: 'vagasLogradouro';
      data: { logradouro: string; reservasDoLogradouro: Reserva[] };
    }
  | {
      type: 'vaga';
      data: { vagaId: string; vagaInfo: Vaga | null; reservas: Reserva[] };
    }
  | { type: 'reserva'; data: { reserva: Reserva; vagaInfo: Vaga | null } }
  | { type: null; data: null };

interface ModalProps {
  modalState: ModalState;
  vagaCache: Record<string, Vaga | null>;
  close: () => void;
  openVagasLogradouro: (logradouro: string, reservas: Reserva[]) => void;
  openVagaModal: (vagaId: string, reservas: Reserva[]) => void;
  openReservaModal: (reserva: Reserva) => void;
  checkoutForcado: (reservaId: string) => void;
  goBack: () => void;
}

/**
 * @component ReservaModal
 * @version 1.0.0
 * 
 * @description Modal de navegação hierárquica para visualização de reservas do gestor.
 * Permite navegar entre níveis: Dia → Logradouros → Vagas → Reserva.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO DE NAVEGAÇÃO:
 * ----------------------------------------------------------------------------
 * 
 * 1. GROUP (Nível 1 - Dia):
 *    - Exibe lista de logradouros com reservas naquele dia
 *    - Cada item mostra contagem de reservas ativas/finalizadas
 *    - Clique abre nível "vagasLogradouro"
 * 
 * 2. VAGAS_LOGradouro (Nível 2 - Logradouro):
 *    - Agrupa reservas por vaga no logradouro selecionado
 *    - Cada vaga mostra indicador de atividade (verde/vermelho)
 *    - Clique abre nível "vaga"
 * 
 * 3. VAGA (Nível 3 - Vaga):
 *    - Lista todas as reservas da vaga selecionada
 *    - Ordenadas por horário de início
 *    - Clique abre nível "reserva"
 * 
 * 4. RESERVA (Nível 4 - Detalhes):
 *    - Exibe informações completas da reserva
 *    - Botão "Checkout Forçado" para reservas ativas
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - RENDERIZAÇÃO CONDICIONAL: switch case baseado no tipo do modalState
 * - BOTÃO VOLTAR: Exibido em todos os níveis exceto o primeiro (group)
 * - CHECKOUT FORÇADO: Disponível apenas para reservas com status diferente de:
 *   - CONCLUIDA, RESERVADA, REMOVIDA, CANCELADA
 * - DIÁLOGO: Componente Dialog do shadcn/ui
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - LogradouroItem: Item de logradouro com resumo de reservas
 * - VagaItem: Item de vaga com indicador de atividade
 * - ReservaItem: Item de reserva com horários e status
 * 
 * @example
 * ```tsx
 * <ReservaModal
 *   modalState={modalState}
 *   vagaCache={vagaCache}
 *   close={closeModal}
 *   openVagasLogradouro={openVagasLogradouro}
 *   openVagaModal={openVagaModal}
 *   openReservaModal={openReservaModal}
 *   checkoutForcado={handleCheckoutForcado}
 *   goBack={goBack}
 * />
 * ```
 */

export const ReservaModal = ({
  modalState,
  vagaCache,
  close,
  openVagasLogradouro,
  openVagaModal,
  openReservaModal,
  checkoutForcado,
  goBack,
}: ModalProps) => {
  
  /**
   * @function renderContent
   * @description Renderiza o conteúdo do modal baseado no tipo do estado
   */
  const renderContent = () => {
    switch (modalState.type) {
      
      // ==================== NÍVEL 1: DIA (GROUP) ====================
      case 'group':
        return (
          <>
            <DialogHeader>
              <DialogTitle>
                Reservas do dia {modalState.data.dateStr}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {Object.entries(modalState.data.logradouros).map(
                ([logradouro, reservasDoLogradouro]) => (
                  <LogradouroItem
                    key={logradouro}
                    logradouro={logradouro}
                    reservas={reservasDoLogradouro}
                    onClick={() =>
                      openVagasLogradouro(logradouro, reservasDoLogradouro)
                    }
                  />
                ),
              )}
            </div>
          </>
        );

      // ==================== NÍVEL 2: LOGRADOURO ====================
      case 'vagasLogradouro': {
        // Agrupa reservas por ID da vaga
        const reservasPorVaga = modalState.data.reservasDoLogradouro.reduce(
          (acc, reserva) => {
            const vagaId = reserva.vagaId;
            if (!acc[vagaId]) acc[vagaId] = [];
            acc[vagaId].push(reserva);
            return acc;
          },
          {} as Record<string, Reserva[]>,
        );

        return (
          <>
            <DialogHeader>
              <DialogTitle>Vagas em {modalState.data.logradouro}</DialogTitle>
            </DialogHeader>

            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {Object.entries(reservasPorVaga).map(
                ([vagaId, reservasDaVaga]) => (
                  <VagaItem
                    key={vagaId}
                    vagaId={vagaId}
                    vagasCache={vagaCache}
                    reservas={reservasDaVaga}
                    onClick={() => openVagaModal(vagaId, reservasDaVaga)}
                  />
                ),
              )}
            </div>
          </>
        );
      }

      // ==================== NÍVEL 3: VAGA ====================
      case 'vaga':
        return (
          <>
            <DialogHeader>
              <DialogTitle>
                Horários -{' '}
                {modalState.data.vagaInfo?.endereco?.logradouro ??
                  modalState.data.vagaId}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {modalState.data.reservas.length === 0 && (
                <div className="text-sm text-muted-foreground p-2">
                  Nenhuma reserva neste dia.
                </div>
              )}
              {modalState.data.reservas
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
                )
                .map((r) => (
                  <ReservaItem
                    key={r.id}
                    reserva={r}
                    onClick={() => openReservaModal(r)}
                  />
                ))}
            </div>
          </>
        );

      // ==================== NÍVEL 4: RESERVA (DETALHES) ====================
      case 'reserva':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Detalhes da Reserva</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {/* Seção: Reserva */}
              <div className="space-y-1">
                <p className="font-semibold text-base">Reserva</p>
                <p>
                  <strong>Vaga:</strong>{' '}
                  {modalState.data.reserva.enderecoVaga.logradouro}
                </p>
                <p>
                  <strong>Bairro:</strong>{' '}
                  {modalState.data.reserva.enderecoVaga.bairro}
                </p>
                <p>
                  <strong>Área:</strong> {modalState.data.vagaInfo?.area ?? '—'}
                </p>
                <p>
                  <strong>Início:</strong>{' '}
                  {new Date(modalState.data.reserva.inicio).toLocaleString()}
                </p>
                <p>
                  <strong>Fim:</strong>{' '}
                  {new Date(modalState.data.reserva.fim).toLocaleString()}
                </p>
                <p>
                  <strong>Status:</strong> {modalState.data.reserva.status}
                </p>
              </div>

              <hr />

              {/* Seção: Motorista */}
              <div className="space-y-1">
                <p className="font-semibold text-base">Motorista</p>
                <p>
                  <strong>Nome:</strong> {modalState.data.reserva.motoristaNome}
                </p>
              </div>

              <hr />

              {/* Seção: Veículo */}
              <div className="space-y-1">
                <p className="font-semibold text-base">Veículo</p>
                <p>
                  <strong>Marca:</strong> {modalState.data.reserva.marcaVeiculo}
                </p>
                <p>
                  <strong>Modelo:</strong>{' '}
                  {modalState.data.reserva.modeloVeiculo}
                </p>
                <p>
                  <strong>Placa:</strong> {modalState.data.reserva.placaVeiculo}
                </p>
                <p>
                  <strong>Tamanho:</strong>{' '}
                  {modalState.data.reserva.tamanhoVeiculo}
                </p>
              </div>

              <hr />

              {/* Seção: Origem */}
              <div className="space-y-1">
                <p className="font-semibold text-base">Origem</p>
                <p>{modalState.data.reserva.cidadeOrigem}</p>
              </div>

              <hr />

              {/* Seção: Entrada */}
              <div className="space-y-1">
                <p className="font-semibold text-base">Entrada</p>
                <p>{modalState.data.reserva.entradaCidade}</p>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  /**
   * @function renderFooter
   * @description Renderiza o rodapé do modal com botões de navegação
   */
  const renderFooter = () => {
    if (!modalState.type) return null;

    return (
      <DialogFooter className="flex flex-row items-center justify-between gap-2">
        {/* Botão Voltar (exceto no nível group) */}
        <div className="flex flex-row gap-2">
          {modalState.type !== 'group' && (
            <Button
              variant="outline"
              onClick={goBack}
              className="bg-primary text-primary-foreground hover:bg-primary/70"
            >
              Voltar
            </Button>
          )}
        </div>

        {/* Botão Checkout Forçado (apenas para reservas ativas) */}
        <div className="flex flex-row gap-2">
          {modalState.type === 'reserva' &&
            modalState.data.reserva.status !== 'CONCLUIDA' &&
            modalState.data.reserva.status !== 'RESERVADA' &&
            modalState.data.reserva.status !== 'REMOVIDA' &&
            modalState.data.reserva.status !== 'CANCELADA' && (
              <Button
                variant="destructive"
                onClick={() => checkoutForcado(modalState.data.reserva.id)}
              >
                Checkout Forçado
              </Button>
            )}
        </div>
      </DialogFooter>
    );
  };

  return (
    <Dialog open={!!modalState.type} onOpenChange={close}>
      <DialogContent aria-describedby={undefined}>
        {renderContent()}
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
};