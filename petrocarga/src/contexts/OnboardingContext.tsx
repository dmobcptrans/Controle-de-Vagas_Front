'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface OnboardingData {
  cpf: string;
  telefone: string;
  senha: string;
  aceitarTermos: boolean;
  tipoCnh: string;
  numeroCnh: string;
  dataValidadeCnh: string;
}

interface VeiculoData {
  cpfProprietario?: string;
  cnpjProprietario?: string;
  tipoProprietario: 'CPF' | 'CNPJ';
  [key: string]: unknown;
}

interface ApiError {
  erro?: string;
  message?: string;
}

interface OnboardingContextData {
  // ------- Modal de complemento de cadastro (etapas 1-3) -------
  isCadastroOpen: boolean;
  cadastroStep: number;
  data: OnboardingData;

  startOnboarding: () => void;
  nextCadastroStep: () => void;
  prevCadastroStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  submitCadastro: () => Promise<void>;

  // ------- Modal de cadastro de veículo -------
  isVeiculoOpen: boolean;
  submitVeiculo: (veiculoData: VeiculoData) => Promise<void>;
  closeVeiculoModal: () => void;

  reset: () => void;
}

const OnboardingContext = createContext({} as OnboardingContextData);

const initialData: OnboardingData = {
  cpf: '',
  telefone: '',
  senha: '',
  aceitarTermos: false,
  tipoCnh: '',
  numeroCnh: '',
  dataValidadeCnh: '',
};

/**
 * @component OnboardingProvider
 * @version 2.0.0
 *
 * @description Provider para gerenciamento do fluxo de onboarding (cadastro
 * complementar). A partir da v2, o fluxo foi separado em DOIS modais
 * independentes:
 *
 * 1) MODAL DE COMPLEMENTO DE CADASTRO (`isCadastroOpen`)
 *    - Etapas 1 a 3: dados pessoais, habilitação (CNH) e termos.
 *    - Não pode ser fechado pelo usuário (sem botão de fechar / sem clique
 *      no backdrop). Só fecha após `submitCadastro()` ter sucesso.
 *
 * 2) MODAL DE CADASTRO DE VEÍCULO (`isVeiculoOpen`)
 *    - Etapa única: dados do veículo.
 *    - Pode ser fechado pelo usuário a qualquer momento via
 *      `closeVeiculoModal()`.
 *
 * ----------------------------------------------------------------------------
 * 📋 REGRAS DE ABERTURA AUTOMÁTICA:
 * ----------------------------------------------------------------------------
 *
 * - Se o usuário não possui CPF/CNPJ cadastrado -> abre o modal de cadastro
 *   (etapa 1).
 * - Se o usuário já possui CPF/CNPJ mas não possui veículo ativo -> abre
 *   diretamente o modal de veículo.
 * - Se, ao concluir o cadastro complementar, o usuário ainda não tiver
 *   veículo, o modal de cadastro fecha e o modal de veículo abre em seguida.
 *
 * @example
 * ```tsx
 * <OnboardingProvider>
 *   {children}
 *   <OnboardingCadastroModal />
 *   <OnboardingVeiculoModal />
 * </OnboardingProvider>
 * ```
 */
