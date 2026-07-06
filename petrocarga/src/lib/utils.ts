import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// export interface AppError {
//   message: string;
//   code?: string;
//   statusCode?: number;
//   originalError?: unknown;
//   stack?: string;
//   timestamp?: Date;
// }
