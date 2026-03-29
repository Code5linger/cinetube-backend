import Stripe from 'stripe';
import type { Prisma } from '../../generated/prisma/index.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/http.js';
import { config } from '../../config/config.js';
import {
  PaymentStatus,
  PricingType,
  SubscriptionPlan,
  TitleAccessType,
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
    : config.STRIPE.PREMIUM_PRICE_USD * 12 * 0.8;

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
      kind: 'subscription',
      userId,
      plan,
    },
    success_url: `${config.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.FRONTEND_URL}/payment/cancelled`,
  });

  await prisma.payment.create({
    data: {
      userId,
      plan,
      amount,
      currency: config.STRIPE.CURRENCY,
      gateway: 'stripe',
      checkoutSessionId: session.id,
      gatewayTxnId: session.id,
      status: PaymentStatus.PENDING,
    },
  });

  return { url: session.url, sessionId: session.id };
};

const createTitleCheckoutSession = async (
  userId: string,
  mediaId: string,
  accessType: TitleAccessType,
) => {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new AppError('Media not found', 404);

  if (media.pricingType === PricingType.FREE) {
    throw new AppError('This title is free; no purchase required', 422);
  }

  const amount =
    accessType === TitleAccessType.PURCHASE
      ? media.purchasePrice
      : media.rentalPrice;

  if (amount == null || amount <= 0) {
    throw new AppError(
      'Price not configured for this access type on this title',
      422,
    );
  }

  const label =
    accessType === TitleAccessType.PURCHASE
      ? 'Purchase'
      : `Rent (${media.rentalDurationDays} days)`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: config.STRIPE.CURRENCY,
          product_data: {
            name: `${media.title} — ${label}`,
            description: `CineTube ${label.toLowerCase()}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      kind: 'title',
      userId,
      mediaId,
      accessType,
    },
    success_url: `${config.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.FRONTEND_URL}/payment/cancelled`,
  });

  await prisma.titleEntitlement.create({
    data: {
      userId,
      mediaId,
      accessType,
      amount,
      currency: config.STRIPE.CURRENCY,
      status: PaymentStatus.PENDING,
      checkoutSessionId: session.id,
    },
  });

  return { url: session.url, sessionId: session.id };
};

async function fulfillSubscriptionCheckout(
  tx: Prisma.TransactionClient,
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as SubscriptionPlan;
  if (!userId || !plan) {
    console.error('Subscription checkout: missing userId or plan');
    return;
  }

  const pay = await tx.payment.findFirst({
    where: {
      OR: [
        { checkoutSessionId: session.id },
        { gatewayTxnId: session.id },
      ],
    },
  });

  if (!pay) {
    console.error(`No payment row for session ${session.id}`);
    return;
  }

  if (
    pay.stripeWebhookEventId === eventId &&
    pay.status === PaymentStatus.PAID
  ) {
    return;
  }

  const isPaid = session.payment_status === 'paid';

  await tx.payment.update({
    where: { id: pay.id },
    data: {
      status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      stripeWebhookEventId: eventId,
      checkoutSessionId: session.id,
    },
  });

  if (!isPaid) return;

  const now = new Date();
  const endDate = new Date(now);
  if (plan === SubscriptionPlan.MONTHLY) {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

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

async function fulfillTitleCheckout(
  tx: Prisma.TransactionClient,
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const userId = session.metadata?.userId;
  const mediaId = session.metadata?.mediaId;
  const accessType = session.metadata?.accessType as TitleAccessType;

  if (
    !userId ||
    !mediaId ||
    !accessType ||
    !Object.values(TitleAccessType).includes(accessType)
  ) {
    console.error('Title checkout: invalid metadata');
    return;
  }

  const ent = await tx.titleEntitlement.findFirst({
    where: { checkoutSessionId: session.id },
  });

  if (!ent) {
    console.error(`No TitleEntitlement for session ${session.id}`);
    return;
  }

  if (
    ent.stripeWebhookEventId === eventId &&
    ent.status === PaymentStatus.PAID
  ) {
    return;
  }

  const isPaid = session.payment_status === 'paid';

  if (!isPaid) {
    await tx.titleEntitlement.update({
      where: { id: ent.id },
      data: { status: PaymentStatus.PENDING },
    });
    return;
  }

  const media = await tx.media.findUnique({ where: { id: mediaId } });
  const now = new Date();
  let expiresAt: Date | null = null;
  if (accessType === TitleAccessType.RENTAL && media) {
    expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + media.rentalDurationDays);
  }

  await tx.titleEntitlement.update({
    where: { id: ent.id },
    data: {
      status: PaymentStatus.PAID,
      stripeWebhookEventId: eventId,
      expiresAt,
    },
  });
}

const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const kind = session.metadata?.kind ?? 'subscription';

      await prisma.$transaction(async (tx) => {
        if (kind === 'title') {
          await fulfillTitleCheckout(tx, session, event.id);
        } else {
          await fulfillSubscriptionCheckout(tx, session, event.id);
        }
      });

      console.log(`checkout.session.completed (${kind}) processed`);
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;

      await prisma.payment.updateMany({
        where: {
          OR: [
            { checkoutSessionId: session.id },
            { gatewayTxnId: session.id },
          ],
        },
        data: { status: PaymentStatus.FAILED },
      });

      await prisma.titleEntitlement.updateMany({
        where: { checkoutSessionId: session.id },
        data: { status: PaymentStatus.FAILED },
      });

      console.log(`Checkout session ${session.id} expired`);
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: { gatewayTxnId: intent.id },
        data: { status: PaymentStatus.FAILED },
      });
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

const getMyTitleEntitlements = async (userId: string) => {
  return prisma.titleEntitlement.findMany({
    where: { userId, status: PaymentStatus.PAID },
    include: {
      media: {
        select: {
          id: true,
          title: true,
          streamUrl: true,
          posterUrl: true,
          pricingType: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
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

const getAllTitleEntitlements = async () => {
  return prisma.titleEntitlement.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      media: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const PaymentService = {
  createCheckoutSession,
  createTitleCheckoutSession,
  handleStripeWebhook,
  getMyPayments,
  getMySubscription,
  getMyTitleEntitlements,
  getAllPayments,
  getAllTitleEntitlements,
};
