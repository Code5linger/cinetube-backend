import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ReviewController } from './review.controller.js';
import { Role } from '../../generated/prisma/index.js';

const router = Router();

// Public
router.get('/', ReviewController.getAllReviews);

// Admin only
router.get(
  '/pending',
  requireAuth,
  requireRole(Role.ADMIN),
  ReviewController.getPendingReviews,
);
router.patch(
  '/:id/approve',
  requireAuth,
  requireRole(Role.ADMIN),
  ReviewController.approveReview,
);
router.patch(
  '/:id/unpublish',
  requireAuth,
  requireRole(Role.ADMIN),
  ReviewController.unpublishReview,
);

// User
router.post('/', requireAuth, ReviewController.createReview);
router.patch('/:id', requireAuth, ReviewController.updateReview);
router.delete('/:id', requireAuth, ReviewController.deleteReview);
router.post('/:id/like', requireAuth, ReviewController.toggleLike);
router.post('/:id/comments', requireAuth, ReviewController.createComment);

export const ReviewRoutes = router;
