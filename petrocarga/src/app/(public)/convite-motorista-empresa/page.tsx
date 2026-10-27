'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Eye, EyeOff } from 'lucide-react';

import toast from 'react-hot-toast';

import {
  buscarConviteMotoristaEmpresaPorToken,
  responderConviteMotoristaEmpresa,
} from '@/features/usuarios/conviteMotoristaEmpresa/services/conviteMotoristaApi';

import CadastroConcluidoCard from '@/features/usuarios/auth/components/autorização/cadastro/CadastroConcluidoCard';
import ModalAtivacaoConta from '@/features/usuarios/auth/components/modal/autorizacao/login/ModalAtivacaoConta';

import type {
  ConviteMotoristaEmpresaPorToken,
  ResponderConviteMotoristaEmpresaSemCadastroPayload,
  ResponderConviteMotoristaEmpresaComCadastroPayload,
} from '@/features/usuarios/conviteMotoristaEmpresa/types/conviteMotoristaEmpresa';

type TelaState =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'invalido' }
  | { tipo: 'ja-respondido'; convite: ConviteMotoristaEmpresaPorToken }
  | { tipo: 'ja-cadastrado'; convite: ConviteMotoristaEmpresaPorToken }
  | { tipo: 'decisao'; convite: ConviteMotoristaEmpresaPorToken }
  | { tipo: 'novo-cadastro'; convite: ConviteMotoristaEmpresaPorToken }
  | { tipo: 'recusado' }
  | { tipo: 'sucesso' };

const TIPOS_CNH = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'] as const;

type TipoCnh = (typeof TIPOS_CNH)[number];

type FormData = {
  nome: string;
  telefone: string;
  cpf: string;
  numeroCnh: string;
  tipoCnh: TipoCnh | '';
  dataValidadeCnh: string;
  senha: string;
  confirmarSenha: string;
};

const etapas = ['Dados pessoais', 'CNH', 'Senha'];

function formatarCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }

  return digitos
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}

/* ---------- Casca padrão ---------- */

function DomoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        relative
        flex
        min-h-[calc(100dvh-64px)]
        items-center
        justify-center
        overflow-hidden
        bg-blue-800
        px-6
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/2
          z-0
          h-[50%]
          w-[150%]
          -translate-x-1/2
          bg-blue-900
        "
        style={{
          borderTopLeftRadius: '50%',
          borderTopRightRadius: '50%',
          boxShadow: '0 -20px 60px rgba(30,58,138,.35)',
        }}
      />

      <main
        className="
          relative
          z-10
          flex
          w-full
          max-w-5xl
          flex-col
          items-center
          justify-center
        "
      >
        {children}
      </main>
    </div>
  );
}

function CabecalhoPagina({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo: string;
}) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-bold text-white">{titulo}</h1>

      <p className="mt-2 text-blue-100">{subtitulo}</p>
    </div>
  );
}

function CartaoPadrao({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl">
      {children}
    </div>
  );
}

