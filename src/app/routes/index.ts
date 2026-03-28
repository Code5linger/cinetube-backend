import { Router } from 'express';
import { MediaRoutes } from '../../modules/media/media.routes.js';
import { WatchlistRoutes } from '../../modules/watchlist/watchlist.routes.js';

const router = Router();

router.use('/media', MediaRoutes);
router.use('/watchlist', WatchlistRoutes);

// future routes:
// router.use('/reviews', ReviewRoutes);
// router.use('/users', UserRoutes);

export const rootRouter = router;
