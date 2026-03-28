import { Router } from 'express';
import { MediaRoutes } from '../../modules/media/media.routes.js';
import { WatchlistRoutes } from '../../modules/watchlist/watchlist.routes.js';
import { AuthRoutes } from '../../modules/auth/auth.routes.js';
import { ReviewRoutes } from '../../modules/review/review.routes.js';
import { AdminRoutes } from '../../modules/admin/admin.routes.js';

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/media', MediaRoutes);
router.use('/watchlist', WatchlistRoutes);
router.use('/reviews', ReviewRoutes);
router.use('/admin', AdminRoutes);

export const rootRouter = router;
