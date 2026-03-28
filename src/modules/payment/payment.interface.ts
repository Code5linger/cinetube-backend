import { SubscriptionPlan } from '../../generated/prisma/index.js';

export interface ICreateCheckoutSessionPayload {
  plan: SubscriptionPlan;
}
