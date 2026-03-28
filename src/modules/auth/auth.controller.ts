import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/http.js';
import { AuthService } from './auth.service.js';
import {
  IChangePasswordPayload,
  ILoginPayload,
  IRegisterPayload,
} from './auth.interface.js';

const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body as IRegisterPayload);
  res.status(201).json({
    success: true,
    message: 'Registered successfully. Please verify your email.',
    data: result,
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body as ILoginPayload);
  res.json({
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.getMe(req.user!.id);
  res.json({
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const sessionToken = req.cookies['better-auth.session_token'] as string;
  if (!sessionToken) {
    res.status(401).json({ success: false, message: 'Session token missing' });
    return;
  }
  await AuthService.changePassword(
    req.body as IChangePasswordPayload,
    sessionToken,
  );
  res.json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

const forgetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  await AuthService.forgetPassword(email);
  res.json({
    success: true,
    message: 'Password reset link sent to your email',
    data: null,
  });
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as {
    token: string;
    newPassword: string;
  };
  await AuthService.resetPassword(token, newPassword);
  res.json({
    success: true,
    message: 'Password reset successfully',
    data: null,
  });
});

const promoteToAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.promoteToAdmin(String(req.params.userId));
  res.json({
    success: true,
    message: 'User promoted to admin successfully',
    data: result,
  });
});

export const AuthController = {
  register,
  login,
  getMe,
  changePassword,
  forgetPassword,
  resetPassword,
  promoteToAdmin,
};
