import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js';
import { config } from '../config/config.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
  session: {
    expiresIn: Number(config.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN),
    updateAge: Number(config.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE),
  },
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'USER' },
      avatarUrl: { type: 'string', required: false },
    },
  },
});
