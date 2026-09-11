'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Loader2,
  TruckIcon,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import FormItem from '@/components/form/form-item';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
import { addVeiculo } from '@/features/veiculos/services/veiculoApi';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';

const TIPO_OPTIONS = [
  { value: 'AUTOMOVEL', label: 'Carro — até 5 metros' },
  { value: 'CAMINHONETA', label: 'Caminhonete — até 6 metros' },
  { value: 'VUC', label: 'VUC — até 8 metros' },
  { value: 'CAMINHAO_MEDIO', label: 'Caminhão médio — 9 a 12 metros' },
  { value: 'CAMINHAO_LONGO', label: 'Caminhão longo — 13 a 19 metros' },
];

interface CadastroVeiculoModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CadastroVeiculoModal({
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: CadastroVeiculoModalProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Controle do Modal
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // Estados do Formulário e Etapas
  const [step, setStep] = useState(1);
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [tipo, setTipo] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');

  // Validações por Etapa
  const documentoValido =
    tipoPessoa === 'PF' ? cpf.length === 11 : cnpj.length === 14;

  const isStep1Valid = documentoValido;
  const isStep2Valid = placa.trim().length === 7 && tipo;
  const isStep3Valid = marca.trim() && modelo.trim();
  const podeEnviar = isStep1Valid && isStep2Valid && isStep3Valid;

  const docHint = useMemo(() => {
    if (tipoPessoa === 'PF' && cpf.length > 0 && cpf.length < 11)
      return `Faltam ${11 - cpf.length} dígitos`;
    if (tipoPessoa === 'PJ' && cnpj.length > 0 && cnpj.length < 14)
      return `Faltam ${14 - cnpj.length} dígitos`;
    return null;
  }, [cpf, cnpj, tipoPessoa]);

  function resetForm() {
    setStep(1);
    setTipoPessoa('PF');
    setPlaca('');
    setMarca('');
    setModelo('');
    setTipo('');
    setCpf('');
    setCnpj('');
  }

  function fecharModal() {
    if (isPending) return;
    resetForm();
    setOpen(false);
  }

  const handleTipoPessoaChange = (tipoSelected: 'PF' | 'PJ') => {
    setTipoPessoa(tipoSelected);
    if (tipoSelected === 'PF') setCnpj('');
    if (tipoSelected === 'PJ') setCpf('');
  };

  async function handleAction(formData: FormData) {
    if (!user) {
      toast.error('Usuário não autenticado. Faça login novamente.');
      return;
    }
    if (!documentoValido) {
      toast.error('Informe um documento válido para prosseguir.');
      return;
    }

    formData.set('placa', placa.toUpperCase());
    formData.set('tipo', tipo);
    formData.set('cpfProprietario', cpf);
    formData.set('cnpjProprietario', cnpj);
    formData.append('usuarioId', user.id);

    startTransition(async () => {
      try {
        const result = await addVeiculo(formData);
        if (result?.error) {
          toast.error(result.message || 'Erro ao cadastrar veículo');
          return;
        }
        toast.success(result?.message || 'Veículo cadastrado com sucesso!');
        fecharModal();
        onSuccess?.();
      } catch {
        toast.error('Erro inesperado ao cadastrar veículo.');
      }
    });
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity duration-300">
          {/* Caixa do Modal */}
          <div
            className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-2xl overflow-hidden transform transition-all max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              action={handleAction}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Cabeçalho */}
              <div className="px-6 py-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100/50">
                      <TruckIcon className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                        Cadastrar veículo
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Etapa {step} de 3 — Adicione as informações da frota.
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

                {/* Barra de Progresso Progressiva */}
                <div className="flex items-center gap-2 w-full mt-4">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        s <= step ? 'bg-blue-600' : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Corpo Dinâmico (Conteúdo por Etapa) */}
              <div className="flex-1 px-6 py-6 overflow-y-auto custom-scrollbar space-y-5">
                {/* ETAPA 1: Identificação do Proprietário */}
                {step === 1 && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Tipo de Proprietário
                      </Label>
                      {/* Seletor Estilo Abas Clean */}
                      <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/50">
                        <button
                          type="button"
                          onClick={() => handleTipoPessoaChange('PF')}
                          className={`py-2 text-sm font-medium rounded-lg transition-all ${
                            tipoPessoa === 'PF'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          Pessoa Física
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTipoPessoaChange('PJ')}
                          className={`py-2 text-sm font-medium rounded-lg transition-all ${
                            tipoPessoa === 'PJ'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          Pessoa Jurídica
                        </button>
                      </div>
                    </div>

                    {tipoPessoa === 'PF' ? (
                      <div className="space-y-2 transition-all">
                        <Label
                          htmlFor="cpfProprietario"
                          className="text-xs font-medium text-gray-600"
                        >
                          CPF do Proprietário
                        </Label>
                        <Input
                          id="cpfProprietario"
                          value={cpf}
                          onChange={(e) =>
                            setCpf(
                              e.target.value.replace(/\D/g, '').slice(0, 11),
                            )
                          }
                          placeholder="000.000.000-00"
                          inputMode="numeric"
                          className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 transition-all">
                        <Label
                          htmlFor="cnpjProprietario"
                          className="text-xs font-medium text-gray-600"
                        >
                          CNPJ do Proprietário
                        </Label>
                        <Input
                          id="cnpjProprietario"
                          value={cnpj}
                          onChange={(e) =>
                            setCnpj(
                              e.target.value.replace(/\D/g, '').slice(0, 14),
                            )
                          }
                          placeholder="00.000.000/0001-00"
                          inputMode="numeric"
                          className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                        />
                      </div>
                    )}

                    {docHint && (
                      <div className="bg-amber-50/60 px-3 py-2 rounded-xl border border-amber-100/50">
                        <p className="text-xs font-medium text-amber-700">
                          {docHint}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ETAPA 2: Dados Principais do Veículo */}
                {step === 2 && (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    <FormItem name="Placa" description="Ex: KLD2J19">
                      <Input
                        id="placa"
                        name="placa"
                        value={placa}
                        onChange={(e) =>
                          setPlaca(e.target.value.toUpperCase().slice(0, 7))
                        }
                        placeholder="KLD2J19"
                        className="rounded-xl h-11 uppercase tracking-wider font-medium border-gray-200 focus-visible:ring-blue-600 transition-all"
                        required
                      />
                    </FormItem>

                    <FormItem name="Tipo" description="Porte do veículo">
                      <SelecaoCustomizada
                        id="tipo"
                        name="tipo"
                        placeholder="Selecione o tipo"
                        value={tipo}
                        onChange={setTipo}
                        options={TIPO_OPTIONS}
                      />
                    </FormItem>
                  </div>
                )}

                {/* ETAPA 3: Marca e Modelo */}
                {step === 3 && (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    <FormItem name="Marca" description="Ex: Ford">
                      <Input
                        id="marca"
                        name="marca"
                        value={marca}
                        onChange={(e) => setMarca(e.target.value)}
                        placeholder="Ford"
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                        required
                      />
                    </FormItem>

                    <FormItem name="Modelo" description="Ex: Fiesta">
                      <Input
                        id="modelo"
                        name="modelo"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        placeholder="Fiesta"
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                        required
                      />
                    </FormItem>
                  </div>
                )}
              </div>

              {/* Rodapé Dinâmico */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 items-center shrink-0">
                {/* Botão Voltar ou Cancelar */}
                {step === 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:w-auto rounded-xl font-medium text-gray-500 hover:text-gray-700 transition-all"
                    disabled={isPending}
                    onClick={fecharModal}
                  >
                    Cancelar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl font-medium border-gray-200 text-gray-600 transition-all"
                    disabled={isPending}
                    onClick={() => setStep((prev) => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1.5" />
                    Voltar
                  </Button>
                )}

                {/* Botões de Avançar ou Salvar */}
                {step < 3 ? (
                  <Button
                    type="button"
                    disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                    onClick={() => setStep((prev) => prev + 1)}
                    className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-[140px] shadow-sm transition-all"
                  >
                    Avançar
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isPending || !podeEnviar}
                    className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-[160px] shadow-sm transition-all disabled:opacity-40"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin opacity-80" />
                        Salvando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                        Salvar veículo
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
