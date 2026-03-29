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

export const parseOptionalFloat = (
  value: unknown,
  fieldName: string,
): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new AppError(`${fieldName} must be a number`, 422);
  }
  return n;
};

export const parsePagination = (
  pageRaw: unknown,
  limitRaw: unknown,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {},
) => {
  const maxLimit = defaults.maxLimit ?? 100;
  const defaultLimit = Math.min(defaults.limit ?? 20, maxLimit);
  const defaultPage = defaults.page ?? 1;

  let page = defaultPage;
  let limit = defaultLimit;

  if (pageRaw !== undefined && pageRaw !== null && pageRaw !== '') {
    page = Math.max(1, parseInteger(pageRaw, 'page'));
  }
  if (limitRaw !== undefined && limitRaw !== null && limitRaw !== '') {
    limit = Math.min(
      maxLimit,
      Math.max(1, parseInteger(limitRaw, 'limit')),
    );
  }

  return { page, limit, skip: (page - 1) * limit };
};
