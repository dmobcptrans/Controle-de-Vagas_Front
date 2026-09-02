'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Loader2,
  UserRoundPlus,
  X,
} from 'lucide-react';

import { gerarConviteMotoristaEmpresa } from '@/services/api/conviteMotoristaApi';

interface CadastroMotoristaModalProps {
  empresaId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function GerarConviteMotoristaModal({
  empresaId,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: CadastroMotoristaModalProps) {
  const [isPending, startTransition] = useTransition();

  // Controle do modal
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }

    onOpenChange?.(next);
  };

  // Dados do convite
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const emailValido = email.length === 0 || EMAIL_REGEX.test(email);

  const podeEnviar =
    nome.trim().length > 2 &&
    email.trim().length > 0 &&
    emailValido;

  function resetForm() {
    setNome('');
    setEmail('');
  }

  function fecharModal() {
    if (isPending) return;

    resetForm();
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!empresaId) {
      toast.error('Empresa não identificada. Recarregue a página.');
      return;
    }

    if (!podeEnviar) {
      toast.error('Informe um nome e um e-mail válido.');
      return;
    }

    const payload = {
      nomeMotorista: nome.trim(),
      emailMotorista: email.trim().toLowerCase(),
    };

    startTransition(async () => {
      try {
        const result = await gerarConviteMotoristaEmpresa(
          empresaId,
          payload,
        );

        if (result.error) {
          toast.error(
            result.message || 'Erro ao enviar convite para motorista',
          );
          return;
        }

        toast.success(
          result.message || 'Convite enviado com sucesso!',
        );

        onSuccess?.();

        resetForm();
        setOpen(false);
      } catch {
        toast.error('Erro inesperado ao enviar convite.');
      }
    });
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div
            className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col"
            >
              {/* Cabeçalho */}
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100/50">
                      <UserRoundPlus className="w-5 h-5 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                        Convidar motorista
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Envie um convite para o motorista se vincular à empresa.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fecharModal}
                    disabled={isPending}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Fechar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Corpo */}
              <div className="px-6 py-6 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="nomeMotorista"
                    className="text-xs font-medium text-gray-600"
                  >
                    Nome do motorista
                  </label>

                  <Input
                    id="nomeMotorista"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="João da Silva"
                    className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600"
                    disabled={isPending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="emailMotorista"
                    className="text-xs font-medium text-gray-600"
                  >
                    E-mail do motorista
                  </label>

                  <Input
                    id="emailMotorista"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@email.com"
                    className="rounded-xl h-11 border-gray-200 focus-visible:ring-blue-600"
                    disabled={isPending}
                    required
                  />

                  {!emailValido && email.length > 0 && (
                    <p className="text-xs font-medium text-amber-700">
                      Informe um e-mail válido.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-sm text-blue-800 leading-6">
                    O motorista receberá um convite por e-mail para
                    aceitar ou recusar o vínculo com a empresa.
                  </p>
                </div>
              </div>

              {/* Rodapé */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto rounded-xl font-medium text-gray-500"
                  disabled={isPending}
                  onClick={fecharModal}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isPending || !podeEnviar}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-[160px] shadow-sm"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                      Enviar convite
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}