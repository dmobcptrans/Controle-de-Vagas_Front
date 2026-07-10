'use client';

import React, { useState, useTransition, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Loader2,
  Link2,
  X,
  TruckIcon,
} from 'lucide-react';
import FormItem from '@/components/form/form-item';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
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

  const veiculoOptions = useMemo(
    () =>
      veiculos.map((v) => ({
        value: v.id,
        label: `${v.placa} — ${v.marca} ${v.modelo}`,
      })),
    [veiculos],
  );

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

  function resetForm() {
    setVeiculoId('');
    setVeiculos([]);
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity duration-300">
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
            <div className="flex-1 px-6 py-6 overflow-y-auto custom-scrollbar space-y-5">
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
                <FormItem
                  name="Veículo"
                  description="Selecione um veículo cadastrado"
                >
                  <SelecaoCustomizada
                    id="veiculoId"
                    name="veiculoId"
                    placeholder="Selecione o veículo"
                    value={veiculoId}
                    onChange={setVeiculoId}
                    options={veiculoOptions}
                  />
                </FormItem>
              )}
            </div>

            {/* Rodapé */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 items-center shrink-0">
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
      )}
    </>
  );
}