/* ---------- Input padrão ---------- */

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function Input({ label, type = 'text', className, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}

        {props.required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className={`h-12 w-full rounded-xl border border-slate-300 px-4 pr-12 text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 ${className ?? ''}`}
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

/* ---------- Etapa de decisão (aceitar / recusar) ---------- */

function DecisaoConvite({
  convite,
  recusando,
  onAceitar,
  onRecusar,
}: {
  convite: ConviteMotoristaEmpresaPorToken;
  recusando: boolean;
  onAceitar: () => void;
  onRecusar: () => void;
}) {
  return (
    <CartaoPadrao>
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Você foi convidado para dirigir por{' '}
          <span className="font-semibold text-slate-900">
            {convite.razaoSocial}
          </span>
          . O que você deseja fazer?
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onAceitar}
          disabled={recusando}
          className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          Aceitar e continuar cadastro
        </button>

        <button
          type="button"
          onClick={onRecusar}
          disabled={recusando}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {recusando ? 'Recusando...' : 'Recusar convite'}
        </button>
      </div>
    </CartaoPadrao>
  );
}

/* ---------- Formulário de aceite ---------- */

function FormularioAceiteConvite({
  token,
  convite,
  onSuccess,
}: {
  token: string;
  convite: ConviteMotoristaEmpresaPorToken;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);

  const [enviando, setEnviando] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nome: convite.motoristaNome ?? '',
    telefone: '',
    cpf: '',
    numeroCnh: '',
    tipoCnh: '',
    dataValidadeCnh: '',
    senha: '',
    confirmarSenha: '',
  });

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

    for (const input of Array.from(inputs)) {
      if (!input.reportValidity()) {
        return;
      }
    }

    setStep((s) => s + 1);
  }

  function voltar() {
    setStep((s) => s - 1);
  }

  async function aoSubmeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (somenteDigitos(formData.cpf).length !== 11) {
      toast.error('Informe um CPF válido.');
      return;
    }

    if (formData.senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas informadas não conferem.');
      return;
    }

    if (!formData.tipoCnh) {
      toast.error('Selecione uma categoria de CNH.');
      return;
    }

    setEnviando(true);

    const payload: ResponderConviteMotoristaEmpresaSemCadastroPayload = {
      conviteToken: token,
      status: 'ACEITO',
      motorista: {
        nome: formData.nome.trim(),
        telefone: somenteDigitos(formData.telefone),
        cpf: somenteDigitos(formData.cpf),
        numeroCnh: formData.numeroCnh.trim(),
        tipoCnh: formData.tipoCnh,
        dataValidadeCnh: formData.dataValidadeCnh,
        senha: formData.senha,
      },
    };

    const resultado = await responderConviteMotoristaEmpresa(payload);

    setEnviando(false);

    if (resultado.error) {
      toast.error(resultado.message);
      return;
    }

    toast.success(resultado.message ?? 'Cadastro concluído com sucesso!');

    onSuccess();
  }

  return (
    <form
      ref={formRef}
      onSubmit={aoSubmeter}
      className="w-full max-w-xl overflow-hidden rounded-4xl border border-slate-200 bg-white p-3 shadow-2xl"
    >
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-5 backdrop-blur-sm">
        <div className="flex flex-col">
          <div className="flex justify-end">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
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

      <div className="flex-1 space-y-6 p-6">
        {/* Etapa 0: Dados pessoais */}

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
            name="telefone"
            label="Telefone"
            placeholder="(00) 99999-0000"
            required
            inputMode="numeric"
            maxLength={15}
            value={formData.telefone}
            onChange={(e) => {
              e.target.value = formatarTelefone(e.target.value);
              handleChange(e);
            }}
          />

          <Input
            name="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            required
            inputMode="numeric"
            maxLength={14}
            value={formData.cpf}
            onChange={(e) => {
              e.target.value = formatarCpf(e.target.value);
              handleChange(e);
            }}
          />
        </div>

        {/* Etapa 1: CNH */}

        <div data-step={1} className={step === 1 ? 'space-y-5' : 'hidden'}>
          <Input
            name="numeroCnh"
            label="Número da CNH"
            placeholder="Apenas números"
            required
            inputMode="numeric"
            maxLength={11}
            value={formData.numeroCnh}
            onChange={(e) => {
              e.target.value = somenteDigitos(e.target.value);
              handleChange(e);
            }}
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Categoria da CNH <span className="text-red-500">*</span>
            </label>

            <select
              name="tipoCnh"
              required
              value={formData.tipoCnh}
              onChange={handleChange}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-50 sm:text-sm"
            >
              <option value="">Selecione uma categoria</option>

              {TIPOS_CNH.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
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

        {/* Etapa 2: Senha */}

        <div data-step={2} className={step === 2 ? 'space-y-5' : 'hidden'}>
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
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4 sm:p-5">
        <div className="flex gap-3">
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
              disabled={enviando}
              className="h-12 flex-1 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Criar conta e aceitar convite'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

/* ---------- Conteúdo principal ---------- */

function ConviteMotoristaEmpresaConteudo() {
  const searchParams = useSearchParams();

  const router = useRouter();

  const token = searchParams.get('convite');

  const [estado, setEstado] = useState<TelaState>({
    tipo: 'carregando',
  });

  const [mostrarModal, setMostrarModal] = useState(false);

  const [recusando, setRecusando] = useState(false);

  useEffect(() => {
    if (!token) {
      setEstado({ tipo: 'invalido' });
      return;
    }

    let ativo = true;

    buscarConviteMotoristaEmpresaPorToken(token)
      .then((convite) => {
        if (!ativo) return;

        if (convite.status !== 'PENDENTE') {
          setEstado({
            tipo: 'ja-respondido',
            convite,
          });

          return;
        }

        if (convite.motoristaJaCadastrado) {
          setEstado({ tipo: 'ja-cadastrado', convite });
        } else {
          setEstado({ tipo: 'decisao', convite });
        }
      })
      .catch((err: unknown) => {
        if (!ativo) return;

        setEstado({
          tipo: 'erro',
          mensagem:
            err instanceof Error ? err.message : 'Erro ao buscar convite',
        });
      });

    return () => {
      ativo = false;
    };
  }, [token]);

  async function recusarConvite() {
    if (!token) return;

    setRecusando(true);

    const payload: ResponderConviteMotoristaEmpresaComCadastroPayload = {
      conviteId: token,
      status: 'RECUSADO',
    };

    const resultado = await responderConviteMotoristaEmpresa(payload);

    setRecusando(false);

    if (resultado.error) {
      toast.error(resultado.message);
      return;
    }

    toast.success(resultado.message ?? 'Convite recusado.');

    setEstado({ tipo: 'recusado' });
  }

  const { titulo, subtitulo } = useMemo(() => {
    if (
      estado.tipo === 'ja-respondido' ||
      estado.tipo === 'ja-cadastrado' ||
      estado.tipo === 'decisao' ||
      estado.tipo === 'novo-cadastro'
    ) {
      return {
        titulo: estado.convite.razaoSocial,
        subtitulo: `convidou ${estado.convite.motoristaEmail} para dirigir por essa empresa`,
      };
    }

    if (estado.tipo === 'sucesso') {
      return {
        titulo: 'Cadastro concluído!',
        subtitulo: 'Seu cadastro foi criado e o convite foi aceito.',
      };
    }

    if (estado.tipo === 'recusado') {
      return {
        titulo: 'Convite recusado',
        subtitulo: 'Nenhuma ação adicional é necessária.',
      };
    }

    return {
      titulo: 'Convite de empresa',
      subtitulo: 'Estamos carregando as informações do seu convite.',
    };
  }, [estado]);

  return (
    <DomoLayout>
      <CabecalhoPagina titulo={titulo} subtitulo={subtitulo} />

      <div className="mb-8 flex w-full animate-in justify-center fade-in slide-in-from-bottom-6 duration-500">
        {estado.tipo === 'carregando' && (
          <CartaoPadrao>
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />

              <p className="text-sm text-gray-500">Carregando convite...</p>
            </div>
          </CartaoPadrao>
        )}

        {estado.tipo === 'invalido' && (
          <CartaoPadrao>
            <div className="py-4 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Convite não encontrado
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                O link que você acessou está incompleto. Verifique se copiou o
                link completo recebido por e-mail ou WhatsApp.
              </p>
            </div>
          </CartaoPadrao>
        )}

        {estado.tipo === 'erro' && (
          <CartaoPadrao>
            <div className="py-4 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Não foi possível abrir o convite
              </h2>

              <p className="mt-2 text-sm text-gray-500">{estado.mensagem}</p>
            </div>
          </CartaoPadrao>
        )}

        {estado.tipo === 'ja-respondido' &&
          (() => {
            const mensagens: Record<string, string> = {
              ACEITO: 'Este convite já foi aceito anteriormente.',
              RECUSADO: 'Este convite já foi recusado.',
              EXPIRADO:
                'Este convite expirou. Peça para a empresa enviar um novo.',
            };

            return (
              <CartaoPadrao>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                  <p className="text-sm text-gray-600">
                    {mensagens[estado.convite.status] ??
                      `Este convite está com o status "${estado.convite.status}".`}
                  </p>
                </div>
              </CartaoPadrao>
            );
          })()}

        {estado.tipo === 'ja-cadastrado' && (
          <CartaoPadrao>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-sm text-gray-700">
                Você já possui uma conta cadastrada. Para aceitar este convite,
                faça login e acesse a aba{' '}
                <span className="font-semibold">Solicitações</span> para
                confirmar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/autorizacao/login')}
              className="mt-6 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800"
            >
              Fazer login
            </button>
          </CartaoPadrao>
        )}

        {estado.tipo === 'decisao' && (
          <DecisaoConvite
            convite={estado.convite}
            recusando={recusando}
            onAceitar={() =>
              setEstado({ tipo: 'novo-cadastro', convite: estado.convite })
            }
            onRecusar={recusarConvite}
          />
        )}

        {estado.tipo === 'novo-cadastro' && token && (
          <FormularioAceiteConvite
            token={token}
            convite={estado.convite}
            onSuccess={() => setEstado({ tipo: 'sucesso' })}
          />
        )}

        {estado.tipo === 'recusado' && (
          <CartaoPadrao>
            <div className="py-4 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Convite recusado
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Você recusou este convite. Se mudar de ideia, peça para a
                empresa enviar um novo.
              </p>
            </div>
          </CartaoPadrao>
        )}

        {estado.tipo === 'sucesso' && (
          <CadastroConcluidoCard
            tipo="motorista"
            onAtivarConta={() => setMostrarModal(true)}
          />
        )}
      </div>

      <ModalAtivacaoConta
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        onClose={() => setMostrarModal(false)}
        tipo="motorista"
      />
    </DomoLayout>
  );
}

export default function ConviteMotoristaEmpresa() {
  return (
    <Suspense
      fallback={
        <DomoLayout>
          <CartaoPadrao>
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />

              <p className="text-sm text-gray-500">Carregando convite...</p>
            </div>
          </CartaoPadrao>
        </DomoLayout>
      }
    >
      <ConviteMotoristaEmpresaConteudo />
    </Suspense>
  );
}