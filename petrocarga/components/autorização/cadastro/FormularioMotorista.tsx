'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { addMotorista } from '@/lib/api/motoristaApi';
import toast from 'react-hot-toast';

type FormularioMotoristaProps = {
  onSuccess?: () => void;
};

const etapas = ['Dados pessoais', 'Acesso', 'CNH'];

export default function FormularioMotorista({
  onSuccess,
}: FormularioMotoristaProps) {
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // 1. Estado centralizado para controlar e persistir TODOS os campos
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    numeroCnh: '',
    tipoCnh: '',
    dataValidadeCnh: '',
  });

  const [state, action, pending] = useActionState(addMotorista, null);

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
      cpf: '',
      telefone: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      numeroCnh: '',
      tipoCnh: '',
      dataValidadeCnh: '',
    });

    setStep(0);

    onSuccess?.();
  }, [state, onSuccess]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    setStep((s) => s + 1);
  }

  function voltar() {
    setStep((s) => s - 1);
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Cabeçalho Fixo / Progresso */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Etapa {step + 1} de {etapas.length}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {Math.round(((step + 1) / etapas.length) * 100)}% concluído
          </span>
        </div>

        <h2 className="mt-3 text-xl font-extrabold text-slate-900 tracking-tight">
          {etapas[step]}
        </h2>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{
              width: `${((step + 1) / etapas.length) * 100}%`,
            }}
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
            value={formData.cpf}
            onChange={handleChange}
          />

          <Input
            name="telefone"
            label="Telefone"
            placeholder="(00) 99999-0000"
            required
            value={formData.telefone}
            onChange={handleChange}
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
            value={formData.numeroCnh}
            onChange={handleChange}
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
                <option>A</option>
                <option>B</option>
                <option>AB</option>
                <option>C</option>
                <option>D</option>
                <option>E</option>
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
      <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4 flex gap-3 sm:p-5">
        {/* Botão temporário para testes */}
        <button
          type="button"
          onClick={() => {
            toast.success('Cadastro simulado com sucesso!');
            onSuccess?.();
          }}
          className="h-12 rounded-xl border border-green-300 bg-green-50 px-4 text-sm font-bold text-green-700 hover:bg-green-100"
        >
          Simular sucesso
        </button>

        {step > 0 && (
          <button
            type="button"
            onClick={voltar}
            className="h-12 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
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
            className="h-12 flex-1 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {pending ? 'Cadastrando...' : 'Cadastrar motorista'}
          </button>
        )}
      </div>
    </form>
  );
}

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
        className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-50 sm:text-sm"
      />
    </div>
  );
}
