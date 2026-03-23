import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Disponibilidade } from '@/lib/types/disponibilidadeVagas';

/**
 * Estados do modal para navegação hierárquica
 * - GRUPO_LISTA: Lista de logradouros agrupados
 * - VAGAS_LISTA: Lista de vagas de um logradouro
 * - EDITAR_INDIVIDUAL: Formulário de edição de vaga específica
 * - EDITAR_GRUPO: Formulário de edição em lote para logradouro
 * - INICIAL: Estado inicial padrão
 */
type ModalStep =
  | { type: 'GRUPO_LISTA'; data: Record<string, Disponibilidade[]> }
  | {
      type: 'VAGAS_LISTA';
      data: { logradouro: string; vagas: Disponibilidade[] };
    }
  | {
      type: 'EDITAR_INDIVIDUAL';
      data: { id: string; vagaId: string; inicio: string; fim: string };
    }
  | {
      type: 'EDITAR_GRUPO';
      data: { logradouro: string; vagas: Disponibilidade[] };
    }
  | { type: 'INICIAL'; data: null };

interface EditarModalProps {
  open: boolean;
  onClose: () => void;
  gruposAgrupados: Record<string, Disponibilidade[]> | null;

  // Ações passadas do useDisponibilidadeActions
  onEditarIntervalo: (
    id: string,
    vagaId: string,
    inicio: string,
    fim: string,
  ) => void;
  onRemoverVaga: (id: string) => void;
}

/**
 * @component EditarModal
 * @version 1.0.0
 * 
 * @description Modal de edição de disponibilidades com navegação hierárquica.
 * Permite visualizar logradouros, vagas, editar individualmente ou em grupo.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO DE NAVEGAÇÃO:
 * ----------------------------------------------------------------------------
 * 
 * 1. GRUPO_LISTA (Nível 1 - Logradouros):
 *    - Exibe lista de logradouros com disponibilidades
 *    - Cada item mostra contagem de vagas
 *    - Botão "Ver Vagas" navega para VAGAS_LISTA
 * 
 * 2. VAGAS_LISTA (Nível 2 - Vagas do logradouro):
 *    - Exibe todas as vagas do logradouro selecionado
 *    - Cada vaga tem botões "Editar" e "Remover"
 *    - "Editar" navega para EDITAR_INDIVIDUAL
 *    - "Remover" chama onRemoverVaga e fecha modal
 * 
 * 3. EDITAR_INDIVIDUAL (Nível 3 - Edição de vaga):
 *    - Formulário com campos de data (início e fim)
 *    - Botão "Salvar" chama onEditarIntervalo e volta para GRUPO_LISTA
 * 
 * 4. EDITAR_GRUPO (Nível 3 - Edição em lote):
 *    - Formulário para editar todas as vagas do logradouro
 *    - Aviso sobre aplicação das datas em todas as vagas
 *    - Botão "Salvar Grupo" chama onEditarIntervalo para cada vaga
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - NAVEGAÇÃO HIERÁRQUICA: ModalState controla qual tela está visível
 * - GO BACK: Volta para nível anterior (GRUPO_LISTA)
 * - FORMATO DE DATA: Converte ISO para YYYY-MM-DD para inputs type="date"
 * - CLEANUP: Reseta estado ao abrir/fechar modal
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Dialog: Componente de modal do shadcn/ui
 * - Disponibilidade: Tipo de disponibilidade
 * 
 * @example
 * ```tsx
 * <EditarModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   gruposAgrupados={disponibilidadesAgrupadas}
 *   onEditarIntervalo={editarIntervalo}
 *   onRemoverVaga={removerVaga}
 * />
 * ```
 */

