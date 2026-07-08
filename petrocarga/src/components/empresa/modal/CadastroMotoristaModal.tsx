'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Loader2,
  UserRoundPlus,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import FormItem from '@/components/form/form-item';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
import { addMotoristaEmpresa } from '@/services/api/motoristaApi';
import { useAuth } from '@/components/hooks/useAuth';

const TIPO_CNH_OPTIONS = [
  { value: 'A', label: 'A — Motocicletas' },
  { value: 'B', label: 'B — Carros de passeio' },
  { value: 'AB', label: 'AB — Moto e carro' },
  { value: 'C', label: 'C — Caminhões' },
  { value: 'D', label: 'D — Ônibus' },
  { value: 'E', label: 'E — Carretas' },
];

interface CadastroMotoristaModalProps {
  empresaId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CadastroMotoristaModal({
  empresaId,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: CadastroMotoristaModalProps) {
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
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [numeroCnh, setNumeroCnh] = useState('');
  const [tipoCnh, setTipoCnh] = useState('');
  const [dataValidadeCnh, setDataValidadeCnh] = useState('');

  // Validações por Etapa
  const emailValido = email.length === 0 || EMAIL_REGEX.test(email);
  const isStep1Valid =
    nome.trim().length > 2 &&
    telefone.length >= 10 &&
    email.length > 0 &&
    emailValido;
  const isStep2Valid = cpf.length === 11 && numeroCnh.length >= 9;
  const isStep3Valid = !!tipoCnh && !!dataValidadeCnh;
  const podeEnviar = isStep1Valid && isStep2Valid && isStep3Valid;

  const cpfHint = useMemo(() => {
    if (cpf.length > 0 && cpf.length < 11)
      return `Faltam ${11 - cpf.length} dígitos`;
    return null;
  }, [cpf]);

  const dataMinima = useMemo(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }, []);

  function resetForm() {
    setStep(1);
    setNome('');
    setTelefone('');
    setEmail('');
    setCpf('');
    setNumeroCnh('');
    setTipoCnh('');
    setDataValidadeCnh('');
  }

  function fecharModal() {
    if (isPending) return;
    resetForm();
    setOpen(false);
  }

  function formatarTelefone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  async function handleAction(formData: FormData) {
    if (!user) {
      toast.error('Usuário não autenticado. Faça login novamente.');
      return;
    }
    if (!empresaId) {
      toast.error('Empresa não identificada. Recarregue a página.');
      return;
    }
    if (!podeEnviar) {
      toast.error('Preencha todos os campos obrigatórios para prosseguir.');
      return;
    }

    formData.set('nome', nome.trim());
    formData.set('telefone', telefone.replace(/\D/g, ''));
    formData.set('email', email.trim());
    formData.set('cpf', cpf);
    formData.set('numeroCnh', numeroCnh);
    formData.set('tipoCnh', tipoCnh);
    formData.set('dataValidadeCnh', dataValidadeCnh);
    formData.append('usuarioId', user.id);

    startTransition(async () => {
      try {
        const result = await addMotoristaEmpresa(empresaId, formData);
        if (result?.error) {
          toast.error(result.message || 'Erro ao cadastrar motorista');
          return;
        }
        toast.success(result?.message || 'Motorista cadastrado com sucesso!');
        setStep(4);
        onSuccess?.();
      } catch {
        toast.error('Erro inesperado ao cadastrar motorista.');
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
                      <UserRoundPlus className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                        Cadastrar motorista
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Etapa {step} de 4 —{' '}
                        {step === 4
                          ? 'Cadastro concluído.'
                          : 'Adicione as informações do condutor.'}
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
                  {[1, 2, 3, 4].map((s) => (
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
                {/* ETAPA 1: Dados Pessoais */}
                {step === 1 && (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    <FormItem
                      name="Nome completo"
                      description="Ex: João da Silva"
                    >
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="João da Silva"
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                        required
                      />
                    </FormItem>

                    <FormItem name="Telefone" description="Ex: (21) 99999-0000">
                      <Input
                        id="telefone"
                        value={telefone}
                        onChange={(e) =>
                          setTelefone(formatarTelefone(e.target.value))
                        }
                        placeholder="(21) 99999-0000"
                        inputMode="numeric"
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                        required
                      />
                    </FormItem>

                    <FormItem name="E-mail" description="Ex: joao@empresa.com">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="joao@empresa.com"
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                        required
                      />
                      {!emailValido && email.length > 0 && (
                        <p className="text-xs font-medium text-amber-700 mt-1">
                          Informe um e-mail válido
                        </p>
                      )}
                    </FormItem>
                  </div>
                )}

                {/* ETAPA 2: Documentos */}
                {step === 2 && (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label
                        htmlFor="cpf"
                        className="text-xs font-medium text-gray-600"
                      >
                        CPF do motorista
                      </Label>
                      <Input
                        id="cpf"
                        value={cpf}
                        onChange={(e) =>
                          setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))
                        }
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                      />
                      {cpfHint && (
                        <div className="bg-amber-50/60 px-3 py-2 rounded-xl border border-amber-100/50">
                          <p className="text-xs font-medium text-amber-700">
                            {cpfHint}
                          </p>
                        </div>
                      )}
                    </div>

                    <FormItem
                      name="Número da CNH"
                      description="Número de registro da habilitação"
                    >
                      <Input
                        id="numeroCnh"
                        value={numeroCnh}
                        onChange={(e) =>
                          setNumeroCnh(
                            e.target.value.replace(/\D/g, '').slice(0, 11),
                          )
                        }
                        placeholder="00000000000"
                        inputMode="numeric"
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                      />
                    </FormItem>
                  </div>
                )}

                {/* ETAPA 3: CNH */}
                {step === 3 && (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    <FormItem
                      name="Categoria da CNH"
                      description="Categoria habilitada"
                    >
                      <SelecaoCustomizada
                        id="tipoCnh"
                        name="tipoCnh"
                        placeholder="Selecione a categoria"
                        value={tipoCnh}
                        onChange={setTipoCnh}
                        options={TIPO_CNH_OPTIONS}
                      />
                    </FormItem>

                    <FormItem
                      name="Validade da CNH"
                      description="Data de vencimento da habilitação"
                    >
                      <Input
                        id="dataValidadeCnh"
                        type="date"
                        value={dataValidadeCnh}
                        min={dataMinima}
                        onChange={(e) => setDataValidadeCnh(e.target.value)}
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600 transition-all"
                        required
                      />
                    </FormItem>
                  </div>
                )}
                {/* ETAPA 4: SUCESSO */}
                {step === 4 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-9 h-9 text-green-600" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      Motorista cadastrado com sucesso!
                    </h3>

                    <p className="mt-3 max-w-md text-sm leading-6 text-gray-600">
                      Enviamos um <strong>e-mail de ativação</strong> para o
                      endereço informado. O motorista deverá acessar esse e-mail
                      e ativar sua conta para concluir o cadastro.
                    </p>

                    <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-amber-600" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-amber-900">
                            Importante
                          </p>

                          <p className="mt-1 text-sm leading-6 text-amber-800">
                            Enquanto a conta não for ativada pelo motorista,
                            <strong>
                              {' '}
                              ele não aparecerá na lista de motoristas da
                              empresa
                            </strong>{' '}
                            e também não poderá acessar o sistema.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé Dinâmico */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 items-center shrink-0">
                {step === 4 ? (
                  <Button
                    type="button"
                    onClick={fecharModal}
                    className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-[180px]"
                  >
                    Entendi
                  </Button>
                ) : (
                  <>
                    {/* Cancelar / Voltar */}
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

                    {/* Avançar / Salvar */}
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
                            Salvar motorista
                          </span>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
