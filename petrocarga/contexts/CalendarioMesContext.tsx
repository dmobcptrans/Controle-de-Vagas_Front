'use client';

import { createContext, useContext, useState, useCallback } from 'react';

// ============================================================================
// TIPOS
// ============================================================================

interface CalendarioMesContextValue {
  ano: number;
  mes: number; // 0-indexed
  irMesAnterior: () => void;
  irProximoMes: () => void;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const CalendarioMesContext = createContext<CalendarioMesContextValue | null>(null);

export function CalendarioMesProvider({ children }: { children: React.ReactNode }) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());

  const irMesAnterior = useCallback(() => {
    if (mes === 0) { setMes(11); setAno(a => a - 1); }
    else setMes(m => m - 1);
  }, [mes]);

  const irProximoMes = useCallback(() => {
    if (mes === 11) { setMes(0); setAno(a => a + 1); }
    else setMes(m => m + 1);
  }, [mes]);

  return (
    <CalendarioMesContext.Provider value={{ ano, mes, irMesAnterior, irProximoMes }}>
      {children}
    </CalendarioMesContext.Provider>
  );
}

export function useCalendarioMes() {
  const ctx = useContext(CalendarioMesContext);
  if (!ctx) throw new Error('useCalendarioMes deve ser usado dentro de CalendarioMesProvider');
  return ctx;
}
