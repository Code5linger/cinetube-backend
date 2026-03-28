import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { Role } from '../../generated/prisma/index.js';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forget-password', AuthController.forgetPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/me', requireAuth, AuthController.getMe);
router.post('/change-password', requireAuth, AuthController.changePassword);

// Admin only
router.patch(
  '/promote/:userId',
  requireAuth,
  requireRole(Role.ADMIN),
  AuthController.promoteToAdmin,
);

export const AuthRoutes = router;
