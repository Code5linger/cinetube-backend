import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../../utils/http.js';
import { PaymentService } from './payment.service.js';
// import { stripe } from '../../config/stripe.js';
import { config } from '../../config/config.js';
import {
  ICreateCheckoutSessionPayload,
  ICreateTitleCheckoutPayload,
} from './payment.interface.js';
// import {
//   SubscriptionPlan,
//   TitleAccessType,
// } from '../../generated/prisma/index.js';
import { stripe } from '../../config/stripe.js';
import {
  SubscriptionPlan,
  TitleAccessType,
} from '../../generated/prisma/index.js';

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

const createTitleCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { mediaId, accessType } = req.body as ICreateTitleCheckoutPayload;

    if (!mediaId || !accessType) {
      throw new AppError('mediaId and accessType are required', 422);
    }

    if (!Object.values(TitleAccessType).includes(accessType)) {
      throw new AppError(
        `accessType must be one of: ${Object.values(TitleAccessType).join(', ')}`,
        422,
      );
    }

    const result = await PaymentService.createTitleCheckoutSession(
      req.user!.id,
      mediaId,
      accessType,
    );
    res.status(201).json({
      success: true,
      message: 'Title checkout session created successfully',
      data: result,
    });
  },
);

// Raw body required — express.json() must NOT run before this
const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  // DEBUG — remove after fixing
  console.log('webhook hit');
  console.log('content-type:', req.headers['content-type']);
  console.log('body type:', typeof req.body);
  console.log('body is Buffer:', Buffer.isBuffer(req.body));
  console.log('signature present:', !!signature);

  if (!signature) {
    res.status(400).json({ message: 'Missing Stripe signature' });
    return;
  }

  let event;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      config.STRIPE.WEBHOOK_SECRET,
    );
  } catch (err) {
    // DEBUG
    console.error('constructEvent failed:', err);
    console.error('body preview:', req.body?.toString?.().slice(0, 200));
    res.status(400).json({ message: 'Invalid Stripe webhook signature' });
    return;
  }

  // ... rest unchanged
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

const getMyTitleEntitlements = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await PaymentService.getMyTitleEntitlements(req.user!.id);
    res.json({
      success: true,
      message: 'Your purchases and rentals fetched successfully',
      data: result,
    });
  },
);

const getAllTitleEntitlements = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await PaymentService.getAllTitleEntitlements();
    res.json({
      success: true,
      message: 'All title entitlements fetched successfully',
      data: result,
    });
  },
);

export const PaymentController = {
  createCheckoutSession,
  createTitleCheckoutSession,
  handleStripeWebhook,
  getMyPayments,
  getMySubscription,
  getAllPayments,
  getMyTitleEntitlements,
  getAllTitleEntitlements,
};
