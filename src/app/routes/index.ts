import { Router } from 'express';
import { MediaRoutes } from '../../modules/media/media.routes.js';

const router = Router();

router.use('/media', MediaRoutes);

// future routes:
// router.use('/reviews', ReviewRoutes);
// router.use('/users', UserRoutes);

export const rootRouter = router;
