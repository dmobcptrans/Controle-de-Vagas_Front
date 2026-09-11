'use client';

import { useOnboarding } from '@/contexts/OnboardingContext';
import { useState } from 'react';
import ModalTermos from '../login/ModalTermos';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  inputCls,
  fmtCPF,
  fmtTel,
  onlyNumbers,
  ChevronDownIcon,
  CloseIcon,
  PersonIcon,
  CNHIcon,
  CheckIcon,
  EyeIcon,
} from './Onboardinghelpers';

// Lista expandida de categorias de CNH
const CNH_CATS = ['B', 'AB', 'C', 'AC', 'D', 'AD', 'E', 'AE'];

/**
 * @component OnboardingCadastroModal
 * @version 1.0.0
 *
 * @description Modal de COMPLEMENTO DE CADASTRO em 3 etapas para novos
 * usuários (motoristas). Coleta dados pessoais, CNH e aceite dos termos.
 *
 * ⚠️ IMPORTANTE: este modal NÃO possui botão de fechar nem é fechável pelo
 * clique no backdrop. O cadastro complementar é obrigatório: o modal só
 * fecha quando `submitCadastro()` é concluído com sucesso (ver
 * OnboardingContext). Não adicione um "X" ou `onClick` de fechar no overlay
 * aqui — isso é proposital.
 *
 * O cadastro de veículo NÃO faz parte deste modal — veja
 * `OnboardingVeiculoModal`, que é aberto separadamente (e esse sim pode ser
 * fechado pelo usuário).
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO (3 ETAPAS):
 * ----------------------------------------------------------------------------
 *
 * ETAPA 1 - DADOS PESSOAIS:
 *    - CPF (máscara automática)
 *    - Telefone (máscara automática)
 *    - Senha (com validação de 5 requisitos)
 *    - Confirmar senha
 *
 * ETAPA 2 - HABILITAÇÃO:
 *    - Categoria da CNH (seleção via drawer/gaveta)
 *    - Número da CNH
 *    - Data de validade
 *
 * ETAPA 3 - TERMOS E CONDIÇÕES:
 *    - Aceitação dos Termos de Uso
 *    - Modal com termos completos (ModalTermos)
 *
 * @example
 * ```tsx
 * <OnboardingCadastroModal />
 * ```
 */
