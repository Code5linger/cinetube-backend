import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
  EMAIL_SENDER: {
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_FROM: string;
  };
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  FRONTEND_URL: string;
  CLOUDINARY: {
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
  };
  STRIPE: {
    SECRET_KEY: string;
    WEBHOOK_SECRET: string;
    CURRENCY: string;
    PREMIUM_PRICE_USD: number;
  };
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
}

const requireEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN',
  'BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE',
  'EMAIL_SENDER_SMTP_USER',
  'EMAIL_SENDER_SMTP_PASS',
  'EMAIL_SENDER_SMTP_HOST',
  'EMAIL_SENDER_SMTP_PORT',
  'EMAIL_SENDER_SMTP_FROM',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPER_ADMIN_EMAIL',
  'SUPER_ADMIN_PASSWORD',
];

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 5000;
};

const parseAmount = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? Number(parsed.toFixed(2))
    : fallback;
};

const loadConfig = (): EnvConfig => {
  const missing = requireEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join('\n  ')}`,
    );
  }

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: parsePort(process.env.PORT),
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env
      .BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as string,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env
      .BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
    },
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    CLOUDINARY: {
      CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      API_KEY: process.env.CLOUDINARY_API_KEY as string,
      API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
    STRIPE: {
      SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
      WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
      CURRENCY: (process.env.STRIPE_CURRENCY || 'usd').toLowerCase(),
      PREMIUM_PRICE_USD: parseAmount(process.env.PREMIUM_PRICE_USD, 9.99),
    },
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
  };
};

export const config = loadConfig();
