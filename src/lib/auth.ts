import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js';
import { config } from '../config/config.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  secret: config.BETTER_AUTH_SECRET,

  baseURL: config.BETTER_AUTH_URL,
  basePath: '/api/better-auth',

  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://cinetube-frontend-5zoh.vercel.app',
  ],

  session: {
    expiresIn: Number(config.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN),
    updateAge: Number(config.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE),

    cookieOptions: {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'CineTube <onboarding@resend.dev>', // ← use this for testing
          to: user.email,
          subject: 'Reset your password',
          html: `<p>Reset your password:</p><a href="${url}">${url}</a>`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Resend error:', err); // check Vercel runtime logs
        throw new Error('Failed to send email');
      }
    },
  },

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
      accountStatus: { type: 'string', defaultValue: 'ACTIVE' },
    },
  },
});
