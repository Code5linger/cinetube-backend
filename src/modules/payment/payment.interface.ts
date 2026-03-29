import type {
  SubscriptionPlan,
  TitleAccessType,
} from '../../generated/prisma/index.js';

export interface ICreateCheckoutSessionPayload {
  plan: SubscriptionPlan;
}

export interface ICreateTitleCheckoutPayload {
  mediaId: string;
  accessType: TitleAccessType;
}
