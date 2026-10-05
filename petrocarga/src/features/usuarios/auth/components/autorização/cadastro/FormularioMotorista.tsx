'use client';

import { useEffect, useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import { useMotoristaMutation } from '@/features/usuarios/(personas)/motoristas/hooks/useMotoristaMutation';
import { MotoristaPayload1 } from '@/features/usuarios/(personas)/motoristas/types/motorista';
import ButtonLoginGoogle from '@/components/ui/buttonLoginGoogle';

type FormularioMotoristaProps = {
  onSuccess?: () => void;
};

const etapas = ['Dados pessoais', 'Acesso', 'CNH'];

const FORM_INICIAL = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  numeroCnh: '',
  tipoCnh: '',
  dataValidadeCnh: '',
  aceitouTermos: false,
};

type FormData = typeof FORM_INICIAL;

// Ajuste aqui se o MotoristaPayload1 tiver outro formato
function montarPayload(
  data: FormData,
): MotoristaPayload1 {
  return {
    usuario: {
      nome: data.nome.trim(),
      telefone: data.telefone,
      email: data.email.trim(),
      senha: data.senha,
      aceitouTemos: data.aceitouTermos,
    },
    cpf: data.cpf,
    tipoCnh: data.tipoCnh,
    numeroCnh: data.numeroCnh,
    dataValidadeCnh: data.dataValidadeCnh,
  };
}

export default function FormularioMotorista({
  onSuccess,
}: FormularioMotoristaProps) {
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<FormData>(FORM_INICIAL);

  const { criar, loading: pending, error, limparError } = useMotoristaMutation();

  // Erro vindo do hook
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const somenteNumeros =
    (maxLength: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, maxLength);
      handleChange(e);
    };

  /**
   * Valida a confirmação de senha comparando com o estado atual.
   * (setCustomValidity no onChange ficava desatualizado se a senha
   * fosse alterada depois da confirmação.)
   */
  function validarSenhas(): boolean {
    const confirmar = formRef.current?.elements.namedItem(
      'confirmarSenha',
    ) as HTMLInputElement | null;

    if (!confirmar) return true;

    confirmar.setCustomValidity(
      formData.senha !== formData.confirmarSenha
        ? 'As senhas não coincidem'
        : '',
    );

    return confirmar.reportValidity();
  }

  function validarEtapaAtual(): boolean {
    if (!formRef.current) return false;

    const containerAtual = formRef.current.querySelector(
      `[data-step="${step}"]`,
    );
    if (!containerAtual) return false;

    const inputs = containerAtual.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >('input, select');

    for (const input of Array.from(inputs)) {
      if (input.name === 'confirmarSenha') continue; // tratado em validarSenhas
      if (!input.reportValidity()) return false;
    }

    if (step === 1 && !validarSenhas()) return false;

    return true;
  }

  function proximo() {
    if (!validarEtapaAtual()) return;
    setStep((s) => s + 1);
  }

  function voltar() {
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (pending) return;
    if (!validarEtapaAtual()) return;

    limparError();

    const response = await criar(montarPayload(formData));

    if (!response) return; // o erro já aparece pelo useEffect acima

    toast.success('Motorista cadastrado com sucesso!');

    formRef.current?.reset();
    setFormData(FORM_INICIAL);
    setStep(0);

    onSuccess?.();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-4xl p-3 border border-slate-200 bg-white shadow-2xl overflow-hidden"
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
            style={{ width: `${((step + 1) / etapas.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Corpo do Formulário */}
      <div className="flex-1 space-y-6 p-6">
        {/* ETAPA 0: Dados Pessoais */}
        <div data-step={0} className={step === 0 ? 'space-y-5' : 'hidden'}>
          <Input
            name="nome"
            label="Nome completo"
            placeholder="Ex: João Silva"
            required
            value={formData.nome}
            onChange={handleChange}
          />

          <Input
            name="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            required
            inputMode="numeric"
            maxLength={11}
            minLength={11}
            value={formData.cpf}
            onChange={somenteNumeros(11)}
          />

          <Input
            name="telefone"
            label="Telefone"
            placeholder="(00) 99999-0000"
            required
            inputMode="numeric"
            maxLength={11}
            minLength={10}
            value={formData.telefone}
            onChange={somenteNumeros(11)}
          />
        </div>

        {/* ETAPA 1: Acesso */}
        <div data-step={1} className={step === 1 ? 'space-y-5' : 'hidden'}>
          <Input
            name="email"
            type="email"
            label="E-mail"
            placeholder="exemplo@email.com"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            name="senha"
            type="password"
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
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
            onChange={handleChange}
          />
        </div>

        {/* ETAPA 2: CNH */}
        <div data-step={2} className={step === 2 ? 'space-y-5' : 'hidden'}>
          <Input
            name="numeroCnh"
            label="Número da CNH"
            placeholder="Apenas números"
            required
            inputMode="numeric"
            maxLength={11}
            value={formData.numeroCnh}
            onChange={somenteNumeros(11)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Categoria da CNH <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                name="tipoCnh"
                required
                value={formData.tipoCnh}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-50 sm:text-sm appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
              >
                <option value="">Selecione uma categoria</option>
                <option>AB</option>
                <option>B</option>
                <option>C</option>
                <option>AC</option>
                <option>D</option>
                <option>AD</option>
                <option>E</option>
                <option>AE</option>
              </select>
            </div>
          </div>

          <Input
            name="dataValidadeCnh"
            type="date"
            label="Validade da CNH"
            required
            value={formData.dataValidadeCnh}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Rodapé Fixo de Ações */}
      <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4 sm:p-5">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={voltar}
              disabled={pending}
              className="h-12 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
            >
              Voltar
            </button>
          )}

          {step < etapas.length - 1 ? (
            <button
              type="button"
              onClick={proximo}
              className="h-12 flex-1 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="h-12 flex-1 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {pending ? 'Cadastrando...' : 'Cadastrar motorista'}
            </button>
          )}
        </div>

        {step === 0 && (
          <div className="mt-4">
            <ButtonLoginGoogle text="Cadastrar com Google" />
          </div>
        )}
      </div>
    </form>
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