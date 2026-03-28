import { prisma } from '../../lib/prisma.js';
import { auth } from '../../lib/auth.js';
import { AppError } from '../../utils/http.js';
import {
  IChangePasswordPayload,
  ILoginPayload,
  IRegisterPayload,
} from './auth.interface.js';
import { Role } from '../../generated/prisma/index.js';

const register = async (payload: IRegisterPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  if (!data.user) {
    throw new AppError('Failed to register user', 400);
  }

  return data;
};

const login = async (payload: ILoginPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: { email, password },
  });

  if (!data.user) {
    throw new AppError('Invalid credentials', 401);
  }

  return data;
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new AppError('User not found', 404);
  return user;
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: { authorization: `Bearer ${sessionToken}` },
  });

  if (!session) throw new AppError('Invalid session', 401);

  await auth.api.changePassword({
    body: {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      revokeOtherSessions: true,
    },
    headers: { authorization: `Bearer ${sessionToken}` },
  });
};

const forgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);

  await auth.api.sendVerificationEmail({
    body: { email },
  });
};

const resetPassword = async (token: string, newPassword: string) => {
  await auth.api.resetPassword({
    body: { token, newPassword },
  });
};

const promoteToAdmin = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  return prisma.user.update({
    where: { id: userId },
    data: { role: Role.ADMIN },
    select: { id: true, name: true, email: true, role: true },
  });
};

export const AuthService = {
  register,
  login,
  getMe,
  changePassword,
  forgetPassword,
  resetPassword,
  promoteToAdmin,
};
