import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/http.js';
import { WatchlistService } from './watchlist.service.js';

const getWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const items = await WatchlistService.getWatchlist(req.user!.id);
  res.json({
    success: true,
    message: 'Watchlist retrieved successfully',
    data: items,
  });
});

const addToWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const item = await WatchlistService.addToWatchlist(
    req.user!.id,
    String(req.params.mediaId),
  );
  res
    .status(201)
    .json({ success: true, message: 'Added to watchlist', data: item });
});

const removeFromWatchlist = asyncHandler(
  async (req: Request, res: Response) => {
    await WatchlistService.removeFromWatchlist(
      req.user!.id,
      String(req.params.mediaId),
    );
    res.json({ success: true, message: 'Removed from watchlist', data: null });
  },
);

export const WatchlistController = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
