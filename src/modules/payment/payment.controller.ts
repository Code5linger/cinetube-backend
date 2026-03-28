import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../../utils/http.js';
import { PaymentService } from './payment.service.js';
// import { stripe } from '../../config/stripe.js';
import { config } from '../../config/config.js';
import { ICreateCheckoutSessionPayload } from './payment.interface.js';
import { SubscriptionPlan } from '../../generated/prisma/index.js';
import { stripe } from '../../config/stripe.js';

const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { plan } = req.body as ICreateCheckoutSessionPayload;

    if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
      throw new AppError(
        `plan must be one of: ${Object.values(SubscriptionPlan).join(', ')}`,
        422,
      );
    }

    const result = await PaymentService.createCheckoutSession(
      req.user!.id,
      plan,
    );
    res.status(201).json({
      success: true,
      message: 'Checkout session created successfully',
      data: result,
    });
  },
);

// Raw body required — express.json() must NOT run before this
const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({ message: 'Missing Stripe signature' });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      config.STRIPE.WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ message: 'Invalid Stripe webhook signature' });
    return;
  }

  try {
    const result = await PaymentService.handleStripeWebhook(event);
    res.json({ success: true, message: 'Webhook processed', data: result });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res
      .status(500)
      .json({ success: false, message: 'Webhook processing failed' });
  }
};

const getMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.getMyPayments(req.user!.id);
  res.json({
    success: true,
    message: 'Payment history fetched successfully',
    data: result,
  });
});

const getMySubscription = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.getMySubscription(req.user!.id);
  res.json({
    success: true,
    message: 'Subscription fetched successfully',
    data: result,
  });
});

const getAllPayments = asyncHandler(async (_req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments();
  res.json({
    success: true,
    message: 'All payments fetched successfully',
    data: result,
  });
});

export const PaymentController = {
  createCheckoutSession,
  handleStripeWebhook,
  getMyPayments,
  getMySubscription,
  getAllPayments,
};