export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [cadastroStep, setCadastroStep] = useState(1);

  const [isVeiculoOpen, setIsVeiculoOpen] = useState(false);

  const [checked, setChecked] = useState(false);
  const [data, setData] = useState<OnboardingData>(initialData);

  const { user, refreshUser, loading } = useAuth();

  // ==================== VERIFICAÇÃO AUTOMÁTICA ====================
  useEffect(() => {
    if (loading || checked) return;
    if (!user) return;

    const precisaCpf = !user.cnpj && !user.cpf;
    const precisaVeiculo = user.possuiVeiculoAtivo === false;

    if (!precisaCpf && !precisaVeiculo) {
      setChecked(true);
      return;
    }

    if (precisaCpf) {
      // Precisa completar dados pessoais/CNH/termos primeiro
      setCadastroStep(1);
      setIsCadastroOpen(true);
    } else if (precisaVeiculo) {
      // Já tem cadastro completo, falta só o veículo
      setIsVeiculoOpen(true);
    }

    setChecked(true);
  }, [user, loading, checked]);

  // ==================== NAVEGAÇÃO — CADASTRO ====================
  const startOnboarding = useCallback(() => {
    setCadastroStep(1);
    setIsCadastroOpen(true);
  }, []);

  const nextCadastroStep = useCallback(() => {
    setCadastroStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const prevCadastroStep = useCallback(() => {
    setCadastroStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // ==================== HANDLERS DE DADOS ====================
  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...newData,
    }));
  }, []);

  // ==================== SUBMIT CADASTRO DE USUÁRIO ====================
  const submitCadastro = useCallback(async () => {
    try {
      await api.post('/petrocarga/auth/completarCadastro', data);

      await refreshUser();

      toast.success('Cadastro completo com sucesso!');

      // Fecha o modal de cadastro sempre que o submit tem sucesso
      setIsCadastroOpen(false);
      setCadastroStep(1);
      setData(initialData);

      // Se o usuário ainda não tem veículo, abre o modal de veículo em seguida
      if (user?.possuiVeiculoAtivo === false) {
        setIsVeiculoOpen(true);
      }
    } catch (error: unknown) {
      console.error('Erro ao completar onboarding', error);

      let mensagem = 'Erro ao completar cadastro';

      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiError;
        mensagem = responseData?.erro || responseData?.message || mensagem;
      }

      toast.error(mensagem);
      throw error;
    }
  }, [data, refreshUser, user]);

  // ==================== SUBMIT CADASTRO DE VEÍCULO ====================
  const submitVeiculo = useCallback(
    async (veiculoData: VeiculoData) => {
      try {
        const { cpfProprietario, cnpjProprietario, tipoProprietario, ...rest } =
          veiculoData;

        const payload = {
          ...rest,
          ...(tipoProprietario === 'CPF'
            ? { cpfProprietario }
            : { cnpjProprietario }),
        };

        await api.post(`/petrocarga/veiculos/${user?.id}`, payload);

        await refreshUser();

        toast.success('Veículo cadastrado com sucesso!');

        setIsVeiculoOpen(false);
      } catch (error: unknown) {
        console.error('Erro ao cadastrar veículo', error);

        let mensagem = 'Erro ao cadastrar veículo';

        if (error instanceof AxiosError) {
          const responseData = error.response?.data as ApiError;
          mensagem = responseData?.erro || responseData?.message || mensagem;
        }

        toast.error(mensagem);
        throw error;
      }
    },
    [refreshUser, user],
  );

  // ==================== FECHAR MODAL DE VEÍCULO ====================
  // Único modal que pode ser fechado pelo usuário. O modal de cadastro
  // (isCadastroOpen) propositalmente NÃO possui uma função de fechar
  // exposta para a UI.
  const closeVeiculoModal = useCallback(() => {
    setIsVeiculoOpen(false);
  }, []);

  // ==================== RESET ====================
  const reset = useCallback(() => {
    setData(initialData);
    setCadastroStep(1);
    setIsCadastroOpen(false);
    setIsVeiculoOpen(false);
    setChecked(false);
  }, []);

  // ==================== MEMOIZED VALUE ====================
  const value = useMemo(
    () => ({
      isCadastroOpen,
      cadastroStep,
      data,
      startOnboarding,
      nextCadastroStep,
      prevCadastroStep,
      updateData,
      submitCadastro,

      isVeiculoOpen,
      submitVeiculo,
      closeVeiculoModal,

      reset,
    }),
    [
      isCadastroOpen,
      cadastroStep,
      data,
      startOnboarding,
      nextCadastroStep,
      prevCadastroStep,
      updateData,
      submitCadastro,
      isVeiculoOpen,
      submitVeiculo,
      closeVeiculoModal,
      reset,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * @hook useOnboarding
 * @description Hook para acessar o contexto de onboarding
 * @throws {Error} Se usado fora do OnboardingProvider
 */
export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      'useOnboarding deve ser usado dentro do OnboardingProvider',
    );
  }

  return context;
}