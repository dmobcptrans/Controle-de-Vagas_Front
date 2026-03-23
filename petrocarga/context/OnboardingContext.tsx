'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { api } from '@/service/api';
import { useAuth } from '@/context/AuthContext';
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
  isOpen: boolean;
  step: number;
  data: OnboardingData;
  isVeiculoOnlyFlow: boolean;

  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;

  submit: () => Promise<void>;
  submitVeiculo: (veiculoData: VeiculoData) => Promise<void>;

  reset: () => void;
  close: () => void;
}

const OnboardingContext = createContext({} as OnboardingContextData);

/**
 * @component OnboardingProvider
 * @version 1.0.0
 * 
 * @description Provider para gerenciamento do fluxo de onboarding (cadastro complementar).
 * Gerencia abertura do modal, navegação entre etapas e envio de dados.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. VERIFICAÇÃO INICIAL:
 *    - Verifica se usuário está autenticado
 *    - Se user.cpf não existe → abre modal na etapa 1 (dados pessoais)
 *    - Se veiculoCadastrado === false → abre modal na etapa 4 (veículo)
 * 
 * 2. ETAPAS:
 *    - Etapa 1: Dados pessoais (CPF, telefone, senha)
 *    - Etapa 2: Habilitação (CNH)
 *    - Etapa 3: Termos e condições
 *    - Etapa 4: Veículo (apenas se necessário)
 * 
 * 3. SUBMIT:
 *    - submit(): Completa cadastro de usuário
 *    - submitVeiculo(): Cadastra veículo
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO DO HOOK useOnboarding:
 * ----------------------------------------------------------------------------
 * 
 * @property {boolean} isOpen - Modal está aberto
 * @property {number} step - Etapa atual (1-4)
 * @property {OnboardingData} data - Dados do formulário
 * @property {boolean} isVeiculoOnlyFlow - Apenas fluxo de veículo (sem etapas 1-3)
 * @property {() => void} startOnboarding - Abre modal na etapa 1
 * @property {() => void} nextStep - Avança para próxima etapa
 * @property {() => void} prevStep - Volta para etapa anterior
 * @property {(data: Partial<OnboardingData>) => void} updateData - Atualiza dados
 * @property {() => Promise<void>} submit - Envia dados de cadastro
 * @property {(veiculoData: VeiculoData) => Promise<void>} submitVeiculo - Envia dados do veículo
 * @property {() => void} reset - Reseta todos os estados
 * @property {() => void} close - Fecha modal
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - VERIFICAÇÃO AUTOMÁTICA: useEffect verifica se usuário precisa de onboarding
 * - FLUXO DE VEÍCULO APENAS: Quando usuário já tem CPF mas falta veículo
 * - REFRESH USER: Após submit, chama refreshUser para atualizar dados do usuário
 * - FEEDBACK: Toast de sucesso/erro via react-hot-toast
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - OnboardingModal: Modal que utiliza este contexto
 * - useAuth: Hook de autenticação
 * - api: Instância Axios para requisições
 * 
 * @example
 * ```tsx
 * // Provider no layout
 * <OnboardingProvider>
 *   {children}
 *   <OnboardingModal />
 * </OnboardingProvider>
 * 
 * // Uso do hook
 * const { isOpen, step, data, updateData, submit } = useOnboarding();
 * ```
 */

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState(false);

  const { user, refreshUser, loading } = useAuth();
  const isVeiculoOnlyFlow = !!user?.cpf && user?.veiculoCadastrado === false;

  const [data, setData] = useState<OnboardingData>({
    cpf: '',
    telefone: '',
    senha: '',
    aceitarTermos: false,
    tipoCnh: '',
    numeroCnh: '',
    dataValidadeCnh: '',
  });

  // ==================== VERIFICAÇÃO AUTOMÁTICA ====================
  useEffect(() => {
    if (loading || checked) return;
    if (!user) return;

    const precisaCpf = !user.cpf;
    const precisaVeiculo = user.veiculoCadastrado === false;

    // Se não precisa de cadastro complementar, não abre modal
    if (!precisaCpf && !precisaVeiculo) {
      setChecked(true);
      return;
    }

    setIsOpen(true);

    // Define etapa inicial baseada na necessidade
    if (precisaCpf) {
      setStep(1); // Começa do CPF
    } else if (precisaVeiculo) {
      setStep(4); // Vai direto para cadastro de veículo
    }

    setChecked(true);
  }, [user, loading, checked]);

  // ==================== NAVEGAÇÃO ====================
  const startOnboarding = useCallback(() => {
    setIsOpen(true);
    setStep(1);
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => {
      if (isVeiculoOnlyFlow) {
        return 4; // Fluxo apenas veículo
      }

      if (prev === 3) {
        // Após termos, verifica se precisa de veículo
        if (user?.veiculoCadastrado === false) {
          return 4; // Vai para etapa de veículo
        }
        // Se não precisa, fecha modal
        setIsOpen(false);
        return 1;
      }

      if (prev === 4) {
        // Após veículo, fecha modal
        setIsOpen(false);
        return 1;
      }

      return prev + 1;
    });
  }, [user, isVeiculoOnlyFlow]);

  const prevStep = useCallback(() => {
    if (isVeiculoOnlyFlow) return;
    setStep((prev) => Math.max(prev - 1, 1));
  }, [isVeiculoOnlyFlow]);

  // ==================== HANDLERS DE DADOS ====================
  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...newData,
    }));
  }, []);

  // ==================== SUBMIT CADASTRO DE USUÁRIO ====================
  const submit = useCallback(async () => {
    try {
      await api.post('/petrocarga/auth/completarCadastro', data);

      await refreshUser();

      toast.success('Cadastro completo com sucesso!');

      if (user?.veiculoCadastrado === false) {
        setStep(4);
        return;
      }

      setIsOpen(false);
      setStep(1);
    } catch (error: unknown) {
      console.error('Erro ao completar onboarding', error);

      let mensagem = 'Erro ao completar cadastro';

      if (error instanceof AxiosError) {
        const data = error.response?.data as ApiError;
        mensagem = data?.erro || data?.message || mensagem;
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

        setIsOpen(false);
        setStep(1);
      } catch (error: unknown) {
        console.error('Erro ao cadastrar veículo', error);

        let mensagem = 'Erro ao cadastrar veículo';

        if (error instanceof AxiosError) {
          const data = error.response?.data as ApiError;
          mensagem = data?.erro || data?.message || mensagem;
        }

        toast.error(mensagem);
        throw error;
      }
    },
    [refreshUser, user],
  );

  // ==================== RESET E CLOSE ====================
  const reset = useCallback(() => {
    setData({
      cpf: '',
      telefone: '',
      senha: '',
      aceitarTermos: false,
      tipoCnh: '',
      numeroCnh: '',
      dataValidadeCnh: '',
    });
    setStep(1);
    setIsOpen(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ==================== MEMOIZED VALUE ====================
  const value = useMemo(
    () => ({
      isOpen,
      step,
      data,
      isVeiculoOnlyFlow,
      startOnboarding,
      nextStep,
      prevStep,
      updateData,
      submit,
      submitVeiculo,
      reset,
      close,
    }),
    [
      isOpen,
      step,
      data,
      isVeiculoOnlyFlow,
      startOnboarding,
      nextStep,
      prevStep,
      updateData,
      submit,
      submitVeiculo,
      reset,
      close,
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