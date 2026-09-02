'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

import toast from 'react-hot-toast';

import {
  CheckCircle2,
  Loader2,
  Link2,
  X,
  TruckIcon,
  Search,
  Check,
} from 'lucide-react';

import { getVeiculosUsuario } from '@/services/api/veiculoApi';

import {
  getVeiculosVinculadosMotoristaEmpresa,
  vincularVeiculoMotoristaEmpresa,
} from '@/services/api/empresaApi';

import { Veiculo } from '@/lib/types/veiculo';

interface VincularVeiculoMotoristaModalProps {
  empresaId: string;
  motoristaId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const TAMANHO_PAGINA_VEICULOS = 5;

export default function VincularVeiculoMotoristaModal({
  empresaId,
  motoristaId,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: VincularVeiculoMotoristaModalProps) {
  const [isPending, startTransition] = useTransition();

  // ============================================================
  // CONTROLE DO MODAL
  // ============================================================

  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;

  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }

    onOpenChange?.(next);
  };

  // ============================================================
  // VEÍCULOS
  // ============================================================

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  const [loadingVeiculos, setLoadingVeiculos] = useState(false);

  // IDs dos veículos que já estão vinculados ao motorista
  const [veiculosVinculados, setVeiculosVinculados] = useState<Set<string>>(
    new Set(),
  );

  const [loadingVinculados, setLoadingVinculados] = useState(false);

  // ============================================================
  // PAGINAÇÃO
  // ============================================================

  const [paginaVeiculos, setPaginaVeiculos] = useState(0);

  const [totalPaginasVeiculos, setTotalPaginasVeiculos] = useState(0);

  // ============================================================
  // SELEÇÃO
  // ============================================================

  const [veiculoId, setVeiculoId] = useState('');

  // ============================================================
  // BUSCA POR PLACA
  // ============================================================

  const [busca, setBusca] = useState('');

  const [filtroPlaca, setFiltroPlaca] = useState('');

  const buscaInputRef = useRef<HTMLInputElement>(null);

  const podeEnviar =
    Boolean(veiculoId) &&
    Boolean(motoristaId) &&
    !veiculosVinculados.has(veiculoId);

  // ============================================================
  // CARREGAR VEÍCULOS VINCULADOS AO MOTORISTA
  // ============================================================

  useEffect(() => {
    if (!open || !empresaId || !motoristaId) {
      return;
    }

    let ativo = true;

    const carregarVeiculosVinculados = async () => {
      setLoadingVinculados(true);

      try {
        const result = await getVeiculosVinculadosMotoristaEmpresa(
          empresaId,
          motoristaId,
        );

        if (!ativo) {
          return;
        }

        const ids = new Set(
          (result?.content ?? [])
            .map((veiculo) => veiculo.id)
            .filter((id): id is string => Boolean(id)),
        );

        setVeiculosVinculados(ids);
      } catch (err: unknown) {
        if (!ativo) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar veículos vinculados';

        toast.error(message);

        setVeiculosVinculados(new Set());
      } finally {
        if (ativo) {
          setLoadingVinculados(false);
        }
      }
    };

    carregarVeiculosVinculados();

    return () => {
      ativo = false;
    };
  }, [open, empresaId, motoristaId]);

  // ============================================================
  // CARREGAR VEÍCULOS DA EMPRESA
  // ============================================================

  useEffect(() => {
    if (!open || !empresaId) {
      return;
    }

    let ativo = true;

    const carregarVeiculos = async () => {
      setLoadingVeiculos(true);

      try {
        const result = await getVeiculosUsuario(empresaId, {
          ativo: true,
          placa: filtroPlaca || undefined,
          pagina: paginaVeiculos,
          tamanhoPagina: TAMANHO_PAGINA_VEICULOS,
          ordem: 'ASC',
        });

        if (!ativo) {
          return;
        }

        setVeiculos(result.content);

        setTotalPaginasVeiculos(result.totalPaginas);
      } catch (err: unknown) {
        if (!ativo) {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Erro ao carregar veículos';

        toast.error(message);

        setVeiculos([]);

        setTotalPaginasVeiculos(0);
      } finally {
        if (ativo) {
          setLoadingVeiculos(false);
        }
      }
    };

    carregarVeiculos();

    return () => {
      ativo = false;
    };
  }, [open, empresaId, paginaVeiculos, filtroPlaca]);

  // ============================================================
  // DEBOUNCE DA BUSCA
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      const placa = busca.trim().toUpperCase();

      setVeiculoId('');

      // Sempre volta para a primeira página
      // quando a busca muda.
      setPaginaVeiculos(0);

      setFiltroPlaca(placa);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [busca, open]);

