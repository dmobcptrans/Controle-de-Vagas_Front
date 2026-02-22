import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogradouroItem, VagaItem, ReservaItem } from './ListItems';
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
  const renderContent = () => {
    switch (modalState.type) {
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
      case 'vagasLogradouro': {
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
      case 'reserva':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Detalhes da Reserva</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {/* Reserva */}
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

              {/* Motorista */}
              <div className="space-y-1">
                <p className="font-semibold text-base">Motorista</p>
                <p>
                  <strong>Nome:</strong> {modalState.data.reserva.motoristaNome}
                </p>
              </div>

              <hr />

              {/* Veículo */}
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

              {/* Origem */}
              <div className="space-y-1">
                <p className="font-semibold text-base">Origem</p>{' '}
                {modalState.data.reserva.cidadeOrigem}
                <p>
                  {/* <strong>Nome:</strong> {' '} {modalState.data.reserva.origem} */}
                </p>
              </div>

              <hr />

              {/* Entrada */}
              <div className="space-y-1">
                <p className="font-semibold text-base">Entrada</p>{' '}
                {modalState.data.reserva.entradaCidade}
                <p>
                  {/* <strong>Nome:</strong> {''} {modalState.data.reserva.entrada} */}
                </p>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => {
    if (!modalState.type) return null;

    return (
      <DialogFooter className="flex flex-row items-center justify-between gap-2">
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
