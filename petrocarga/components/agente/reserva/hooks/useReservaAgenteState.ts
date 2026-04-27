'use client';

import { useState, useEffect } from 'react';
import { Veiculo } from '@/lib/types/veiculo';

const STORAGE_KEY = 'reserva_agente_defaults';

interface ReservaAgenteDefaults {
  tipoVeiculo: Veiculo['tipo'] | null;
  placa: string;
  cidadeOrigem: string;
  entradaCidade: string;
  mostrarDadosRota: boolean;
}

const DEFAULT_STATE: ReservaAgenteDefaults = {
  tipoVeiculo: null,
  placa: '',
  cidadeOrigem: '',
  entradaCidade: '',
  mostrarDadosRota: false,
};

function loadFromStorage(): ReservaAgenteDefaults {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveToStorage(data: ReservaAgenteDefaults) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

export function useReservaAgenteState() {
  const [defaults, setDefaults] = useState<ReservaAgenteDefaults>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setDefaults(loadFromStorage());
    setHydrated(true);
  }, []);

  const updateField = <K extends keyof ReservaAgenteDefaults>(
    key: K,
    value: ReservaAgenteDefaults[K],
  ) => {
    setDefaults((prev) => {
      const next = { ...prev, [key]: value };
      saveToStorage(next);
      return next;
    });
  };

  const clearDefaults = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setDefaults(DEFAULT_STATE);
  };

  return {
    defaults,
    hydrated,
    updateField,
    clearDefaults,
  };
}