  // ============================================================
  // AUTOFOCO NA BUSCA
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      buscaInputRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [open]);

  // ============================================================
  // FECHAR COM ESC
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        fecharModal();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isPending]);

  // ============================================================
  // VEÍCULO SELECIONADO
  // ============================================================

  const veiculoSelecionado = veiculos.find((v) => v.id === veiculoId) ?? null;

  // ============================================================
  // RESET
  // ============================================================

function resetForm() {
  setVeiculoId('');
  setVeiculos([]);
  setVeiculosVinculados(new Set());
  setBusca('');
  setFiltroPlaca('');
  setPaginaVeiculos(0);
  setTotalPaginasVeiculos(0);
}

  // ============================================================
  // FECHAR MODAL
  // ============================================================

  function fecharModal() {
    if (isPending) {
      return;
    }

    resetForm();

    setOpen(false);
  }

  // ============================================================
  // VINCULAR VEÍCULO
  // ============================================================

  async function handleVincular() {
    if (!empresaId) {
      toast.error('Empresa não identificada. Faça login novamente.');

      return;
    }

    if (!motoristaId) {
      toast.error('Motorista não identificado.');

      return;
    }

    if (!veiculoId) {
      toast.error('Selecione um veículo para vincular.');

      return;
    }

    // Segurança adicional:
    // impede tentativa de vincular novamente
    // um veículo que já está vinculado.
    if (veiculosVinculados.has(veiculoId)) {
      toast.error('Este veículo já está vinculado a este motorista.');

      return;
    }

    startTransition(async () => {
      try {
        const result = await vincularVeiculoMotoristaEmpresa(
          empresaId,
          veiculoId,
          motoristaId,
        );

        if (result?.error) {
          toast.error(result.message || 'Erro ao vincular veículo');

          return;
        }

        toast.success(result?.message || 'Veículo vinculado com sucesso!');

        fecharModal();

        onSuccess?.();
      } catch {
        toast.error('Erro inesperado ao vincular veículo ao motorista.');
      }
    });
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity duration-300"
          onClick={fecharModal}
        >
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-2xl overflow-hidden transform transition-all max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* =====================================================
                CABEÇALHO
            ====================================================== */}

            <div className="px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100/50">
                    <Link2 className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                      Vincular veículo
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Selecione o veículo que será vinculado ao motorista.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fecharModal}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* =====================================================
                CORPO
            ====================================================== */}

            <div className="flex-1 px-6 py-5 overflow-y-auto custom-scrollbar space-y-4">
              {/* BUSCA POR PLACA */}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                <input
                  ref={buscaInputRef}
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por placa..."
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 uppercase"
                />

                {busca && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusca('');
                      setFiltroPlaca('');
                      setPaginaVeiculos(0);
                      setVeiculoId('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Limpar busca"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* INDICAÇÃO DA BUSCA */}

              {filtroPlaca && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  <Search className="w-3.5 h-3.5 shrink-0" />

                  <span>
                    Buscando placa: <strong>{filtroPlaca}</strong>
                  </span>
                </div>
              )}

              {/* LOADING */}

              {loadingVeiculos || loadingVinculados ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />

                  <p className="text-sm">
                    {loadingVinculados
                      ? 'Verificando veículos vinculados...'
                      : 'Carregando veículos...'}
                  </p>
                </div>
              ) : veiculos.length === 0 ? (
                /* NENHUM VEÍCULO */

                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <TruckIcon className="w-6 h-6 text-gray-300" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {filtroPlaca
                        ? 'Nenhum veículo encontrado'
                        : 'Nenhum veículo cadastrado'}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {filtroPlaca
                        ? 'Nenhum veículo possui essa placa.'
                        : 'Cadastre um veículo antes de vinculá-lo a um motorista.'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* LISTA */}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-xs font-medium text-gray-500">
                        {filtroPlaca
                          ? `${veiculos.length} resultado(s)`
                          : `${veiculos.length} veículo(s)`}
                      </span>

                      {totalPaginasVeiculos > 0 && (
                        <span className="text-xs text-gray-400">
                          Página {paginaVeiculos + 1} de {totalPaginasVeiculos}
                        </span>
                      )}
                    </div>

                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar space-y-2 pr-0.5">
                      {veiculos.map((v) => {
                        const selecionado = v.id === veiculoId;
                        const jaVinculado = veiculosVinculados.has(v.id);

                        return (
                          <button
                            key={v.id}
                            type="button"
                            disabled={jaVinculado}
                            onClick={() => {
                              if (jaVinculado) return;

                              setVeiculoId(v.id);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              jaVinculado
                                ? 'border-gray-200 bg-gray-100/70 opacity-50 cursor-not-allowed'
                                : selecionado
                                  ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div
                              className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border ${
                                jaVinculado
                                  ? 'bg-gray-100 border-gray-200'
                                  : selecionado
                                    ? 'bg-blue-100 border-blue-200'
                                    : 'bg-gray-50 border-gray-100'
                              }`}
                            >
                              <TruckIcon
                                className={`w-5 h-5 ${
                                  jaVinculado
                                    ? 'text-gray-400'
                                    : selecionado
                                      ? 'text-blue-600'
                                      : 'text-gray-400'
                                }`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold tracking-wide ${
                                  jaVinculado
                                    ? 'text-gray-500'
                                    : 'text-gray-900'
                                }`}
                              >
                                {v.placa}
                              </p>

                              <p
                                className={`text-xs truncate ${
                                  jaVinculado
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                }`}
                              >
                                {v.marca} {v.modelo}
                              </p>

                              {jaVinculado && (
                                <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                                  Já vinculado
                                </p>
                              )}
                            </div>

                            {jaVinculado ? (
                              <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" />
                            ) : (
                              selecionado && (
                                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                              )
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PAGINAÇÃO */}

                  {totalPaginasVeiculos > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          loadingVeiculos ||
                          loadingVinculados ||
                          paginaVeiculos === 0
                        }
                        onClick={() => {
                          setVeiculoId('');

                          setPaginaVeiculos((prev) => prev - 1);
                        }}
                        className="rounded-lg"
                      >
                        Anterior
                      </Button>

                      <span className="text-xs text-gray-500">
                        {paginaVeiculos + 1} / {totalPaginasVeiculos}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          loadingVeiculos ||
                          loadingVinculados ||
                          paginaVeiculos >= totalPaginasVeiculos - 1
                        }
                        onClick={() => {
                          setVeiculoId('');

                          setPaginaVeiculos((prev) => prev + 1);
                        }}
                        className="rounded-lg"
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* =====================================================
                RODAPÉ
            ====================================================== */}

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col gap-3 shrink-0">
              {veiculoSelecionado && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-100 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />

                  <span>
                    Vincular{' '}
                    <span className="font-semibold text-gray-900">
                      {veiculoSelecionado.placa}
                    </span>{' '}
                    ao motorista
                  </span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto rounded-xl font-medium text-gray-500 hover:text-gray-700 transition-all"
                  disabled={isPending}
                  onClick={fecharModal}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  disabled={
                    isPending ||
                    !podeEnviar ||
                    loadingVeiculos ||
                    loadingVinculados
                  }
                  onClick={handleVincular}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-[160px] shadow-sm transition-all disabled:opacity-40"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin opacity-80" />
                      Vinculando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                      Vincular veículo
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
