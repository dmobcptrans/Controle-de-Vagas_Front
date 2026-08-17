'use client';

import React, { useState, useTransition, useEffect, useMemo, useRef } from 'react';
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
import {
  getVeiculosUsuario,
} from '@/services/api/veiculoApi';
import { vincularVeiculoMotoristaEmpresa } from '@/services/api/empresaApi';
import { Veiculo } from '@/lib/types/veiculo';

interface VincularVeiculoMotoristaModalProps {
  empresaId: string;
  motoristaId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function VincularVeiculoMotoristaModal({
  empresaId,
  motoristaId,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: VincularVeiculoMotoristaModalProps) {
  const [isPending, startTransition] = useTransition();

  // Controle do Modal
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // Estados do Formulário
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);
  const [veiculoId, setVeiculoId] = useState('');
  const [busca, setBusca] = useState('');
  const buscaInputRef = useRef<HTMLInputElement>(null);

  const veiculoSelecionado = useMemo(
    () => veiculos.find((v) => v.id === veiculoId) ?? null,
    [veiculos, veiculoId],
  );

  const veiculosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return veiculos;
    return veiculos.filter((v) =>
      `${v.placa} ${v.marca} ${v.modelo}`.toLowerCase().includes(termo),
    );
  }, [veiculos, busca]);

  const podeEnviar = Boolean(veiculoId) && Boolean(motoristaId);

  useEffect(() => {
    if (!open || !empresaId) return;

    let ativo = true;
    setLoadingVeiculos(true);

    getVeiculosUsuario(empresaId)
      .then((result) => {
        if (!ativo) return;
        if (result.error) {
          toast.error(result.message || 'Erro ao carregar veículos');
          setVeiculos([]);
          return;
        }
        setVeiculos(result.veiculos as Veiculo[]);
      })
      .finally(() => {
        if (ativo) setLoadingVeiculos(false);
      });

    return () => {
      ativo = false;
    };
  }, [open, empresaId]);

  // Autofoco na busca ao abrir
  useEffect(() => {
    if (open && !loadingVeiculos && veiculos.length > 0) {
      const t = setTimeout(() => buscaInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open, loadingVeiculos, veiculos.length]);

  // Fechar com ESC
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') fecharModal();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isPending]);

  function resetForm() {
    setVeiculoId('');
    setVeiculos([]);
    setBusca('');
  }

  function fecharModal() {
    if (isPending) return;
    resetForm();
    setOpen(false);
  }

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

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity duration-300"
          onClick={fecharModal}
        >
          {/* Caixa do Modal */}
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-2xl overflow-hidden transform transition-all max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
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

            {/* Corpo */}
            <div className="flex-1 px-6 py-5 overflow-y-auto custom-scrollbar space-y-4">
              {loadingVeiculos ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-sm">Carregando veículos...</p>
                </div>
              ) : veiculos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <TruckIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Nenhum veículo encontrado
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Cadastre um veículo antes de vinculá-lo a um motorista.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      ref={buscaInputRef}
                      type="text"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por placa, marca ou modelo..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  {/* Lista de veículos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-xs font-medium text-gray-500">
                        {veiculosFiltrados.length === veiculos.length
                          ? `${veiculos.length} veículo(s) disponível(is)`
                          : `${veiculosFiltrados.length} de ${veiculos.length} veículo(s)`}
                      </span>
                    </div>

                    {veiculosFiltrados.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-gray-400">
                          Nenhum veículo corresponde à busca.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[280px] overflow-y-auto custom-scrollbar space-y-2 pr-0.5">
                        {veiculosFiltrados.map((v) => {
                          const selecionado = v.id === veiculoId;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setVeiculoId(v.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                selecionado
                                  ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div
                                className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border ${
                                  selecionado
                                    ? 'bg-blue-100 border-blue-200'
                                    : 'bg-gray-50 border-gray-100'
                                }`}
                              >
                                <TruckIcon
                                  className={`w-5 h-5 ${
                                    selecionado ? 'text-blue-600' : 'text-gray-400'
                                  }`}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 tracking-wide">
                                  {v.placa}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {v.marca} {v.modelo}
                                </p>
                              </div>

                              {selecionado && (
                                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Rodapé */}
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
                  disabled={isPending || !podeEnviar || loadingVeiculos}
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