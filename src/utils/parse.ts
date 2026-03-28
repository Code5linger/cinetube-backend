import { AppError } from './http.js';

export const parseStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value))
    return value
      .filter(Boolean)
      .map((v) => String(v).trim())
      .filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

export const parseInteger = (value: unknown, fieldName: string): number => {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new AppError(`${fieldName} must be an integer`, 422);
  }
  return n;
};
