export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Helper pour convertir n'importe quelle erreur en ApiError
 */
export function asApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return error as ApiError;
  }

  return new Error(
    typeof error === 'string' ? error : 'Une erreur inconnue est survenue',
  ) as ApiError;
}
