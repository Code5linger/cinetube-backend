import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { AdminController } from './admin.controller.js';
import { Role } from '../../generated/prisma/index.js';

const router = Router();

// All admin routes require auth + ADMIN role
router.use(requireAuth, requireRole(Role.ADMIN));

// Dashboard & analytics
router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics/media', AdminController.getMediaAnalytics);

// User management
router.get('/users', AdminController.getAllUsers);
router.delete('/users/:userId', AdminController.deleteUser);
router.patch('/users/change-status', AdminController.changeUserStatus);
router.patch('/users/change-role', AdminController.changeUserRole);

// Review moderation
router.patch('/reviews/:id/approve', AdminController.approveReview);
router.patch('/reviews/:id/unpublish', AdminController.unpublishReview);
router.delete('/reviews/:id', AdminController.deleteReview);

export const AdminRoutes = router;
