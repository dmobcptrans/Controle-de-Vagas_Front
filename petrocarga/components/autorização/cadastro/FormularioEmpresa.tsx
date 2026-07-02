'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { addEmpresa } from '@/lib/api/empresaApi';
import ModalTermos from '@/components/modal/autorizacao/login/ModalTermos';
import toast from 'react-hot-toast';

type FormularioEmpresaProps = {
  onSuccess?: () => void;
};


const etapas = ['Dados da empresa', 'Informações complementares'];

export default function FormularioEmpresa({
  onSuccess,
}: FormularioEmpresaProps) {
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const [mostrarModalTermos, setMostrarModalTermos] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cnpj: '',
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
      nome: '',
      telefone: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      cnpj: '',
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
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  function proximo() {
    if (!formRef.current) return;

    const containerAtual = formRef.current.querySelector(
      `[data-step="${step}"]`,
    );

    if (!containerAtual) return;

    const inputs = containerAtual.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >('input, select');

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
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        {/* Cabeçalho Fixo / Progresso */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-5">
          <div className="flex flex-col">
            <div className="flex justify-end">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Etapa {step + 1} de {etapas.length}
              </span>
            </div>

            <h2 className="-mt-7 text-xl font-extrabold tracking-tight text-slate-900">
              {etapas[step]}
            </h2>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
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
              name="nome"
              label="Nome da Empresa"
              placeholder="Ex: Transportadora Silva"
              required
              value={formData.nome}
              onChange={handleChange}
            />

            <Input
              name="cnpj"
              label="CNPJ"
              placeholder="00.000.000/0001-00"
              required
              inputMode="numeric"
              maxLength={14}
              value={formData.cnpj}
              onChange={handleChange}
            />
          </div>

          {/* STEP 1 */}
          <div data-step={1} className={step === 1 ? 'space-y-5' : 'hidden'}>

            <Input
              name="telefone"
              label="Telefone"
              placeholder="(00) 99999-0000"
              required
              inputMode="tel"
              maxLength={11}
              value={formData.telefone}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                handleChange(e);
              }}
            />

            <Input
              name="email"
              type="email"
              label="E-mail"
              placeholder="exemplo@email.com"
              required
              inputMode='email'
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              name="senha"
              type="password"
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              required
              value={formData.senha}
              onChange={handleChange}
            />

            <Input
              name="confirmarSenha"
              type="password"
              label="Confirmar senha"
              placeholder="Digite a senha novamente"
              required
              value={formData.confirmarSenha}
              onChange={(e) => {
                handleChange(e);

                if (e.target.value !== formData.senha) {
                  e.target.setCustomValidity('As senhas não coincidem');
                } else {
                  e.target.setCustomValidity('');
                }
              }}
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

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function Input({ label, type = 'text', className, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 pr-12 text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
