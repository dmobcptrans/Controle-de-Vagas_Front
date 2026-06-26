'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { addEmpresa } from '@/lib/api/empresaApi';
import ModalTermos from '@/components/modal/autorizacao/login/ModalTermos';
import toast from 'react-hot-toast';

type FormularioEmpresaProps = {
  onSuccess?: () => void;
};

const etapas = ['Dados da empresa', 'Responsável'];

export default function FormularioEmpresa({
  onSuccess,
}: FormularioEmpresaProps) {
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const [mostrarModalTermos, setMostrarModalTermos] = useState(false);

  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    aceitouTermos: false,
  });

  const [state, action, pending] = useActionState(addEmpresa, null);

  useEffect(() => {
    if (!state?.message) return;

    if (state.error) {
      toast.error(state.message);
      return;
    }

    toast.success(state.message);

    formRef.current?.reset();

    setFormData({
      razaoSocial: '',
      cnpj: '',
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      aceitouTermos: false,
    });

    setStep(0);
    onSuccess?.();
  }, [state, onSuccess]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  function proximo() {
    if (!formRef.current) return;

    const containerAtual = formRef.current.querySelector(
      `[data-step="${step}"]`,
    );

    if (!containerAtual) return;

    const inputs =
      containerAtual.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        'input, select',
      );

    let valid = true;

    for (const input of Array.from(inputs)) {
      if (!input.reportValidity()) {
        valid = false;
        break;
      }
    }

    if (!valid) return;

    if (step === 1 && formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    setStep((s) => s + 1);
  }

  function voltar() {
    setStep((s) => s - 1);
  }

  return (
    <>
      <form
        ref={formRef}
        action={action}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
              Etapa {step + 1} de {etapas.length}
            </span>

            <span className="text-xs font-semibold text-slate-400">
              {Math.round(((step + 1) / etapas.length) * 100)}%
            </span>
          </div>

          <h2 className="mt-3 text-xl font-extrabold text-slate-900">
            {etapas[step]}
          </h2>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${((step + 1) / etapas.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* BODY */}
        <div className="space-y-6 p-6">
          {/* STEP 0 */}
          <div data-step={0} className={step === 0 ? 'space-y-5' : 'hidden'}>
            <Input
              name="razaoSocial"
              label="Razão social"
              required
              value={formData.razaoSocial}
              onChange={handleChange}
            />

            <Input
              name="cnpj"
              label="CNPJ"
              required
              value={formData.cnpj}
              onChange={handleChange}
            />
          </div>

          {/* STEP 1 */}
          <div data-step={1} className={step === 1 ? 'space-y-5' : 'hidden'}>
            <Input
              name="nome"
              label="Nome do responsável"
              required
              value={formData.nome}
              onChange={handleChange}
            />

            <Input
              name="cpf"
              label="CPF"
              required
              value={formData.cpf}
              onChange={handleChange}
            />

            <Input
              name="telefone"
              label="Telefone"
              required
              value={formData.telefone}
              onChange={handleChange}
            />

            <Input
              name="email"
              type="email"
              label="E-mail"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              name="senha"
              type="password"
              label="Senha"
              required
              value={formData.senha}
              onChange={handleChange}
            />

            <Input
              name="confirmarSenha"
              type="password"
              label="Confirmar senha"
              required
              value={formData.confirmarSenha}
              onChange={handleChange}
            />

            {/* TERMO */}
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                name="aceitouTermos"
                checked={formData.aceitouTermos}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4"
              />

              <div className="grid gap-1.5 leading-none">
                <span className="text-sm text-gray-600 leading-relaxed">
                  Li e aceito os{' '}
                  <button
                    type="button"
                    onClick={() => setMostrarModalTermos(true)}
                    className="text-blue-600 underline"
                  >
                    Termos de Uso e Política de Privacidade
                  </button>
                </span>

                <p className="text-xs text-gray-500">
                  É necessário aceitar os termos para ativar sua conta
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 border-t border-slate-100 p-4">
          {step > 0 && (
            <button
              type="button"
              onClick={voltar}
              className="h-12 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700"
            >
              Voltar
            </button>
          )}

          {step < etapas.length - 1 ? (
            <button
              type="button"
              onClick={proximo}
              className="h-12 flex-1 rounded-xl bg-blue-600 text-sm font-bold text-white"
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="h-12 flex-1 rounded-xl bg-blue-600 text-sm font-bold text-white disabled:opacity-50"
            >
              {pending ? 'Cadastrando...' : 'Cadastrar empresa'}
            </button>
          )}
        </div>
      </form>

      {/* MODAL FORA DO FORM */}
      <ModalTermos
        open={mostrarModalTermos}
        onOpenChange={setMostrarModalTermos}
        onClose={() => setMostrarModalTermos(false)}
      />
    </>
  );
}

/* INPUT COMPONENT */
type InputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

function Input({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  value,
  onChange,
}: InputProps) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}
