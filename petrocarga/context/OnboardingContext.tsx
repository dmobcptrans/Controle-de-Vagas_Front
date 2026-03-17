'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  use,
} from 'react';
import { api } from '@/service/api';
import { useAuth } from '@/context/AuthContext';

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

  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  submit: () => Promise<void>;
  reset: () => void;
  close: () => void;
}

const OnboardingContext = createContext({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const { user,refreshUser } = useAuth(); 

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
    if (user && !user.cpf) {
      setIsOpen(true);
      setStep(1);
    }
  }, [user]);

  const startOnboarding = useCallback(() => {
    setIsOpen(true);
    setStep(1);
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

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

      setIsOpen(false);
      setStep(1);

    } catch (error) {
      console.error('Erro ao completar onboarding', error);
      throw new Error('Erro ao completar cadastro');
    }
  }, [data, refreshUser]);

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
      startOnboarding,
      nextStep,
      prevStep,
      updateData,
      submit,
      reset,
      close,
    }),
    [isOpen, step, data, startOnboarding, nextStep, prevStep, updateData, submit, reset, close],
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