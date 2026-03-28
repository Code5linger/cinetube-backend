import { prisma } from '../../lib/prisma.js';

const getWatchlist = async (userId: string) => {
  return prisma.watchlist.findMany({
    where: { userId },
    include: { media: true },
    orderBy: { createdAt: 'desc' },
  });
};

const addToWatchlist = async (userId: string, mediaId: string) => {
  return prisma.watchlist.upsert({
    where: { userId_mediaId: { userId, mediaId } },
    create: { userId, mediaId },
    update: {},
  });
};

const removeFromWatchlist = async (userId: string, mediaId: string) => {
  await prisma.watchlist.delete({
    where: { userId_mediaId: { userId, mediaId } },
  });
};

export const WatchlistService = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
