import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { auth } from './lib/auth.js';
import { toNodeHandler } from 'better-auth/node';
import { rootRouter } from './app/routes/index.js';
import { PaymentController } from './modules/payment/payment.controller.js';

const app: Application = express();

app.all('/api/better-auth/*splat', toNodeHandler(auth));

app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook,
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.send('CineTube API is running');
});

app.use('/api', rootRouter);
