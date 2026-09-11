import { ApiError } from "./ApiError";

export function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;

    return (
      apiError.erro ??
      apiError.message ??
      apiError.cause ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}