export function EditarModal({
  open,
  onClose,
  gruposAgrupados,
  onEditarIntervalo,
  onRemoverVaga,
}: EditarModalProps) {
  // ==================== ESTADOS ====================
  const [modalState, setModalState] = useState<ModalStep>({
    type: 'INICIAL',
    data: null,
  });

  const [editing, setEditing] = useState({
    id: '',
    vagaId: '',
    inicio: '',
    fim: '',
  });

  const formatDateForInput = (iso: string) => iso.split('T')[0];

  // ==================== FUNÇÃO AUXILIAR ====================
  const nomeVagaouVagas = (quantidade: number): string => {
    if (quantidade > 1) return 'VAGAS';
    return 'VAGA';
  };

  // ==================== INICIALIZAÇÃO/RESET ====================
  useEffect(() => {
    if (open) {
      if (gruposAgrupados && Object.keys(gruposAgrupados).length > 0) {
        setModalState({ type: 'GRUPO_LISTA', data: gruposAgrupados });
      } else {
        setModalState({ type: 'INICIAL', data: null });
      }
      setEditing({ id: '', vagaId: '', inicio: '', fim: '' });
    }
  }, [open, gruposAgrupados]);

  // Atualiza os inputs ao entrar no modo editar
  useEffect(() => {
    if (modalState.type === 'EDITAR_INDIVIDUAL' && modalState.data) {
      setEditing({
        id: modalState.data.id,
        vagaId: modalState.data.vagaId,
        inicio: formatDateForInput(modalState.data.inicio),
        fim: formatDateForInput(modalState.data.fim),
      });
    } else if (modalState.type === 'EDITAR_GRUPO' && modalState.data) {
      const primeiraDisp = modalState.data.vagas[0];
      setEditing({
        id: '',
        vagaId: '',
        inicio: formatDateForInput(primeiraDisp.inicio),
        fim: formatDateForInput(primeiraDisp.fim),
      });
    }
  }, [modalState]);

  // ==================== NAVEGAÇÃO INTERNA ====================
  const goBack = () => {
    if (
      modalState.type === 'VAGAS_LISTA' ||
      modalState.type === 'EDITAR_GRUPO'
    ) {
      setModalState({ type: 'GRUPO_LISTA', data: gruposAgrupados! });
    } else if (modalState.type === 'EDITAR_INDIVIDUAL' && modalState.data) {
      setModalState({ type: 'GRUPO_LISTA', data: gruposAgrupados! });
    }
  };

  // ==================== FUNÇÕES DE SALVAMENTO ====================
  const salvarEdicaoIndividual = () => {
    if (modalState.type !== 'EDITAR_INDIVIDUAL') return;

    const inicioISO = `${editing.inicio}T00:00:00-03:00`;
    const fimISO = `${editing.fim}T23:59:00-03:00`;

    onEditarIntervalo(editing.id, editing.vagaId, inicioISO, fimISO);
    goBack();
  };

  const salvarEdicaoGrupo = () => {
    if (modalState.type !== 'EDITAR_GRUPO') return;

    const inicioISO = `${editing.inicio}`;
    const fimISO = `${editing.fim}`;

    // Chama a ação de edição para CADA disponibilidade do grupo
    modalState.data.vagas.forEach((v) => {
      onEditarIntervalo(v.id, v.vagaId, inicioISO, fimISO);
    });

    goBack();
  };

  // ==================== RENDERIZAÇÃO DINÂMICA ====================
  const renderContent = () => {
    switch (modalState.type) {
      // ==================== NÍVEL 1: GRUPO_LISTA ====================
      case 'GRUPO_LISTA':
        if (!modalState.data) return <p>Nenhum dado de grupo encontrado.</p>;

        return (
          <>
            <DialogHeader>
              <DialogTitle>Disponibilidades — Logradouros</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {Object.entries(modalState.data).map(([logradouro, vagas]) => (
                <div
                  key={logradouro}
                  className="border p-3 flex flex-col sm:flex-row justify-between rounded items-start sm:items-center"
                >
                  <p className="font-medium mb-2 sm:mb-0">
                    {logradouro} ({vagas.length}{' '}
                    {nomeVagaouVagas(vagas.length)})
                  </p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        setModalState({
                          type: 'VAGAS_LISTA',
                          data: { logradouro, vagas },
                        })
                      }
                    >
                      Ver Vagas
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      // ==================== NÍVEL 2: VAGAS_LISTA ====================
      case 'VAGAS_LISTA':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Vagas — {modalState.data.logradouro}</DialogTitle>
            </DialogHeader>

            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {modalState.data.vagas.map((v) => (
                <div
                  key={v.id}
                  className="flex justify-between p-2 border rounded"
                >
                  <p className="font-medium">
                    {v.endereco.logradouro}, {v.numeroEndereco}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        setModalState({
                          type: 'EDITAR_INDIVIDUAL',
                          data: {
                            id: v.id,
                            vagaId: v.vagaId,
                            inicio: v.inicio,
                            fim: v.fim,
                          },
                        })
                      }
                    >
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        onRemoverVaga(v.id);
                        onClose();
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      // ==================== NÍVEL 3: EDITAR_INDIVIDUAL ====================
      case 'EDITAR_INDIVIDUAL':
        const disp = modalState.data;
        return (
          <>
            <DialogHeader>
              <DialogTitle>Editar Disponibilidade Individual</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-600 mb-2">Vaga ID: {disp.vagaId}</p>

            <div className="grid grid-cols-2 gap-4 p-2">
              <div>
                <label className="text-sm font-medium block mb-1">Início</label>
                <input
                  type="date"
                  value={editing.inicio}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, inicio: e.target.value }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Fim</label>
                <input
                  type="date"
                  value={editing.fim}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, fim: e.target.value }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 p-2 justify-end">
              <Button onClick={salvarEdicaoIndividual}>Salvar</Button>
            </div>
          </>
        );

      // ==================== NÍVEL 3: EDITAR_GRUPO ====================
      case 'EDITAR_GRUPO':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Editar Grupo — {modalState.data.logradouro}</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-red-600 font-semibold mb-2">
              Atenção: Isso irá aplicar as mesmas datas para as{' '}
              {modalState.data.vagas.length} vagas neste logradouro.
            </p>

            <div className="grid grid-cols-2 gap-4 p-2">
              <div>
                <label className="text-sm font-medium block mb-1">Início</label>
                <input
                  type="date"
                  value={editing.inicio}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, inicio: e.target.value }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Fim</label>
                <input
                  type="date"
                  value={editing.fim}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, fim: e.target.value }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 p-2 justify-end">
              <Button onClick={salvarEdicaoGrupo}>Salvar Grupo</Button>
            </div>
          </>
        );

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-lg font-medium text-gray-700">Carregando...</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[min(900px,95%)] overflow-auto">
        {renderContent()}

        <DialogFooter className="flex justify-between items-center mt-4">
          {/* Botão Voltar: visível em todos os estados exceto o inicial */}
          {modalState.type === 'VAGAS_LISTA' ||
          modalState.type.startsWith('EDITAR') ? (
            <Button variant="outline" onClick={goBack}>
              Voltar
            </Button>
          ) : (
            <div />
          )}

          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}