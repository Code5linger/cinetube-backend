import Stripe from 'stripe';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/http.js';
// import { stripe } from '../../config/stripe.js';
import { config } from '../../config/config.js';
import {
  PaymentStatus,
  SubscriptionPlan,
} from '../../generated/prisma/index.js';
import { stripe } from '../../config/stripe.js';

const createCheckoutSession = async (
  userId: string,
  plan: SubscriptionPlan,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const isMonthly = plan === SubscriptionPlan.MONTHLY;
  const amount = isMonthly
    ? config.STRIPE.PREMIUM_PRICE_USD
    : config.STRIPE.PREMIUM_PRICE_USD * 12 * 0.8; // 20% discount for yearly

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: config.STRIPE.CURRENCY,
          product_data: {
            name: `CineTube ${plan.toLowerCase()} subscription`,
            description: isMonthly
              ? 'Monthly premium access to all content'
              : 'Yearly premium access — 20% off',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      plan,
    },
    success_url: `${config.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.FRONTEND_URL}/payment/cancelled`,
  });

  // Create pending payment record
  await prisma.payment.create({
    data: {
      userId,
      plan,
      amount,
      currency: config.STRIPE.CURRENCY,
      gateway: 'stripe',
      gatewayTxnId: session.id,
      status: PaymentStatus.PENDING,
    },
  });

  return { url: session.url, sessionId: session.id };
};

const handleStripeWebhook = async (event: Stripe.Event) => {
  // Idempotency check — skip already processed events
  const existing = await prisma.payment.findFirst({
    where: { gatewayTxnId: event.id },
  });

  if (existing?.status === PaymentStatus.PAID) {
    console.log(`Event ${event.id} already processed. Skipping.`);
    return { message: `Event ${event.id} already processed` };
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as SubscriptionPlan;

      if (!userId || !plan) {
        console.error('Missing userId or plan in session metadata');
        return { message: 'Missing metadata' };
      }

      const isPaid = session.payment_status === 'paid';

      await prisma.$transaction(async (tx) => {
        // Update payment record
        await tx.payment.updateMany({
          where: { gatewayTxnId: session.id },
          data: {
            status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
            gatewayTxnId: event.id,
          },
        });

        if (isPaid) {
          const now = new Date();
          const endDate = new Date(now);

          if (plan === SubscriptionPlan.MONTHLY) {
            endDate.setMonth(endDate.getMonth() + 1);
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          // Upsert subscription
          await tx.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan,
              status: PaymentStatus.PAID,
              startDate: now,
              endDate,
            },
            update: {
              plan,
              status: PaymentStatus.PAID,
              startDate: now,
              endDate,
            },
          });
        }
      });

      console.log(`Processed checkout.session.completed for user ${userId}`);
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;

      await prisma.payment.updateMany({
        where: { gatewayTxnId: session.id },
        data: { status: PaymentStatus.FAILED },
      });

      console.log(
        `Checkout session ${session.id} expired — payment marked failed`,
      );
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;

      await prisma.payment.updateMany({
        where: { gatewayTxnId: intent.id },
        data: { status: PaymentStatus.FAILED },
      });

      console.log(`Payment intent ${intent.id} failed`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { message: `Webhook event ${event.id} processed successfully` };
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

const getMySubscription = async (userId: string) => {
  return prisma.subscription.findUnique({
    where: { userId },
  });
};

const getAllPayments = async () => {
  return prisma.payment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const PaymentService = {
  createCheckoutSession,
  handleStripeWebhook,
  getMyPayments,
  getMySubscription,
  getAllPayments,
};
