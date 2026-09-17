'use client';

import { useCallback, useState } from 'react';

import { ApiError } from '@/lib/types/response/ApiError';

interface UseApiReturn {
  loading: boolean;
  error: string | null;
  execute: <T>(request: () => Promise<T>) => Promise<T | null>;
  limparError: () => void;
}

export function useApi(): UseApiReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <T>(request: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        return await request();
      } catch (error) {
        const apiError = error as ApiError;

        setError(
          apiError.message ?? 'Ocorreu um erro na requisição.',
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const limparError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    limparError,
  };
}