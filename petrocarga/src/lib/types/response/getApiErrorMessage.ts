import { ApiError } from './ApiError';

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as Partial<ApiError>;

    if (typeof apiError.message === 'string' && apiError.message) {
      return apiError.message;
    }
  }

  return fallback;
}