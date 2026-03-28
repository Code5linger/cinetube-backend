import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { PaymentController } from './payment.controller.js';
import { Role } from '../../generated/prisma/index.js';

const router = Router();

// Webhook — must use raw body, registered BEFORE express.json()
// This is mounted separately in app.ts
router.post('/webhook', PaymentController.handleStripeWebhook);

// User routes
router.post('/checkout', requireAuth, PaymentController.createCheckoutSession);
router.get('/my-payments', requireAuth, PaymentController.getMyPayments);
router.get(
  '/my-subscription',
  requireAuth,
  PaymentController.getMySubscription,
);

// Admin routes
router.get(
  '/all',
  requireAuth,
  requireRole(Role.ADMIN),
  PaymentController.getAllPayments,
);

export const PaymentRoutes = router;
