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

interface OnboardingData {
  cpf: string;
  telefone: string;
  senha: string;
  aceitarTermos: boolean;
  tipoCnh: string;
  numeroCnh: string;
  dataValidadeCnh: string;
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
  submitVeiculo: (veiculoData: any) => Promise<void>;

  reset: () => void;
  close: () => void;
}

const OnboardingContext = createContext({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const { user, refreshUser } = useAuth();
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

  useEffect(() => {
    if (!user) return;

    const precisaCpf = !user.cpf;
    const precisaVeiculo = user.veiculoCadastrado === false;

    if (!precisaCpf && !precisaVeiculo) return;

    setIsOpen(true);

    if (precisaCpf) {
      setStep(1);
      return;
    }

    if (precisaVeiculo) {
      setStep(4);
      return;
    }
  }, [user]);

  const startOnboarding = useCallback(() => {
    setIsOpen(true);
    setStep(1);
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => {
      if (isVeiculoOnlyFlow) {
        return 4;
      }

      if (prev === 3) {
        if (user?.veiculoCadastrado === false) {
          return 4;
        }

        setIsOpen(false);
        return 1;
      }

      if (prev === 4) {
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

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...newData,
    }));
  }, []);

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
    } catch (error: any) {
      console.error('Erro ao completar onboarding', error);

      const mensagem =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Erro ao completar cadastro';

      toast.error(mensagem);

      throw error;
    }
  }, [data, refreshUser, user]);

  const submitVeiculo = useCallback(
    async (veiculoData: any) => {
      try {
        const { cpfProprietario, cnpjProprietario, tipoProprietario, ...rest } = veiculoData;

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
      } catch (error: any) {
        console.error('Erro ao cadastrar veículo', error);

        const mensagem =
          error?.response?.data?.erro ||
          error?.response?.data?.message ||
          'Erro ao cadastrar veículo';

        toast.error(mensagem);

        throw error;
      }
    },
    [refreshUser, user]
  );
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
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding deve ser usado dentro do OnboardingProvider');
  }

  return context;
}