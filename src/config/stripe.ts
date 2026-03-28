import Stripe from 'stripe';
import { config } from './config.js';

export const stripe = new Stripe(config.STRIPE.SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
});
