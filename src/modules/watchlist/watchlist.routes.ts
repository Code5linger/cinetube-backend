import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { WatchlistController } from './watchlist.controller.js';

const router = Router();

// router.get('/', requireAuth, WatchlistController.getWatchlist);
router.get('/', WatchlistController.getWatchlist);
router.post('/:mediaId', requireAuth, WatchlistController.addToWatchlist);
router.delete(
  '/:mediaId',
  requireAuth,
  WatchlistController.removeFromWatchlist,
);

export const WatchlistRoutes = router;
