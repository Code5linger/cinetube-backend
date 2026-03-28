import { Router } from 'express';
import { mediaRouter } from '../../modules/media/media.routes.js';

export const rootRouter = Router();

rootRouter.use('/media', mediaRouter);

// Register future routers here:
// rootRouter.use('/reviews', reviewRouter);
// rootRouter.use('/users', userRouter);
// rootRouter.use('/payments', paymentRouter);