export default function OnboardingCadastroModal() {
  const {
    isCadastroOpen,
    cadastroStep: step,
    data,
    updateData,
    nextCadastroStep,
    prevCadastroStep,
    submitCadastro,
  } = useOnboarding();

  const [showPassword, setShowPassword] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [exibirConfirmarSenha, setExibirConfirmarSenha] = useState(false);
  const [mostrarModalTermos, setMostrarModalTermos] = useState(false);

  // Estado para controlar a "gaveta" de seleção da CNH
  const [isCnhDrawerOpen, setIsCnhDrawerOpen] = useState(false);

  const senhasIguais = data.senha === confirmarSenha;

  if (!isCadastroOpen) return null;

  const totalSteps = 3;

  const validarSenha = (senha: string) => {
    return {
      tamanho: senha.length >= 6,
      minuscula: /[a-z]/.test(senha),
      maiuscula: /[A-Z]/.test(senha),
      numero: /[0-9]/.test(senha),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha),
    };
  };

  function ItemSenha({ ok, label }: { ok: boolean; label: string }) {
    return (
      <div
        className={`flex items-center gap-2 ${ok ? 'text-emerald-500' : 'text-gray-400'}`}
      >
        <span className="text-xs">{ok ? '✓' : '○'}</span>
        <span>{label}</span>
      </div>
    );
  }

  const requisitosSenha = validarSenha(data.senha || '');

  const senhaValida =
    requisitosSenha.tamanho &&
    requisitosSenha.minuscula &&
    requisitosSenha.maiuscula &&
    requisitosSenha.numero &&
    requisitosSenha.especial;

  const isStepValid = () => {
    if (step === 1) {
      const cpf = (data.cpf || '').replace(/\D/g, '');
      const tel = (data.telefone || '').replace(/\D/g, '');
      return (
        cpf.length >= 11 && tel.length >= 10 && senhaValida && senhasIguais
      );
    }
    if (step === 2) {
      return !!(
        data.tipoCnh &&
        data.numeroCnh?.length >= 8 &&
        data.dataValidadeCnh
      );
    }
    if (step === 3) return !!data.aceitarTermos;
    return false;
  };

  const handleNext = async () => {
    if (!isStepValid()) return;

    if (step === 3) {
      await submitCadastro();
      return;
    }
    nextCadastroStep();
  };

  const stepMeta = [
    { title: 'Dados pessoais', sub: 'Etapa 1 de 3' },
    { title: 'Habilitação', sub: 'Etapa 2 de 3' },
    { title: 'Termos e condições', sub: 'Etapa 3 de 3' },
  ];

  return (
    // ⚠️ Sem onClick no overlay — este modal não pode ser fechado clicando fora.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md sm:max-w-2xl rounded-2xl bg-white p-5 sm:p-8 shadow-xl">
        {/* Header — propositalmente sem botão de fechar (X) */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
              {step === 1 && <PersonIcon />}
              {step === 2 && <CNHIcon />}
              {step === 3 && <CheckIcon />}
            </div>
            <div>
              <h2 className="text-base font-medium text-gray-900">
                {stepMeta[step - 1].title}
              </h2>
              <p className="text-xs text-gray-400">{stepMeta[step - 1].sub}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all"
                style={{ background: s <= step ? '#3B82F6' : '#E5E7EB' }}
              />
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CPF">
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={fmtCPF(data.cpf || '')}
                onChange={(e) =>
                  updateData({
                    cpf: onlyNumbers(e.target.value).slice(0, 11),
                  })
                }
              />
            </Field>

            <Field label="Telefone">
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                value={fmtTel(data.telefone || '')}
                onChange={(e) =>
                  updateData({
                    telefone: onlyNumbers(e.target.value).slice(0, 11),
                  })
                }
              />
            </Field>

            {/* SENHA */}
            <Field label="Senha">
              <div className="relative">
                <input
                  className={`${inputCls} pr-10 ${
                    data.senha && !senhaValida ? 'border-red-500' : ''
                  }`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={data.senha || ''}
                  onChange={(e) => updateData({ senha: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon />
                </button>
              </div>
            </Field>

            {/* CONFIRMAR SENHA */}
            <Field label="Confirmar senha">
              <div className="relative">
                <input
                  className={`${inputCls} pr-10 ${
                    !senhasIguais && confirmarSenha !== ''
                      ? 'border-red-500'
                      : ''
                  }`}
                  type={exibirConfirmarSenha ? 'text' : 'password'}
                  placeholder="Digite novamente"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setExibirConfirmarSenha(!exibirConfirmarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon />
                </button>
              </div>
            </Field>

            {/* REQUISITOS DA SENHA */}
            {data.senha && (
              <div className="col-span-1 sm:col-span-2">
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    A senha deve conter:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    <ItemSenha
                      ok={requisitosSenha.tamanho}
                      label="Mínimo de 6 caracteres"
                    />
                    <ItemSenha
                      ok={requisitosSenha.minuscula}
                      label="Pelo menos uma letra minúscula"
                    />
                    <ItemSenha
                      ok={requisitosSenha.maiuscula}
                      label="Pelo menos uma letra maiúscula"
                    />
                    <ItemSenha
                      ok={requisitosSenha.numero}
                      label="Pelo menos um número"
                    />
                    <ItemSenha
                      ok={requisitosSenha.especial}
                      label="Pelo menos um caractere especial (!@#...)"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — CNH */}
        {step === 2 && (
          <div className="space-y-4">
            <Field label="Categoria da CNH">
              <button
                type="button"
                onClick={() => setIsCnhDrawerOpen(true)}
                className={inputCls}
              >
                <span
                  className={data.tipoCnh ? 'text-gray-900' : 'text-gray-400'}
                >
                  {data.tipoCnh || 'Selecione a categoria'}
                </span>
                <ChevronDownIcon />
              </button>
            </Field>

            <Field label="Número da CNH">
              <input
                className={inputCls}
                placeholder="00000000000"
                maxLength={11}
                inputMode="numeric"
                value={data.numeroCnh || ''}
                onChange={(e) =>
                  updateData({ numeroCnh: e.target.value.replace(/\D/g, '') })
                }
              />
            </Field>

            <Field label="Data de validade">
              <input
                type="date"
                className={inputCls}
                value={data.dataValidadeCnh || ''}
                onChange={(e) =>
                  updateData({ dataValidadeCnh: e.target.value })
                }
              />
            </Field>
          </div>
        )}

        {/* Step 3 — Termos */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="termos"
                checked={data.aceitarTermos}
                onCheckedChange={(checked) => {
                  updateData({ aceitarTermos: checked as boolean });
                }}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="termos"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Li e aceito os{' '}
                  <button
                    type="button"
                    onClick={() => setMostrarModalTermos(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 hover:no-underline transition-colors"
                  >
                    Termos de Uso e Política de Privacidade
                  </button>
                </label>
                <p className="text-xs text-gray-500">
                  É necessário aceitar os termos para ativar sua conta
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer — sem opção de fechar, só Voltar / Avançar */}
        <div className="mt-8 flex items-center gap-3 justify-between">
          {step > 1 && (
            <button
              onClick={prevCadastroStep}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex-1"
            >
              Voltar
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-40 flex-1"
          >
            {step === totalSteps ? 'Finalizar' : 'Próximo'}
          </button>
        </div>

        {/* GAVETA DE SELEÇÃO (CNH DRAWER) */}
        {isCnhDrawerOpen && (
          <div className="absolute inset-0 z-[60] flex flex-col bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Categorias
                </h3>
                <p className="text-xs text-gray-500">
                  Escolha uma das opções abaixo
                </p>
              </div>
              <button
                onClick={() => setIsCnhDrawerOpen(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Grid 3x3 para mostrar as opções sem scroll */}
            <div className="flex flex-1 items-center">
              <div className="grid w-full grid-cols-3 gap-4">
                {CNH_CATS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      updateData({ tipoCnh: cat });
                      setIsCnhDrawerOpen(false);
                    }}
                    className={`flex h-16 flex-col items-center justify-center rounded-xl border-2 transition-all ${
                      data.tipoCnh === cat
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-lg font-bold">{cat}</span>
                    {data.tipoCnh === cat && (
                      <div className="h-1 w-4 rounded-full bg-blue-500 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              Toque na categoria para selecionar
            </p>
          </div>
        )}
      </div>

      <ModalTermos
        open={mostrarModalTermos}
        onOpenChange={setMostrarModalTermos}
        onClose={() => setMostrarModalTermos(false)}
      />
    </div>
  );
}